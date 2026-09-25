"use client";

import type { FC } from "react";
import { chip } from "@/components/pill";
import { dayCount, daysBetween, deliveryDateRange, formatDate } from "@/lib/delivery-date";
import { type Draft, PRESETS, updateDraft } from "./draft";

export const DeliveryPicker: FC<{ draft: Draft; today: string | null; deliveryDate: string | null }> = ({
  draft,
  today,
  deliveryDate,
}) => {
  const range = today ? deliveryDateRange(today) : null;
  const isCustom = draft.preset === "custom";
  const days = today && deliveryDate ? daysBetween(today, deliveryDate) : null;

  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="sr-only">When should it arrive?</legend>
      <div className="flex flex-wrap items-center gap-2">
        {PRESETS.map((preset) => (
          <button
            key={preset.key}
            type="button"
            aria-pressed={draft.preset === preset.key}
            onClick={() => updateDraft({ preset: preset.key })}
            className={chip(draft.preset === preset.key)}
          >
            {preset.label}
          </button>
        ))}
        {isCustom ? (
          <input
            type="date"
            aria-label="Delivery date"
            autoFocus
            required
            min={range?.min}
            max={range?.max}
            value={draft.customDate}
            onChange={(event) => updateDraft({ customDate: event.target.value })}
            className="rounded-full border border-ink bg-white px-4 py-2 text-sm"
          />
        ) : (
          <button type="button" aria-pressed={false} onClick={() => updateDraft({ preset: "custom" })} className={chip(false)}>
            Pick a date
          </button>
        )}
      </div>
      <p aria-live="polite" className="min-h-4 font-mono text-xs uppercase text-bark">
        {deliveryDate && days !== null ? (
          <>
            → Arrives {formatDate(deliveryDate)} ·{" "}
            <span className="whitespace-nowrap">in {dayCount(days)}</span>
          </>
        ) : (
          isCustom && today && "Choose when it arrives"
        )}
      </p>
    </fieldset>
  );
};
