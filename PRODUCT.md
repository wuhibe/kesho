# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

An **Author**: anyone 16 or older, writing in English, at a reflective moment or turning point (a birthday, a new year, a new job, a move, the end of something). They write rarely, often on a phone, and want to say something to the person they will be. The only recipient of a Letter is its own Author.

## Product Purpose

Kesho (Swahili: *tomorrow*) lets an Author write a Letter to their future self and have it emailed to them on a Delivery date they choose, from tomorrow up to five years out. Until then the Letter is Sealed. Once delivered it lives in their Archive. Success is a Letter written in the moment and arriving, intact and on its day, years later.

## Positioning

- **Sealed means sealed.** The Author cannot reread or edit a Letter before its Delivery date; the body is never decrypted or sent to the browser until then. The wait is the point.
- **Writing comes first.** The home page is the letter sheet itself. No account is needed until the Author sends.
- **Free, no ads, no upsell.** A quiet personal project, not a business. Up to 20 Sealed Letters at a time, no premium tier.
- **Honest about privacy.** Letters are encrypted in the database, and Kesho says plainly that it holds the key, so it is not end-to-end encrypted (ADR 0002).

## Operating Context

- Compose on `/`, pick a preset (6 months, 1 year, 3 years, 5 years) or a date, send; sign up or log in inside the auth modal at the moment of sending.
- Verify by email (`/check-inbox`), then see the Sealed envelope (`/sealed/[id]`).
- Manage Sealed Letters, the Archive and account settings on `/letters`.
- Delivery happens by email from a daily run; the delivery email is itself a letter sheet and invites writing the next one.

## Capabilities and Constraints

- Source of truth: `docs/SPEC.md` (scope, pages, copy strings, lifecycle) and `CONTEXT.md` (domain terms). Use the domain terms in UI copy: Author, Letter, Draft, Delivery date, Pending, Scheduled, Delivered, Undeliverable, Sealed, Archive.
- Letters are an optional subject (≤150) plus a plain-text body (≤20,000). No rich text, no attachments, no sending to other people, no editing a Scheduled Letter. Cancelling deletes permanently.
- Email + password accounts only; English only; no mobile apps.
- One Next.js app on Vercel Hobby, $0/month apart from the domain; Resend Free limits sending to 100 emails a day.
- Copy rule: no em-dashes; use a middle dot or a full stop. Error copy comes from SPEC §3 and never reveals whether an account exists, except sign-up with a taken email (ADR 0003).
- Out of scope for now (SPEC §1): a public anonymous letters feed, Google login, Turnstile.

## Brand Commitments

- Name **Kesho**, with the dictionary entry "kesho /ˈkɛ.ʃɔ/ Swahili, adverb. Tomorrow." as the home page's opening.
- Logo mark "Tomorrow's sun" (`app/icon.svg`, `app/favicon.ico`, `app/apple-icon.png`).
- Fonts and colour tokens are fixed in SPEC §3. Kesho's own brand only: no third-party brand marks or commercial fonts, and never name an outside design inspiration in the repo (it is public).
- Voice: plain, warm, brief, second person. Example: "Nothing sealed yet. Future you is waiting."

## Evidence on Hand

- Live product at https://kesho.et, launched November 2026.
- Open Graph image `app/opengraph-image.png` with alt text in `app/opengraph-image.alt.txt`.
- No testimonials, user counts, press or reviews exist. Do not invent them.

## Product Principles

1. The letter comes before the account: never put a form between the Author and the first word.
2. The seal is real: no surface may hint at, preview or leak a Sealed body.
3. Say less: one clear line beats an explanation; copy stays calm and human.
4. Tell the truth about trade-offs (encryption, sending limits, a day's delay) in plain words.
5. Free and quiet: no growth tricks, nags or upsells.

## Accessibility & Inclusion

- Respect `prefers-reduced-motion`.
- Focus styles stay neutral ink, never red.
- Touch targets at least 44 px; dialogs and drawers close on Esc and backdrop tap and return focus to their trigger; the date picker keeps keyboard grid navigation and screen-reader semantics.
