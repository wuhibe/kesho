// Shared button looks, for buttons and links alike.
export const inkPill =
  "rounded-full bg-ink px-5 py-3 text-sm font-medium text-paper transition-colors hover:bg-ink/85 disabled:bg-sand disabled:text-bark";
export const ghostPill =
  "rounded-full border border-ink/20 px-5 py-3 text-sm font-medium transition-colors hover:bg-paper disabled:text-bark";

/** A choice among options, such as a Delivery date preset. */
export function chip(isOn: boolean): string {
  const state = isOn ? "border-ink bg-ink text-paper" : "border-ink/20 hover:bg-paper";
  return `rounded-full border px-4 py-2 text-sm transition-colors ${state}`;
}

/** One half of a two-way toggle. */
export function segment(isOn: boolean): string {
  return `flex-1 rounded-full py-2 transition-colors ${isOn ? "bg-ink text-paper" : "hover:bg-paper/60"}`;
}
