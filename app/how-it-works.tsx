import type { FC } from "react";

const STEPS = [
  ["Write.", "Say what you want future you to hear. No account needed until you send."],
  ["Pick a day.", "Six months, a year, five years, or a date of your own, up to five years out."],
  ["We seal it.", "You can't read it until then. On the day, it lands in your inbox."],
] as const;

/** Server-rendered below the Letter so crawlers see what Kesho does (SPEC §3 `/`). */
export const HowItWorks: FC = () => (
  <section aria-labelledby="how-it-works">
    <h2 id="how-it-works" className="mt-16 font-mono text-xs uppercase text-bark">
      How it works
    </h2>
    <ol className="mt-4 divide-y divide-ink/10 border-y border-ink/10">
      {STEPS.map(([step, detail], index) => (
        <li key={step} className="flex gap-4 py-4">
          <span className="font-mono text-xs leading-6 text-bark">0{index + 1}</span>
          <p>
            <b className="font-medium">{step}</b> <span className="text-ink/70">{detail}</span>
          </p>
        </li>
      ))}
    </ol>
  </section>
);
