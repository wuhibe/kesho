import { cronRunTime } from "@/lib/cron";
import { todayIn } from "@/lib/delivery-date";
import { failureReport } from "@/lib/delivery-rules";
import { sendOpsEmail } from "@/lib/email";
import { undeliveredToday } from "@/lib/letters";

// Vercel Cron calls this daily at 09:00 UTC, after the last delivery run, with the CRON_SECRET
// bearer (SPEC §7 Failure report, vercel.json). It emails only when something is left undelivered.
export async function GET(request: Request): Promise<Response> {
  const now = cronRunTime(request);
  if (now instanceof Response) return now;

  const report = failureReport(await undeliveredToday(now), todayIn("UTC", now));
  if (report) await sendOpsEmail(report);
  console.info(`failure report: ${report ? report.subject : "nothing undelivered"}`);
  return Response.json({ sent: report !== null });
}
