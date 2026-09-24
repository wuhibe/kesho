"use server";

import { refresh } from "next/cache";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { SOMETHING_WENT_WRONG } from "@/lib/copy";
import { deleteLetter } from "@/lib/letters";

/** Cancels a Sealed Letter or deletes one from the Archive, for the signed-in Author. Returns the error copy. */
export async function deleteForAuthor(letterId: unknown): Promise<string | null> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || typeof letterId !== "string") return SOMETHING_WENT_WRONG;
  if (!(await deleteLetter(letterId, session.user.id))) return SOMETHING_WENT_WRONG;
  refresh();
  return null;
}
