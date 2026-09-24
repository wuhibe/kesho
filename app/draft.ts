import { useSyncExternalStore } from "react";
import { chosenDeliveryDate } from "@/lib/delivery-date";

// The composer's draft lives in localStorage, so a reload or the auth detour never loses it
// (SPEC §3). It stays until its Letter is shown Sealed.

export type Preset = "6m" | "1y" | "3y" | "5y" | "custom";

export const PRESETS: { key: Exclude<Preset, "custom">; label: string; months: number }[] = [
  { key: "6m", label: "6 months", months: 6 },
  { key: "1y", label: "1 year", months: 12 },
  { key: "3y", label: "3 years", months: 36 },
  { key: "5y", label: "5 years", months: 60 },
];

export type Draft = {
  /** Becomes the Letter's id; empty until the first keystroke. */
  id: string;
  subject: string;
  body: string;
  preset: Preset;
  customDate: string;
  /** The email this draft was last sent with; empty until the first send. */
  sentTo: string;
};

const KEY = "kesho:draft";
const EMPTY: Draft = { id: "", subject: "", body: "", preset: "1y", customDate: "", sentTo: "" };

export function useDraft(): Draft {
  return useSyncExternalStore(subscribe, readDraft, () => EMPTY);
}

export function readDraft(): Draft {
  const raw = load();
  if (raw !== cache.raw) cache = { raw, draft: parse(raw) };
  return cache.draft;
}

export function updateDraft(patch: Partial<Draft>): void {
  const draft = { ...readDraft(), ...patch };
  store(JSON.stringify({ ...draft, id: draft.id || crypto.randomUUID() }));
}

/**
 * The Letter id to send the draft with. Sent again to the same email, it keeps its id, so the
 * Letter isn't duplicated; sent to another email ("Wrong email?"), it is a new Letter.
 */
export function draftIdFor(email: string): string {
  const sentTo = email.trim().toLowerCase();
  const { id, sentTo: previous } = readDraft();
  updateDraft({ sentTo, id: previous && previous !== sentTo ? crypto.randomUUID() : id });
  return readDraft().id;
}

export function clearDraft(): void {
  store(null);
}

/** The chosen Delivery date, or null while a custom date is missing or out of range. */
export function deliveryDateOf(draft: Draft, today: string): string | null {
  const preset = PRESETS.find((p) => p.key === draft.preset);
  return chosenDeliveryDate(today, preset ? { months: preset.months } : { date: draft.customDate });
}

let cache: { raw: string | null; draft: Draft } = { raw: null, draft: EMPTY };
const listeners = new Set<() => void>();
// Used when the browser blocks storage, so writing still works for this visit.
let memory: string | null = null;

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  window.addEventListener("storage", listener);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", listener);
  };
}

function load(): string | null {
  try {
    return localStorage.getItem(KEY);
  } catch {
    return memory;
  }
}

function store(raw: string | null): void {
  memory = raw;
  try {
    if (raw === null) localStorage.removeItem(KEY);
    else localStorage.setItem(KEY, raw);
  } catch {
    // Blocked storage: `memory` holds the draft instead.
  }
  listeners.forEach((listener) => listener());
}

function parse(raw: string | null): Draft {
  try {
    return raw ? { ...EMPTY, ...JSON.parse(raw) } : EMPTY;
  } catch {
    return EMPTY;
  }
}
