import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { APIError, createAuthMiddleware, isAPIError } from "better-auth/api";
import { after } from "next/server";
import { emailChangeEmail, passwordResetEmail, verificationEmail } from "@/emails/account";
import { LETTER_CAP_CODE, LETTER_CAP_REACHED } from "@/lib/copy";
import { db } from "@/lib/db";
import { type Email, sendAccountEmail } from "@/lib/email";
import { type LetterInput, parseLetterInput } from "@/lib/letter-input";
import { scheduleVerifiedLetters, sealLetter } from "@/lib/letters";
import type { SealingAuthor } from "@/lib/seal-rules";

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
    afterEmailVerification: async (user) => scheduleVerifiedLetters(user.id),
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
      // Mails whatever address is typed in; better-auth's own default here is 3 per 10 s.
      "/change-email": { window: 60, max: 3 },
    },
  },
  // The composer's Letter rides on sign-up and log-in, so sealing keeps those routes' rate
  // limits; a server action calling auth.api directly would skip them.
  hooks: {
    // A bad Letter is refused before any account is made for it.
    before: createAuthMiddleware(async (ctx) => {
      // No Letter (null or absent) is a plain sign-up or log-in, e.g. after an expired link.
      if (!SEAL_PATHS.has(ctx.path) || ctx.body?.letter == null) return;
      if (!parseLetterInput(ctx.body.letter)) throw new APIError("BAD_REQUEST", { code: "INVALID_LETTER" });
    }),
    after: createAuthMiddleware(async (ctx) => {
      if (!SEAL_PATHS.has(ctx.path)) return;
      const letter = parseLetterInput(ctx.body?.letter);
      if (!letter) return;
      const returned = ctx.context.returned;

      const sessionUser = ctx.context.newSession?.user;
      if (sessionUser) return sealOrRefuse(sessionUser, letter);

      // better-auth only reports an unverified email once the password has matched.
      if (isAPIError(returned) && returned.body?.code === "EMAIL_NOT_VERIFIED") {
        const author = await db.user.findUnique({ where: { email: String(ctx.body.email).toLowerCase() } });
        if (author) await sealOrRefuse(author, letter);
        return;
      }

      // Signing up with a taken email returns a look-alike user that was never saved. Seal only
      // for a real one, after the response, so the extra work can't tell the two apart (SPEC §6).
      const signedUpId = (returned as { user?: { id?: unknown } } | undefined)?.user?.id;
      if (typeof signedUpId === "string") {
        after(async () => {
          const author = await db.user.findUnique({ where: { id: signedUpId } });
          const outcome = author && (await sealLetter(author, letter));
          if (outcome && outcome !== "sealed") console.warn(`letter ${letter.id} not sealed at sign-up: ${outcome}`);
        });
      }
    }),
  },
});

const SEAL_PATHS = new Set(["/sign-up/email", "/sign-in/email"]);

// A verified log-in has already set its session cookie, so a refused Letter still leaves the
// Author signed in; the modal shows why, and their next send goes through sealForAuthor.
async function sealOrRefuse(author: SealingAuthor, letter: LetterInput): Promise<void> {
  const outcome = await sealLetter(author, letter);
  if (outcome === "capped") throw new APIError("FORBIDDEN", { code: LETTER_CAP_CODE, message: LETTER_CAP_REACHED });
  if (outcome === "id-taken") throw new APIError("BAD_REQUEST", { code: "INVALID_LETTER" });
}

// Every send runs after the response, so neither its timing nor a Resend failure can reveal
// whether an account exists (SPEC §6). Done here, not via `advanced.backgroundTasks`, because
// better-auth awaits /send-verification-email directly and rethrows its errors.
function sendAfterResponse(to: string, email: Email): void {
  after(() => sendAccountEmail(to, email));
}
