"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { LETTER_CAP_REACHED, SOMETHING_WENT_WRONG } from "@/lib/copy";
import { parseLetterInput } from "@/lib/letter-input";
import { sealLetter } from "@/lib/letters";

/**
 * Seals a Letter for an Author who is already signed in, so "Write another" skips the auth
 * modal. Only verified Authors have sessions, so it lands SCHEDULED. Returns the error copy.
 */
export async function sealForAuthor(raw: unknown): Promise<string> {
  const session = await auth.api.getSession({ headers: await headers() });
  const letter = parseLetterInput(raw);
  if (!session || !letter) return SOMETHING_WENT_WRONG;
  const outcome = await sealLetter(session.user, letter);
  if (outcome !== "sealed") return outcome === "capped" ? LETTER_CAP_REACHED : SOMETHING_WENT_WRONG;
  redirect(`/sealed/${letter.id}`);
}
