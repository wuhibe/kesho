import { useSyncExternalStore } from "react";
import { todayIn } from "@/lib/delivery-date";

/** The Author's IANA timezone, stored with each Letter (SPEC §4). */
export function localTimeZone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}

/** Today in the browser's timezone; null while rendering on the server, which can't know it. */
export function useLocalToday(): string | null {
  return useSyncExternalStore(
    noop,
    () => todayIn(localTimeZone()),
    () => null,
  );
}

function noop(): () => void {
  return () => {};
}
