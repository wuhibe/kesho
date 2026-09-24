import type { ComponentProps, FC } from "react";

export const Field: FC<{ label: string } & ComponentProps<"input">> = ({ label, ...input }) => (
  <label className="flex flex-col gap-1 text-sm text-bark">
    {label}
    <input required className="w-full rounded-xl border border-ink/20 bg-white px-4 py-3 text-base text-ink" {...input} />
  </label>
);
