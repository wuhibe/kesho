import type { ReactElement } from "react";
import { Resend } from "resend";
import { routeEmail } from "@/lib/email-redirect";

export type Email = { subject: string; react: ReactElement };

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

// Built per send so a missing key fails the send, not the build.
function resend(): Resend {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new Error("RESEND_API_KEY is not set");
  return new Resend(apiKey);
}
