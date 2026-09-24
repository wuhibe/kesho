import { runTime } from "@/lib/delivery-rules";
import { runDelivery } from "@/lib/delivery-run";

// Vercel Cron calls this daily at 06:00 UTC with the CRON_SECRET bearer (SPEC §7, vercel.json).
export async function GET(request: Request): Promise<Response> {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return new Response("Unauthorized", { status: 401 });
  }
  const now = runTime(new URL(request.url).searchParams.get("now"));
  if (!now) return new Response("?now= must be YYYY-MM-DD", { status: 400 });

  const summary = await runDelivery(now);
  console.info("delivery run", summary);
  return Response.json(summary);
}
