import type { FC } from "react";

export const Envelope: FC<{ stamp: string; note?: string }> = ({ stamp, note }) => (
  <div aria-hidden className="relative h-44 w-72 -rotate-3 rounded-md bg-paper shadow-float">
    <div className="absolute inset-x-0 top-0 h-24 bg-sand [clip-path:polygon(0_0,100%_0,50%_100%)]" />
    <div className="absolute bottom-4 left-5 text-left">
      <p className="font-script text-3xl leading-none">to future me</p>
      {note && <p className="mt-1 font-mono text-[11px] uppercase text-bark">{note}</p>}
    </div>
    <span className="absolute right-4 top-4 rounded-sm border-2 border-red px-2 py-1 font-mono text-[10px] uppercase text-red">
      {stamp}
    </span>
  </div>
);
