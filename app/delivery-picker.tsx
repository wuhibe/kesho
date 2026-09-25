"use client";

import type { FC } from "react";
import { chip } from "@/components/pill";
import { dayCount, daysBetween, formatDate } from "@/lib/delivery-date";
import { DeliveryCalendar } from "./delivery-calendar";
import { type Draft, PRESETS, updateDraft } from "./draft";

export const DeliveryPicker: FC<{ draft: Draft; today: string | null; deliveryDate: string | null }> = ({
  draft,
  today,
  deliveryDate,
}) => {
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
        <DeliveryCalendar draft={draft} today={today} deliveryDate={deliveryDate} />
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
