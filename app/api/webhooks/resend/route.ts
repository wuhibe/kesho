import { bounceOf } from "@/lib/delivery-rules";
import { verifyWebhookEvent } from "@/lib/email";
import { recordBounce } from "@/lib/letters";

// Resend posts email events here, in production only: only there is RESEND_WEBHOOK_SECRET set (SPEC §7, §10).
export async function POST(request: Request): Promise<Response> {
  const secret = process.env.RESEND_WEBHOOK_SECRET;
  if (!secret) return new Response("Not found", { status: 404 });
  const verified = verifyWebhookEvent(await request.text(), request.headers, secret);
  if (!verified) return new Response("Invalid signature", { status: 401 });

  const bounce = bounceOf(verified.event);
  const outcome = bounce ? await recordBounce(verified.id, bounce) : "done";
  // A 503 makes svix deliver the event again later.
  return new Response(null, { status: outcome === "retry" ? 503 : 204 });
}
