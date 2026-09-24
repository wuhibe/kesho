import { formatDate, formatMonth, todayIn } from "@/lib/delivery-date";
import type { DeliveryEmail } from "@/lib/email";
import { LetterSheet } from "./letter-sheet";

/** A Letter as the delivery email needs it, decrypted. */
export type OpenedLetter = {
  subject: string | null;
  body: string;
  deliveryDate: string;
  timeZone: string;
  createdAt: Date;
};

/**
 * The delivery email (SPEC §8). Built only from the stored Letter, so a retried send is
 * byte-identical and its idempotency key holds (SPEC §7 step 6).
 */
export function deliveryEmail(letter: OpenedLetter): DeliveryEmail {
  const written = todayIn(letter.timeZone, letter.createdAt);
  const month = formatMonth(written);
  return {
    // Quoted: an unquoted comma would split the display name into two addresses.
    from: `"You, from ${month}" <letters@mail.kesho.et>`,
    subject: letter.subject ?? `A letter from ${month}`,
    react: (
      <LetterSheet
        preheader={letter.body.trim().split(/\r?\n/)[0]}
        label={`Written ${formatDate(written)} · Opened ${formatDate(letter.deliveryDate)}`}
        subject={letter.subject}
        body={letter.body}
      />
    ),
  };
}
