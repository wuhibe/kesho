"use client";

import { type FC, useEffect } from "react";
import { clearDraft, readDraft } from "../../draft";

/** Once its Letter is Sealed, the composer's draft is done with; a newer draft is kept. */
export const ClearDraft: FC<{ letterId: string }> = ({ letterId }) => {
  useEffect(() => {
    if (readDraft().id === letterId) clearDraft();
  }, [letterId]);
  return null;
};
