import { cronRunTime } from "@/lib/cron";
import { runDelivery } from "@/lib/delivery-run";

// Vercel Cron calls this daily at 06:00, 07:00 and 08:00 UTC with the CRON_SECRET bearer; the later
// runs retry what the first left (SPEC §7, vercel.json).
export async function GET(request: Request): Promise<Response> {
  const now = cronRunTime(request);
  if (now instanceof Response) return now;

  const summary = await runDelivery(now);
  console.info("delivery run", summary);
  return Response.json(summary);
}
