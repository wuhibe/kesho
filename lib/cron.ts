import { runTime } from "@/lib/delivery-rules";

/**
 * The run time for a Vercel Cron request, or the Response that refuses it: no CRON_SECRET bearer,
 * or a `?now=` that isn't a date (SPEC §7 step 1).
 */
export function cronRunTime(request: Request): Date | Response {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return new Response("Unauthorized", { status: 401 });
  }
  const now = runTime(new URL(request.url).searchParams.get("now"));
  return now ?? new Response("?now= must be YYYY-MM-DD", { status: 400 });
}
