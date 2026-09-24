import type { ReactElement } from "react";
import { Resend, type WebhookEventPayload } from "resend";
import { routeEmail } from "@/lib/email-redirect";

export type Email = { subject: string; react: ReactElement };
export type DeliveryEmail = Email & { from: string };
/** What sending one delivery email came to; `error` is Resend's error name. */
export type SendResult = { ok: true; emailId: string } | { ok: false; isQuota: boolean; error: string };

// Resend renders `react` and derives the plain-text part itself (SPEC §8).
export async function sendAccountEmail(to: string, { subject, react }: Email): Promise<void> {
  const routed = routeEmail(to, subject);
  const { data, error } = await resend().emails.send({
    from: "Kesho <hello@mail.kesho.et>",
    replyTo: "hello@kesho.et",
    to: routed.to,
    subject: routed.subject,
    react,
  });
  // Error names only: Resend messages can echo the recipient address.
  if (error) throw new Error(`Resend rejected an account email: ${error.name}`);
  console.info(`account email sent: ${data.id}`);
}

/**
 * Sends one Letter's delivery email. The idempotency key turns a repeated send of the same
 * attempt into a no-op at Resend (SPEC §7 step 6). Failures are returned, not thrown, so the
 * run can apply its retry rules.
 */
export async function sendDeliveryEmail(
  to: string,
  { from, subject, react }: DeliveryEmail,
  idempotencyKey: string,
): Promise<SendResult> {
  const routed = routeEmail(to, subject);
  const { data, error } = await resend().emails.send(
    { from, replyTo: "hello@kesho.et", to: routed.to, subject: routed.subject, react },
    { idempotencyKey },
  );
  // Error names only: Resend messages can echo the recipient address.
  if (error) return { ok: false, isQuota: error.statusCode === 429, error: error.name };
  return { ok: true, emailId: data.id };
}

/** A Resend webhook's event and svix-id if its signature checks out against `secret`, else null. */
export function verifyWebhookEvent(
  payload: string,
  headers: Headers,
  secret: string,
): { id: string; event: WebhookEventPayload } | null {
  const { webhooks } = resend();
  const id = headers.get("svix-id") ?? "";
  try {
    const event = webhooks.verify({
      payload,
      headers: {
        id,
        timestamp: headers.get("svix-timestamp") ?? "",
        signature: headers.get("svix-signature") ?? "",
      },
      webhookSecret: secret,
    });
    return { id, event };
  } catch {
    return null;
  }
}

// Built per send so a missing key fails the send, not the build.
function resend(): Resend {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new Error("RESEND_API_KEY is not set");
  return new Resend(apiKey);
}
