"use client";

import { DayPicker } from "@daypicker/react";
import { type CSSProperties, type FC, useEffect, useRef, useState } from "react";
import { chip } from "@/components/pill";
import { deliveryDateRange, formatDate, fromUtcDate, toUtcDate } from "@/lib/delivery-date";
import { type Draft, updateDraft } from "./draft";

const WIDE = "(min-width: 48rem)";

/**
 * The "Pick a date" chip and its calendar (SPEC §3 `/`). The calendar opens only on a tap, as a
 * modal <dialog> so nothing on the page shifts and Esc or a backdrop tap closes it: a second
 * bottom drawer over the send drawer on phones, a popover above the chip on md+.
 */
export const DeliveryCalendar: FC<{ draft: Draft; today: string | null; deliveryDate: string | null }> = ({
  draft,
  today,
  deliveryDate,
}) => {
  const dialog = useRef<HTMLDialogElement>(null);
  const opener = useRef<HTMLButtonElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [popoverPosition, setPopoverPosition] = useState<CSSProperties>();
  const close = () => dialog.current?.close();

  // Each breakpoint renders its own copy of the picker; the other one's open modal would be hidden.
  useEffect(() => {
    const wide = matchMedia(WIDE);
    wide.addEventListener("change", close);
    return () => wide.removeEventListener("change", close);
  }, []);

  const open = () => {
    // The top layer places the dialog against the viewport, so the popover is pinned above the chip.
    const chipBox = opener.current?.getBoundingClientRect();
    setPopoverPosition(
      chipBox && matchMedia(WIDE).matches
        ? { left: chipBox.left, bottom: innerHeight - chipBox.top + 12, top: "auto", right: "auto" }
        : undefined,
    );
    dialog.current?.showModal();
    setIsOpen(true);
  };

  const range = today && deliveryDateRange(today);
  const isCustom = draft.preset === "custom";
  const selected = draft.customDate ? toUtcDate(draft.customDate) : undefined;

  return (
    <>
      <button ref={opener} type="button" aria-pressed={isCustom} onClick={open} className={chip(isCustom)}>
        {isCustom && deliveryDate ? formatDate(deliveryDate) : "Pick a date"}
      </button>
      <dialog
        ref={dialog}
        aria-label="Delivery date"
        style={popoverPosition}
        onClose={() => {
          setIsOpen(false);
          // The dialog only restores focus to what was focused before, and Safari never focuses a tapped button.
          opener.current?.focus();
        }}
        onClick={(event) => event.target === event.currentTarget && close()}
        className="mt-auto w-full max-w-none rounded-t-2xl bg-paper text-ink shadow-float backdrop:bg-ink/40 md:m-0 md:w-80 md:rounded-2xl md:backdrop:bg-transparent"
      >
        <div className="p-4 pb-8 md:pb-4">
          <div aria-hidden className="mx-auto mb-3 h-1 w-10 rounded-full bg-ink/15 md:hidden" />
          {/* Mounted only while open, so autoFocus moves focus to the chosen day (or the first one) each time. */}
          {isOpen && today && range && (
            <DayPicker
              mode="single"
              required
              autoFocus
              // Delivery dates are calendar days; UTC midnight is how lib/delivery-date holds them (ADR 0001).
              timeZone="UTC"
              today={toUtcDate(today)}
              weekStartsOn={1}
              captionLayout="dropdown"
              navLayout="around"
              startMonth={toUtcDate(range.min)}
              endMonth={toUtcDate(range.max)}
              disabled={[{ before: toUtcDate(range.min) }, { after: toUtcDate(range.max) }]}
              selected={selected}
              defaultMonth={selected}
              onSelect={(day) => {
                // Only a picked day switches the preset, so looking and closing keeps the Author's choice.
                updateDraft({ preset: "custom", customDate: fromUtcDate(day) });
                close();
              }}
              classNames={CLASS_NAMES}
            />
          )}
        </div>
      </dialog>
    </>
  );
};

const arrow = "grid size-10 place-items-center rounded-full hover:bg-sand/60 aria-disabled:opacity-30 aria-disabled:hover:bg-transparent";

// No DayPicker stylesheet: these theme classes replace its defaults.
const CLASS_NAMES = {
  month: "grid grid-cols-[auto_1fr_auto] items-center",
  month_caption: "flex justify-center",
  dropdowns: "flex gap-1",
  // The native <select> sits invisibly over its label, so a tap opens the platform's own picker.
  dropdown_root: "relative rounded-full has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-ink/35",
  dropdown: "absolute inset-0 cursor-pointer opacity-0",
  caption_label: "flex items-center gap-1 rounded-full px-2 py-1 text-base font-medium",
  chevron: "size-4 fill-current",
  button_previous: arrow,
  button_next: arrow,
  month_grid: "col-span-3 mt-3 w-full border-collapse",
  weekday: "pb-1 font-mono text-[10px] font-normal uppercase text-bark",
  day: "p-0 text-center",
  day_button:
    "mx-auto grid size-10 place-items-center rounded-full text-sm transition-colors enabled:hover:bg-sand/60 disabled:text-ink/20",
  selected: "[&>button]:bg-ink [&>button]:text-paper [&>button]:enabled:hover:bg-ink",
};
