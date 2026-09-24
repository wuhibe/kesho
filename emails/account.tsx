import type { Email } from "@/lib/email";
import { Envelope } from "./envelope";

// Account emails: verify, reset, change email (SPEC §8).

export function verificationEmail(url: string): Email {
  return {
    subject: "Confirm your email to seal your letter",
    react: (
      <Envelope
        preheader="Your letter is waiting. Confirm and we'll seal it."
        stamp="Awaiting your seal"
        title="One click to seal it."
        message="Your letter is written and waiting. Confirm this is your email and we'll seal it until the day you chose."
        cta="Confirm & seal my letter"
        url={url}
        finePrint="This link expires in 1 hour. Didn't sign up for Kesho? Ignore this email. Nothing will be sent, and the draft is deleted after 7 days."
      />
    ),
  };
}

export function passwordResetEmail(url: string): Email {
  return {
    subject: "Reset your Kesho password",
    react: (
      <Envelope
        preheader="Choose a new password. The link expires in 1 hour."
        stamp="Account"
        title="Reset your password."
        message="Someone (hopefully you) asked to reset the password for this Kesho account. Your sealed letters are safe either way."
        cta="Choose a new password"
        url={url}
        finePrint="This link expires in 1 hour. If you didn't ask for this, ignore this email. Your password won't change."
      />
    ),
  };
}

export function emailChangeEmail(url: string): Email {
  return {
    subject: "Confirm your new email",
    react: (
      <Envelope
        preheader="Confirm this address and your sealed letters will arrive here."
        stamp="Account"
        title="Confirm your new email."
        message="Your sealed letters will arrive here."
        cta="Confirm my new email"
        url={url}
        finePrint="This link expires in 1 hour. If you didn't ask for this, ignore this email. Your email won't change."
      />
    ),
  };
}
