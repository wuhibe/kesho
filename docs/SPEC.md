# Kesho — build spec

Kesho (Swahili: "tomorrow") lets an **Author** write a **Letter** to their future self and have it emailed to them on a chosen **Delivery date**. Domain terms are defined in [CONTEXT.md](../CONTEXT.md); this spec uses them exactly.

Every section links to the ticket that decided it. The planning map is [Wayfinder: Kesho](https://github.com/wuhibe/kesho/issues/1).

---

## 1. Scope

**In:**
- email + password accounts, with verification and password reset
- private Letters to yourself: an optional subject plus a plain-text body
- a Delivery date from tomorrow up to five years ahead
- Letters stay Sealed until delivery
- a dashboard with Sealed Letters, the Archive and account settings
- a daily delivery run with bounce handling
- Terms and Privacy pages
- English only

**Out:** public/anonymous letters feed (future), sending to other people, attachments, rich text, editing a Scheduled Letter, Google login (later), Turnstile (only if abused), mobile apps.

**Constraints:**
- one Next.js app on Vercel Hobby
- $0/month apart from the domain
- low traffic, so the architecture stays boring

## 2. Stack — [Stack](https://github.com/wuhibe/kesho/issues/2), [Email + cron](https://github.com/wuhibe/kesho/issues/3)

| Concern | Choice | Notes |
|---|---|---|
| App | Next.js (App Router) + Tailwind 4 | JSX/TSX, deployed on Vercel Hobby (non-commercial) |
| DB | Neon Postgres Free via Vercel Marketplace | pooled `DATABASE_URL` for the app, `DATABASE_URL_UNPOOLED` for migrations; cap compute at 0.25 CU |
| ORM | **Prisma 7 — pin `prisma@7 @prisma/client@7 @prisma/adapter-pg@7`** | `latest` is an 8.0 RC without `migrate dev`/`generate` |
| DB connection | one module-level `pg` Pool + `attachDatabasePool` (Vercel Fluid) | |
| Auth | better-auth `emailAndPassword` + `emailVerification`, `prismaAdapter` | see §6 |
| Email | Resend Free (100/day, 3,000/month shared across all mail), React Email templates | see §8 |
| Scheduler | Vercel Cron: delivery `0 6`, `0 7`, `0 8 * * *`, failure report `0 9 * * *` (each fires within its hour, 300 s max) | see §7 |
| Encryption | `node:crypto` AES-256-GCM, app-held key | see [ADR 0002](adr/0002-app-held-key-encryption.md) |
| Analytics | Vercel Web Analytics (cookieless) | |
| Backups | weekly GitHub Action `pg_dump` → Cloudflare R2 | see §10 |

## 3. Pages — [Composer prototype](https://github.com/wuhibe/kesho/issues/7), [Copy](https://github.com/wuhibe/kesho/issues/12)

The chosen design is Variant A, the letter sheet, picked from throwaway prototypes in #7.

| Route | Content |
|---|---|
| Site header (every page) | The logo mark and a "Kesho" wordmark linking to `/` on the left; on the right, in the footer's register (mono caps, bark, ink on hover): **Your letters** → `/letters` and **Log out** when signed in, **Log in** when signed out (including `/check-inbox` and `/reset-password`). It scrolls with the page, and every target is padded to at least 44 px. |
| `/` | **Header:** a dictionary entry, "**kesho** /ˈkɛ.ʃɔ/ *Swahili, adverb.* Tomorrow." (small serif, IPA in mono), then the `h1` in serif italic: "Write to yourself. We'll keep it sealed and email it back on the day you choose." **Letter sheet:** today's date as a mono label, an optional subject (≤150), the italic script salutation "Dear future self,", a ruled serif body (≤20,000 chars; about four ruled lines tall when empty on phones, growing with its text) and a word count. **Send bar:** presets 6 months / 1 year / 3 years / 5 years / Pick a date, the resolved line "→ ARRIVES 24 SEPT 2027 · IN 365 DAYS" (or "Choose when it arrives" while Pick a date is chosen with no date yet), and a **Send to the future →** button, disabled until the body has text. The bar floats on md+. Below md a floating **Send to the future →** button (bottom-right) opens a bottom drawer holding the presets, the Arrives line and Send; a backdrop tap, Esc or "Hide" closes it, and focus returns to the button. The draft autosaves to `localStorage`. **Pick a date** opens a calendar only on tap (`@daypicker/react`, the react-day-picker package, for its keyboard grid navigation and screen-reader semantics; styled in the theme: paper sheet, ink selected day, faded out-of-range days, mono weekday labels, Monday first): a second bottom drawer with a grab handle over the send drawer on phones, a popover above the chip on md+; a backdrop tap or Esc closes it. Its caption has ‹ › month arrows and month and year dropdowns; days outside tomorrow to +5 years are disabled; picking a day closes it. Focus moves into the calendar on open and back to the chip on close, and the chip then shows the chosen date ("16 Oct 2026"). **Below the Letter**, server-rendered so crawlers see it: **How it works**, three hairline rows with mono numbers (01 **Write.** Say what you want future you to hear. No account needed until you send. / 02 **Pick a day.** Six months, a year, five years, or a date of your own, up to five years out. / 03 **We seal it.** You can't read it until then. On the day, it lands in your inbox.), then **Questions**, native `<details>` rows under a mono label: **What is Kesho?** Kesho means tomorrow in Swahili. You write a letter to your future self, and we email it to you on the day you choose. / **Can I read or change it before then?** No, it's sealed until its day. You can cancel it from Your letters, which deletes it. / **How far ahead can I send it?** From tomorrow up to five years. It arrives on that day, or a day later if we hit our daily sending limit. / **Who can read my letter?** Only you. It's encrypted in our database. We hold the key so we can deliver it, which means it isn't end-to-end encrypted, but we never read letters. / **What if my email changes?** Update it from Your letters. Sealed letters go to your new address. / **What if Kesho shuts down?** You get at least 30 days' notice, and every sealed letter is emailed to you early rather than lost. / **Does it cost anything?** No. Kesho is free, with up to 20 sealed letters at a time. |
| Auth modal (over `/`, or any page from the site header) | "Where should it arrive?", a × close control (Esc and a backdrop tap also close it), a "New here / I have an account" toggle, email and password (8+), and "Forgot password?" in login mode. **Sign up:** "Create account & seal letter", followed by the consent line: "We'll email you a link… By continuing you confirm you're 16+ and agree to the Terms." **Log in:** "Log in & seal letter". **Plain log-in** (the header's Log in, or any open with no Letter to seal): "Welcome back.", no toggle, email, password, "Forgot password?" and a plain **Log in**; no `letter` is sent, and a verified log-in lands on `/letters`. |
| `/check-inbox` | An envelope addressed "to my future self" and stamped PENDING, "Check your inbox." with the echoed email, Resend (30 s cooldown), "Wrong email?" (reopens the modal) and the 7-day discard note |
| `/sealed/[id]` | The same envelope stamped SEALED, "DO NOT OPEN BEFORE <date>", "See you in N days." ("Opens today." / "On its way." once the date has come), and Write another / My letters |
| `/letters` (auth) | "Your letters". An Undeliverable banner ("One letter couldn't reach you… Update your email") when relevant. **Sealed · N of 20:** subject or "Untitled letter", `OPENS <date> · N DAYS` (`OPENS TODAY` on the day, `ON ITS WAY` once past it and awaiting the run) or `PENDING · VERIFY YOUR EMAIL`, and Cancel with an inline "Delete forever?" confirm. **Archive:** expandable rows with the body in serif, marked UNDELIVERABLE where relevant, plus Delete with the same "Delete forever?" confirm. **Account:** a hairline list of rows with a › cue: Change email (the current address under it) / Change password (signs out every other session) / Delete account (in red; the password is the confirm, then a red "Delete account forever"). Each row opens its form in a centred dialog with the auth modal's look and close controls, on phones too; closing returns focus to the row. `?settings=email|password|delete` names the open dialog, so `/letters?settings=email` opens Change email and the Undeliverable banner's "Update your email" links there. Empty state: "Nothing sealed yet. Future you is waiting." |
| `/reset-password` | request form + set-new-password form (token from email) |
| `/terms`, `/privacy` | see §9 |
| `/.well-known/security.txt` | `Contact: mailto:hello@kesho.et` · `Expires: 2027-09-24T00:00:00.000Z` · `Preferred-Languages: en` · `Canonical: https://kesho.et/.well-known/security.txt` |

**Look ([Fonts](https://github.com/wuhibe/kesho/issues/5)):**
- **Colours:** cream `#f0ebe2` page, paper `#faf7f1` surfaces, ink `#210c02` text and primary pill buttons. Red `#c42121` is used only for emphasis words and destructive actions. Sand `#e1d8c4`, bark `#7b6556`, muted `#5a6a92`. The envelope emails tint paper and sand toward red (see §8).
- **Focus styles:** **neutral ink, never red.** Inputs get an ink border; buttons and links get a soft ink outline.
- **Fonts:** via `next/font/google`, all OFL:
  - Instrument Sans for UI and headings
  - Fragment Mono for small uppercase labels
  - Newsreader for the letter body and archive
  - Zeyada for the salutation only, with `font-synthesis: none`
- **Motion:** respect `prefers-reduced-motion`.
- **Brand:** Kesho's own. No third-party brand marks or commercial fonts.
- **Logo mark:** "Tomorrow's sun": a paper `#faf7f1` half sun over two horizon bars on a red `#c42121` rounded square. The files are `app/icon.svg` (master), `app/favicon.ico` (16/32/48) and `app/apple-icon.png` (180, full-bleed; iOS rounds it). Next.js serves them by file convention, so no `<link>` tags are needed.

**Copy strings:** no em-dashes; use a middle dot or a full stop. The home `<title>` is "Kesho · letters to your future self", matching the footer; other pages are "<Page> · Kesho" (see SEO).
- **20-letter cap:** "You have 20 sealed letters, the most we hold at once. Let one arrive or cancel one to write another."
- **Expired or used link:** "This link has expired. Log in and we'll send a fresh one." On `/reset-password`, where logging in isn't an option: "This link has expired. Enter your email and we'll send a fresh one."
- **Rate limited:** "Too many tries. Wait a minute and try again."
- **Anything else failed:** "Something went wrong. Try again."
- **Not found** (unmatched URLs, or a cancelled Letter's `/sealed/[id]`): "Nothing here." + "This page doesn't exist, or the letter was cancelled." → Write a letter
- **Wrong credentials:** "That email and password don't match." (log-in never reveals whether the account exists)
- **Sign-up with a taken email:** "You already have an account. Log in or reset your password." The auth modal switches to its log-in tab with the email and Draft kept ([ADR 0003](adr/0003-sign-up-reveals-taken-email.md)).
- **Wrong password** (signed in, changing password or deleting the account): "That password isn't right."
- **Email changed:** "Your sealed letters will now arrive at the new address."

**SEO ([SEO scope](https://github.com/wuhibe/kesho/issues/41), research `docs/research/seo-ai-discoverability.md` on `research/seo-ai-discoverability`):**
- Root layout metadata: `metadataBase` `https://kesho.et`, title default "Kesho · letters to your future self" with template "%s · Kesho" (pages set only their own name), description "Write to yourself. We'll keep it sealed and email it back on the day you choose, up to five years from now.", and Open Graph `siteName` Kesho, `type` website, `locale` en_US.
- Indexable pages (`/`, `/terms`, `/privacy`) each set their own canonical; not in the layout, because metadata merges shallowly. `/`'s canonical folds `?auth=` and utm variants into it.
- `robots: { index: false }` on `/letters`, `/check-inbox`, `/sealed/[id]` and `/reset-password`: noindex, not a robots.txt `Disallow`, so crawlers can see it.
- Static `app/robots.txt` (`User-Agent: *`, `Allow: /`, `Disallow: /api/`, the sitemap URL) and `app/sitemap.xml` (`/`, `/terms`, `/privacy`, no `lastmod`). All crawlers are allowed, AI ones included, with no per-bot lines; keep Vercel's AI bot ruleset and Cloudflare's AI blocking off.
- `WebSite` JSON-LD on `/` (`name` Kesho, `url` `https://kesho.et/`) in a plain `<script type="application/ld+json">` with `<` escaped.
- Static `app/opengraph-image.png` (1200×630) with `opengraph-image.alt.txt`: cream page, the logo mark and wordmark, the SEALED envelope, the `h1` in serif italic, "kesho.et" in mono. Re-export it from an HTML render if the hero copy changes.
- Not used: `llms.txt`, `FAQPage` or `WebApplication` schema, `meta keywords`, and "FutureMe" in the title.

## 4. Data model — [Data model + lifecycle](https://github.com/wuhibe/kesho/issues/6)

better-auth owns `user`, `session`, `account`, `verification` and `rateLimit`, generated by `npx auth@latest generate` into `schema.prisma`. Kesho adds:

```prisma
enum LetterStatus { PENDING SCHEDULED SENDING DELIVERED UNDELIVERABLE }

model Letter {
  id            String       @id @default(cuid())  // the composer supplies a UUID (§5 Create)
  authorId      String
  author        User         @relation(fields: [authorId], references: [id], onDelete: Cascade)
  subject       String?      // "v1:" + base64(iv|tag|ciphertext); plaintext ≤150
  body          String       // "v1:" + base64(iv|tag|ciphertext); plaintext ≤20,000
  deliveryDate  DateTime     @db.Date
  timeZone      String       // IANA, from Intl.DateTimeFormat().resolvedOptions().timeZone
  status        LetterStatus @default(PENDING)
  attempts      Int          @default(0)
  lastError     String?
  claimedAt     DateTime?
  resendEmailId String?
  deliveredAt   DateTime?
  createdAt     DateTime     @default(now())
  @@index([status, deliveryDate])
}

model WebhookEvent {            // dedupe Resend/svix deliveries
  id         String   @id       // svix-id
  receivedAt DateTime @default(now())
}
```

## 5. Letter lifecycle

```
PENDING ──Author verifies email──▶ SCHEDULED ──daily run claims──▶ SENDING ──ok──▶ DELIVERED
                                     ▲   ▲                            │
                                     │   └── soft fail, attempts<12 ◀─┤
            new email verified ──────┘                                └─ hard bounce / suppressed / complaint / 12th fail ▶ UNDELIVERABLE
Cancel (PENDING|SCHEDULED) = hard delete · Delete from Archive (DELIVERED|UNDELIVERABLE) = hard delete
```

- **Create:**
  - Validate: the body is non-empty, the Delivery date is in `[tomorrow, +5y]` in the Author's tz, and the Author has fewer than 20 PENDING+SCHEDULED Letters.
  - The Letter is created SCHEDULED if the Author is verified, otherwise PENDING.
  - **Signed out:** the Letter rides in the body of `/sign-up/email` or `/sign-in/email`, so it keeps those routes' rate limits (direct `auth.api` calls skip them). A `hooks.before` refuses an invalid Letter before any account exists; a `hooks.after` seals it. A taken email is refused in `hooks.before` with `ACCOUNT_EXISTS` (ADR 0003), so sign-up seals for the new user; a race that still gets better-auth's look-alike response seals nothing. A log-in refused with `EMAIL_NOT_VERIFIED` has matched the password, so it seals PENDING. Its `callbackURL` is `/sealed/<id>`, where verification links land.
  - **Signed in:** a server action seals it directly, with no auth modal.
  - The composer's Draft id (a browser `crypto.randomUUID()`) becomes the Letter id, so re-sending a Draft (say, after an expired link) never makes a second Letter. Sending it with a different email ("Wrong email?") gives it a new id, and an id already held by another Author is refused.
- **Verify:** better-auth's `emailVerification.afterEmailVerification` flips every PENDING Letter of that user to SCHEDULED.
- **Sealed:** the body of a PENDING/SCHEDULED Letter is **never decrypted or sent to the client**. The dashboard decrypts only the subject.
- **Recipient:** `user.email`, read at send time.
- **Email change:** better-auth's `changeEmail` sends a verification to the new address. When it's confirmed, UNDELIVERABLE → SCHEDULED with `attempts = 0`.
- **Account deletion:** cascades to all of the Author's Letters.

## 6. Auth — [Stack](https://github.com/wuhibe/kesho/issues/2)

- **Options:** `emailAndPassword: { enabled, requireEmailVerification: true, sendResetPassword, revokeSessionsOnPasswordReset: true }` and `emailVerification: { sendVerificationEmail, sendOnSignUp: true, sendOnSignIn: true, autoSignInAfterVerification: true, afterEmailVerification }`. `sendOnSignIn` is what makes "Log in and we'll send a fresh one" true. `user: { changeEmail: { enabled: true }, deleteUser: { enabled: true } }`.
- **Token lifetimes:** 1 h. Sessions last 7 days.
- **Sending mail:** don't `await` sends inside auth callbacks. Use `after()` / `waitUntil` so response timing can't be used to probe accounts. Each callback hands its send to `after()` itself: better-auth awaits `/send-verification-email` directly, so `advanced.backgroundTasks` doesn't cover it.
- **Taken email on sign-up:** with `requireEmailVerification`, better-auth answers a taken email with a look-alike user. A `hooks.before` on `/sign-up/email` refuses it first with `ACCOUNT_EXISTS` (422), so sign-up reveals whether an account exists; log-in and password reset still don't ([ADR 0003](adr/0003-sign-up-reveals-taken-email.md)). The rate limit runs before hooks, so the probe stays at 3 a minute.
- **Rate limiting:** `rateLimit: { storage: "database", window: 60, max: 100, customRules }`; the rules allow 3 requests per 60 s on `/sign-up/email`, `/sign-in/email` (it re-sends verification), `/request-password-reset`, `/send-verification-email` and `/change-email` (it mails whatever address is typed in), since each one sends an email.
- **`BETTER_AUTH_URL`:**
  - prod: `https://kesho.et`
  - preview: from `VERCEL_URL` (ahead of any `BETTER_AUTH_URL`), added to `trustedOrigins` with `VERCEL_BRANCH_URL`
  - local: `http://localhost:3000`
- **Log out** (site header): signs out, clears the Draft from `localStorage` so a shared computer never shows the last Author's words, and lands on `/`.
- **Middleware** (`proxy.ts` since Next.js 16): auth middleware **excludes `/api/cron/*` and `/api/webhooks/*`**. A redirect there silently breaks cron. Its matcher lists the signed-in routes (`/letters`) rather than excluding public ones.

## 7. Delivery run — [Email + cron](https://github.com/wuhibe/kesho/issues/3), [ADR 0001](adr/0001-daily-run-local-date-delivery.md)

`GET /api/cron/deliver`, run by Vercel Cron at 06:00, 07:00 and 08:00 UTC (Hobby allows each cron once a day and fires it anywhere in its hour). The later runs retry what the first left and release claims from a run that died. Requests without `Authorization: Bearer $CRON_SECRET` are rejected, and so are requests where the secret is unset.

1. **Establish the run time.** `now` is the current time. Outside production (`VERCEL_ENV !== 'production'`) a `?now=YYYY-MM-DD` override is honoured, taken at 06:00 UTC like the cron.
2. **Release stale claims.** SENDING rows with `claimedAt < now − 1h` go back to SCHEDULED.
3. **Purge.** Delete unverified users with `createdAt < now − 7d`; their PENDING Letters cascade.
4. **Work out the budget.** `min(90, 100 − emails sent today)`. Sends-today counts Letters with `deliveredAt` since midnight UTC, plus any SENDING, so two overlapping runs share one budget.
5. **Claim the due Letters.** A Letter is due when it is SCHEDULED and `now`, converted to its `timeZone`, has reached its `deliveryDate`. That rule is `isDue` in `lib/delivery-date.ts`, so it has a test: the run loads SCHEDULED Letters dated up to UTC's tomorrow (no timezone is a whole day ahead), keeps the due ones and claims them atomically, where `<due>` is `id = ANY($dueIds) AND status = 'SCHEDULED'`:
   ```sql
   UPDATE "Letter" SET status='SENDING', "claimedAt"=$now
   WHERE id IN (SELECT id FROM "Letter" WHERE <due> ORDER BY "deliveryDate","createdAt" LIMIT $budget FOR UPDATE SKIP LOCKED)
   RETURNING *
   ```
6. **Send each Letter.** One `POST /emails` per Letter with `Idempotency-Key: <VERCEL_ENV or local>/delivery/<id>/<attempts>`. The environment prefix stops a local or preview run on copied data from spending production's key, which Resend would then refuse for 24 h. The payload must be byte-identical across retries: build it only from stored data.
7. **Handle the result.**
   - **Success:** DELIVERED, set `deliveredAt` and `resendEmailId`.
   - **Quota 429:** back to SCHEDULED, with no attempt counted.
   - **Other failure:** `attempts+1` and back to SCHEDULED. On the 12th failure the Letter becomes UNDELIVERABLE. That is about two days of runs, enough to ride out a Resend outage.
8. **Retry once.** If any send failed, wait 2 minutes, then repeat steps 4–7 for at most that many Letters. The failed Letters are claimed again under their new `attempts`, so each retry has a new key. Hobby stops a function at 300 s, so the retry takes only as many Letters as fit in the time left, at ~1 s a send. The 07:00 and 08:00 runs cover longer outages.

Overflow waits for the next day's run. A missed or doubled cron run is harmless: the claim step and the idempotency key cover it.

**Failure report** `GET /api/cron/report`, run at 09:00 UTC after the last delivery run, with the same `CRON_SECRET` check and `?now=` rule:
- It lists Letters made UNDELIVERABLE today (`claimedAt` since midnight UTC), Letters that were due by 08:00 UTC but are still SCHEDULED, and any Letter still SENDING. Due-ness is judged at 08:00, so a Letter that only becomes due later that day (Alaska, Hawaii) isn't a false alarm.
- If there are any, it emails a plain-text list to `ops@kesho.et`: id, status, attempts and `lastError`, never content or emails. On a day with nothing to list it sends nothing.
- The 08:00 run's logs are usually still in Vercel's 1-hour window when the report arrives. Earlier runs' logs are gone, but each Letter's `lastError` stays in the database.
- A Delivered Letter's `lastError` is cleared, so an error in the report is always the current one.
- **Known limits:**
  - A hard bounce the webhook records after the report goes out is never reported. A soft one shows up as due the next day.
  - An 08:00 run that fires late and is still sending at 09:00 shows as SENDING.
  - The report is one of the 10 emails kept outside the run's budget. If the day's quota is already spent, it fails.

**Bounce webhook** `POST /api/webhooks/resend` (production only):
- Verify the svix signature with `RESEND_WEBHOOK_SECRET`.
- Dedupe on `svix-id` via `WebhookEvent`, then map `resendEmailId` → Letter.
- `email.bounced` (Permanent), `email.suppressed` or `email.complained` → UNDELIVERABLE at once.
- Transient/Undetermined bounces and `email.failed` → `attempts+1`, back to SCHEDULED, and UNDELIVERABLE at 12.
- Only a DELIVERED Letter moves, so a late event can't undo a requeue. An event that matches no Letter while a run holds SENDING Letters gets a 503, and svix retries it, since its Letter's send may not be recorded yet.
- **Known limit:** a requeue resets `attempts` to 0, so it reuses `<env>/delivery/<id>/0`. If that first send was under 24 h ago, Resend refuses the new payload. This costs one attempt, and the retry in step 8 sends it under the next key.

## 8. Email — [Sender identity](https://github.com/wuhibe/kesho/issues/9), [Templates](https://github.com/wuhibe/kesho/issues/10)

Built with React Email, passed to Resend via `react:`, with the plain-text part auto-generated. Fonts are fallback stacks only (Georgia, Helvetica, Courier New). The Delivery look follows the email prototype's variant W; the envelope has since moved away from it.

| Email | From | Subject | Look |
|---|---|---|---|
| Delivery | `You, from <Mon YYYY> <letters@mail.kesho.et>` | the Letter's subject, else `A letter from <Mon YYYY>`; preheader = first line of the body | **A, letter sheet:** cream page with a paper card, a mono `WRITTEN <date> · DELIVERED <date>` label, the subject, the italic serif "Dear future self," and the serif body. Then a divider, "It's in your archive whenever you want it again. Maybe write back to the next you?" and the button **Write the next one →** |
| Verify | `Kesho <hello@mail.kesho.et>` | "Confirm your email to seal your letter" | **C, envelope:** one paper surface edge to edge, with no frame or card, and a sand flap that spans any width, so phones get it unscaled, and a sand hairline above the footer. Its paper (`#faf2ef`) and sand (`#e4cbc3`) are the site's tinted toward red: Gmail's app forces its own dark mode and keeps each colour's hue, so the site's yellowish paper darkens to olive and these to brown. Clients that honour `prefers-color-scheme` (Apple Mail) get the envelope's own dark palette instead. Red stamp "AWAITING YOUR SEAL", "One click to seal it.", a red button **Confirm & seal my letter**, and fine print (1 h expiry, 7-day draft deletion) |
| Reset | same | "Reset your Kesho password" | C, with the stamp "ACCOUNT", the line "Your sealed letters are safe either way." and the button **Choose a new password** |
| Change email | same | "Confirm your new email" | C (the verify template), with the stamp "ACCOUNT" and the line "Your sealed letters will arrive here." |

- **Every email:**
  - Reply-To `hello@kesho.et`.
  - Footer: "Kesho · letters to your future self · kesho.et / You're getting this because of your Kesho account. Replies reach a human at hello@kesho.et."
  - No unsubscribe link, since these are transactional.
- **Outside production:** every send is redirected to `EMAIL_REDIRECT_TO` with a `[preview]`/`[local]` subject prefix.

## 9. Legal — [Copy + legal](https://github.com/wuhibe/kesho/issues/12)

These are plain-English pages and haven't been reviewed by a lawyer. The full outlines are in the ticket.

- **Operator:** Wuhibe Tamire, Addis Ababa. Ethiopian law, age 16+.
- **Terms:**
  - Letters arrive "on or shortly after" their date.
  - Acceptable use: no illegal content, no automated sign-ups.
  - Content stays the user's.
  - Material changes are announced by email.
  - **Shutdown promise:** at least 30 days' notice, and every Sealed Letter is emailed early rather than lost. `scripts/deliver-all-now.ts` runs the delivery path with the due filter ignored; each run sends up to the day's budget, so run it daily until none are left. With production's env (`vercel env pull --environment=production` plus `VERCEL_ENV=production`): `pnpm tsx --env-file=<file> scripts/deliver-all-now.ts` counts, `--yes` sends. `--yes` refuses to start while `DATABASE_URL`, `LETTER_ENCRYPTION_KEY` or `RESEND_API_KEY` is empty, since a failed send costs every claimed Letter an attempt. At 90 a day, 30 days' notice covers about 2,700 Letters, under Resend's 3,000 a month.
- **Privacy:**
  - lists what's stored
  - says honestly that this isn't end-to-end encryption (Kesho holds the key and never reads letters unless compelled by law)
  - names the processors: Vercel, Neon, Resend, Cloudflare (DNS, Email Routing, R2)
  - essential session cookie only, so no banner
  - retention and deletion rights

## 10. Environments & ops — [Environments](https://github.com/wuhibe/kesho/issues/11), [DNS](https://github.com/wuhibe/kesho/issues/9)

| | Local | Preview | Production |
|---|---|---|---|
| DB | Neon `dev` branch | Neon `dev` branch (per-preview branching **off**) | Neon `main`; `prisma migrate deploy` in the build |
| Email | redirected | redirected | real |
| Resend key | dev sending-only | dev | prod sending-only (mail.kesho.et) |
| Cron | manual curl + `?now=` | manual curl + `?now=` | Vercel Cron: deliver 06/07/08:00, report 09:00 UTC |
| Webhook | — | — | `https://kesho.et/api/webhooks/resend` |
| Encryption key | dev | dev | **prod key already generated and in the owner's password manager: use it, never generate a new one** |

- **Env vars:** `DATABASE_URL`, `DATABASE_URL_UNPOOLED`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `LETTER_ENCRYPTION_KEY`, `CRON_SECRET`, `RESEND_API_KEY`, `RESEND_WEBHOOK_SECRET` (prod), `EMAIL_REDIRECT_TO` (non-prod).
  - Set them in Vercel, scoped Production vs Preview+Development.
  - Locally, run `vercel env pull .env.local`.
  - `.gitignore` lists `.env*`.
- **Domain:** `kesho.et` is canonical; `www` gets a 308 redirect to the apex.
- **DNS:** lives in Cloudflare. The Vercel A/CNAME records are **DNS only**.
- **Email setup:** Resend sends from `mail.kesho.et` (already verified). Cloudflare Email Routing forwards `hello@kesho.et` to the owner (live). `ops@kesho.et` receives the failure report, so it needs its own forwarding rule.
- **Backups:**
  - A weekly Sunday GitHub Action (`.github/workflows/backup.yml`) runs `pg_dump` 18 of `main` and uploads `kesho-<YYYY-MM-DD>.dump` to R2, keeping the last 8.
  - Secrets: `BACKUP_DATABASE_URL` (main's unpooled URL), `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET`.
  - Do one restore drill into a scratch Neon branch before launch: `pg_restore --no-owner --no-acl --clean --if-exists --dbname=<scratch branch URL> <dump>`, then compare row counts with `main`.

**Launch checklist:**
- [ ] Vercel project + Neon integration (per-preview branching off, compute capped at 0.25 CU)
- [x] Vercel A/CNAME in Cloudflare (DNS only) + `www` → apex redirect
- [ ] Prod env vars, including the existing encryption key from the password manager
- [x] Resend webhook (prod) + `RESEND_WEBHOOK_SECRET`
- [x] R2 bucket + token + backup Action + one restore drill
- [x] `security.txt`, Vercel Web Analytics on
- [x] Cloudflare Email Routing rule `ops@kesho.et` → owner, for the failure report
- [ ] **Tighten DMARC to `p=quarantine` ~2026-10-15 to 2026-10-22** (the reminder is in the owner's calendar)
- [ ] Verify `kesho.et` in Google Search Console and Bing Webmaster Tools (DNS TXT in Cloudflare; ask first), then submit `https://kesho.et/sitemap.xml` to both
- [ ] List Kesho on AlternativeTo (as a FutureMe alternative) and Product Hunt, and ask the "FutureMe alternatives" roundups to include it
- [x] Nameservers → Cloudflare, Cloudflare MFA, Email Routing, DMARC `p=none`, Resend domain verified, restricted Resend keys, prod encryption key backed up

## 11. Build issues (ordered vertical slices)

| # | Slice | Delivers | Depends on |
|---|---|---|---|
| 1 | **Skeleton + deploy** | Next.js + Tailwind tokens + fonts, Prisma 7 + Neon (dev/main), the empty `Letter` model, Vercel project on kesho.et with DNS records + www redirect, `.gitignore`, the `encrypt`/`decrypt` helpers with a round-trip + tamper check | — |
| 2 | **Accounts** | better-auth (sign up / log in / verify / reset / change email / change password / delete account), DB rate limiting, React Email templates for verify/reset/change-email (C), non-prod email redirect, `/reset-password` | 1 |
| 3 | **Write & seal** | The `/` composer (Variant A) + auth modal + localStorage draft, Letter creation (validation, tz, 20 cap, PENDING/SCHEDULED), the `afterEmailVerification` flip, `/check-inbox`, `/sealed/[id]` | 2 |
| 4 | **Your letters** | `/letters`: the Sealed list + cancel, Archive + delete, account actions, empty/banner states | 3 |
| 5 | **Delivery run** | `/api/cron/deliver` (auth, `?now=`, stale release, purge, budget, atomic claim, idempotent send, failure rules), the delivery email (A), `vercel.json` cron, a check for the due-date/tz logic | 3 |
| 6 | **Bounces** | `/api/webhooks/resend` (svix, dedupe, hard/soft mapping), the Undeliverable banner, requeue on email change | 4, 5 |
| 7 | **Legal & polish** | `/terms`, `/privacy`, footer, security.txt, Vercel Analytics, copy pass | 1 |
| 8 | **Ops** | the weekly R2 backup Action + restore drill, `scripts/deliver-all-now`, the launch checklist | 5 |

Slices 4, 5 and 7 can run in parallel once their dependencies land.
