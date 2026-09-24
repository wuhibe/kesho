import { db } from "@/lib/db";
import { runDelivery } from "@/lib/delivery-run";
import { countScheduledLetters } from "@/lib/letters";

// The shutdown promise (SPEC §9): every Scheduled Letter is emailed early rather than lost, through
// the daily run's own path with the due filter ignored. Each run sends up to the day's budget, so
// run it once a day until none are left. Without --yes it only counts.
//   pnpm tsx --env-file=<target env file> scripts/deliver-all-now.ts [--yes]

const REQUIRED_ENV = ["DATABASE_URL", "LETTER_ENCRYPTION_KEY", "RESEND_API_KEY"];

const missing = REQUIRED_ENV.filter((name) => !process.env[name]);
// A send that throws costs each claimed Letter an attempt, so a half-pulled env file must not start a run.
if (missing.length > 0) throw new Error(`Set ${missing.join(", ")} first`);

if (process.argv.includes("--yes")) {
  console.info(await runDelivery(new Date(), "all"));
  console.info(`${await countScheduledLetters()} Scheduled Letters left; run again tomorrow if any.`);
} else {
  const database = new URL(process.env.DATABASE_URL ?? "").host;
  const recipients = process.env.VERCEL_ENV === "production" ? "their Authors" : "EMAIL_REDIRECT_TO";
  console.info(
    `${await countScheduledLetters()} Scheduled Letters in ${database} would go to ${recipients}, up to today's budget. Add --yes to send.`,
  );
}
await db.$disconnect();
