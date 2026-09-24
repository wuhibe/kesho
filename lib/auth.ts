import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { after } from "next/server";
import { emailChangeEmail, passwordResetEmail, verificationEmail } from "@/emails/account";
import { db } from "@/lib/db";
import { type Email, sendAccountEmail } from "@/lib/email";

const HOUR_S = 60 * 60;

// A preview's own deployment and branch URLs are its origin, whatever BETTER_AUTH_URL says (SPEC §6).
const previewOrigins =
  process.env.VERCEL_ENV === "preview"
    ? [process.env.VERCEL_URL, process.env.VERCEL_BRANCH_URL].filter(Boolean).map((host) => `https://${host}`)
    : [];
const baseURL = previewOrigins[0] ?? process.env.BETTER_AUTH_URL;
// Without it, emailed links would be built from whatever host the request named.
if (!baseURL) throw new Error("BETTER_AUTH_URL is not set");

export const auth = betterAuth({
  appName: "Kesho",
  baseURL,
  trustedOrigins: previewOrigins,
  database: prismaAdapter(db, { provider: "postgresql" }),
  session: { expiresIn: 7 * 24 * HOUR_S },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    resetPasswordTokenExpiresIn: HOUR_S,
    revokeSessionsOnPasswordReset: true,
    sendResetPassword: async ({ user, url }) => sendAfterResponse(user.email, passwordResetEmail(url)),
  },
  emailVerification: {
    expiresIn: HOUR_S,
    sendOnSignUp: true,
    // Logging in unverified mails a fresh link: SPEC §3 "Log in and we'll send a fresh one."
    sendOnSignIn: true,
    autoSignInAfterVerification: true,
    // Only a signed-in, already verified Author can change email, so a verified user here
    // means the link is for a new address; sign-up and log-in links go to unverified users.
    sendVerificationEmail: async ({ user, url }) =>
      sendAfterResponse(user.email, user.emailVerified ? emailChangeEmail(url) : verificationEmail(url)),
  },
  user: {
    changeEmail: { enabled: true },
    deleteUser: { enabled: true },
  },
  rateLimit: {
    storage: "database",
    window: 60,
    max: 100,
    // Each of these sends an email (sign-in does when unverified), and Resend Free allows
    // 100 a day across all mail.
    customRules: {
      "/sign-in/email": { window: 60, max: 3 },
      "/sign-up/email": { window: 60, max: 3 },
      "/request-password-reset": { window: 60, max: 3 },
      "/send-verification-email": { window: 60, max: 3 },
    },
  },
});

// Every send runs after the response, so neither its timing nor a Resend failure can reveal
// whether an account exists (SPEC §6). Done here, not via `advanced.backgroundTasks`, because
// better-auth awaits /send-verification-email directly and rethrows its errors.
function sendAfterResponse(to: string, email: Email): void {
  after(() => sendAccountEmail(to, email));
}
