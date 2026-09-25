import type { FC } from "react";

const QUESTIONS = [
  [
    "What is Kesho?",
    "Kesho means tomorrow in Swahili. You write a letter to your future self, and we email it to you on the day you choose.",
  ],
  [
    "Can I read or change it before then?",
    "No, it's sealed until its day. You can cancel it from Your letters, which deletes it.",
  ],
  [
    "How far ahead can I send it?",
    "From tomorrow up to five years. It arrives on that day, or a day later if we hit our daily sending limit.",
  ],
  [
    "Who can read my letter?",
    "Only you. It's encrypted in our database. We hold the key so we can deliver it, which means it isn't end-to-end encrypted, but we never read letters.",
  ],
  ["What if my email changes?", "Update it from Your letters. Sealed letters go to your new address."],
  [
    "What if Kesho shuts down?",
    "You get at least 30 days' notice, and every sealed letter is emailed to you early rather than lost.",
  ],
  ["Does it cost anything?", "No. Kesho is free, with up to 20 sealed letters at a time."],
] as const;

// Plain <details>, no FAQPage schema: Google dropped FAQ rich results in May 2026 (SPEC §3 SEO).
export const Questions: FC = () => (
  <section aria-labelledby="questions">
    <h2 id="questions" className="mt-12 font-mono text-xs uppercase text-bark">
      Questions
    </h2>
    <div className="mt-4 divide-y divide-ink/10 border-y border-ink/10">
      {QUESTIONS.map(([question, answer]) => (
        <details key={question} className="group py-4">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium [&::-webkit-details-marker]:hidden">
            {question}
            <span aria-hidden className="text-bark transition-transform group-open:rotate-45">
              +
            </span>
          </summary>
          <p className="mt-2 text-ink/70">{answer}</p>
        </details>
      ))}
    </div>
  </section>
);
