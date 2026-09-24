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
| Scheduler | Vercel Cron `0 6 * * *` (fires 06:00–06:59 UTC, 300 s max) | see §7 |
| Encryption | `node:crypto` AES-256-GCM, app-held key | see [ADR 0002](adr/0002-app-held-key-encryption.md) |
| Analytics | Vercel Web Analytics (cookieless) | |
| Backups | weekly GitHub Action `pg_dump` → Cloudflare R2 | see §10 |

## 3. Pages — [Composer prototype](https://github.com/wuhibe/kesho/issues/7), [Copy](https://github.com/wuhibe/kesho/issues/12)

The chosen design is Variant A, the letter sheet. Its prototype is on branch `prototype/composer-flow`, route `/prototype/composer?variant=A`. The prototype is a reference to rewrite from, not code to promote.

| Route | Content |
|---|---|
| `/` | **Header:** "Write to the you of tomorrow." + "Kesho means tomorrow in Swahili. Write it now; we'll seal it and email it to you on the day you choose, up to five years from now." **Letter sheet:** today's date as a mono label, an optional subject (≤150), the italic script salutation "Dear future me,", a ruled serif body (≤20,000 chars) and a word count. **Send bar:** presets 6 months / 1 year / 3 years / 5 years / Pick a date (`<input type=date min=tomorrow max=+5y>`), the resolved line "→ ARRIVES 24 SEPT 2027 · IN 365 DAYS", and a **Send to the future →** button, disabled until the body has text. The bar floats on md+ and sits inline on mobile. The draft autosaves to `localStorage`. |
| Auth modal (over `/`) | "Where should it arrive?", a "New here / I have an account" toggle, email and password (8+), and "Forgot password?" in login mode. **Sign up:** "Create account & seal letter", followed by the consent line: "We'll email you a link… By continuing you confirm you're 16+ and agree to the Terms." **Log in:** "Log in & seal letter". |
| `/check-inbox` | An envelope stamped PENDING, "Check your inbox." with the echoed email, Resend (30 s cooldown), "Wrong email?" (reopens the modal) and the 7-day discard note |
| `/sealed/[id]` | An envelope stamped SEALED, "DO NOT OPEN BEFORE <date>", "See you in N days.", and Write another / My letters |
| `/letters` (auth) | "Your letters". An Undeliverable banner ("One letter couldn't reach you… Update your email") when relevant. **Sealed · N of 20:** subject or "Untitled letter", `OPENS <date> · N DAYS` or `PENDING · VERIFY YOUR EMAIL`, and Cancel with an inline "Delete forever?" confirm. **Archive:** expandable rows with the body in serif, marked UNDELIVERABLE where relevant, plus Delete. **Account:** Change email / Change password / Delete account (with a confirm). Empty state: "Nothing sealed yet. Future you is waiting." |
| `/reset-password` | request form + set-new-password form (token from email) |
| `/terms`, `/privacy` | see §9 |
| `/.well-known/security.txt` | `Contact: mailto:hello@kesho.et` · `Expires: 2027-09-24T00:00:00.000Z` · `Preferred-Languages: en` · `Canonical: https://kesho.et/.well-known/security.txt` |

**Look ([Fonts](https://github.com/wuhibe/kesho/issues/5)):**
- **Colours:** cream `#f0ebe2` page, paper `#faf7f1` surfaces, ink `#210c02` text and primary pill buttons. Red `#c42121` is used only for emphasis words and destructive actions. Sand `#e1d8c4`, bark `#7b6556`, muted `#5a6a92`.
- **Focus styles:** **neutral ink, never red.** Inputs get an ink border; buttons and links get a soft ink outline.
- **Fonts:** via `next/font/google`, all OFL:
  - Instrument Sans for UI and headings
  - Fragment Mono for small uppercase labels
  - Newsreader for the letter body and archive
  - Zeyada for the salutation only, with `font-synthesis: none`
- **Motion:** respect `prefers-reduced-motion`.
- **Brand:** don't copy the givingli brand or its fonts.
- **Logo mark:** "Tomorrow's sun": a paper `#faf7f1` half sun over two horizon bars on a red `#c42121` rounded square. The files are `app/icon.svg` (master), `app/favicon.ico` (16/32/48) and `app/apple-icon.png` (180, full-bleed; iOS rounds it). Next.js serves them by file convention, so no `<link>` tags are needed.

**Copy strings:**
- **20-letter cap:** "You have 20 sealed letters, the most we hold at once. Let one arrive or cancel one to write another."
- **Expired or used link:** "This link has expired. Log in and we'll send a fresh one." On `/reset-password`, where logging in isn't an option: "This link has expired. Enter your email and we'll send a fresh one."
- **Rate limited:** "Too many tries. Wait a minute and try again."
- **Anything else failed:** "Something went wrong. Try again."
- **Wrong credentials:** "That email and password don't match." (never reveals whether the account exists)
- **Email changed:** "Your sealed letters will now arrive at the new address."

## 4. Data model — [Data model + lifecycle](https://github.com/wuhibe/kesho/issues/6)

better-auth owns `user`, `session`, `account`, `verification` and `rateLimit`, generated by `npx auth@latest generate` into `schema.prisma`. Kesho adds:

```prisma
enum LetterStatus { PENDING SCHEDULED SENDING DELIVERED UNDELIVERABLE }

model Letter {
  id            String       @id @default(cuid())
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
                                     │   └── soft fail, attempts<3 ◀──┤
            new email verified ──────┘                                └─ hard bounce / suppressed / complaint / 3rd fail ─▶ UNDELIVERABLE
Cancel (PENDING|SCHEDULED) = hard delete · Delete from Archive (DELIVERED|UNDELIVERABLE) = hard delete
```

- **Create:**
  - Validate: the body is non-empty, the Delivery date is in `[tomorrow, +5y]` in the Author's tz, and the Author has fewer than 20 PENDING+SCHEDULED Letters.
  - The Letter is created SCHEDULED if the Author is verified, otherwise PENDING.
- **Verify:** better-auth's `emailVerification.afterEmailVerification` flips every PENDING Letter of that user to SCHEDULED.
- **Sealed:** the body of a PENDING/SCHEDULED Letter is **never decrypted or sent to the client**. The dashboard decrypts only the subject.
- **Recipient:** `user.email`, read at send time.
- **Email change:** better-auth's `changeEmail` sends a verification to the new address. When it's confirmed, UNDELIVERABLE → SCHEDULED with `attempts = 0`.
- **Account deletion:** cascades to all of the Author's Letters.

## 6. Auth — [Stack](https://github.com/wuhibe/kesho/issues/2)

- **Options:** `emailAndPassword: { enabled, requireEmailVerification: true, sendResetPassword, revokeSessionsOnPasswordReset: true }` and `emailVerification: { sendVerificationEmail, sendOnSignUp: true, sendOnSignIn: true, autoSignInAfterVerification: true, afterEmailVerification }`. `sendOnSignIn` is what makes "Log in and we'll send a fresh one" true. `user: { changeEmail: { enabled: true }, deleteUser: { enabled: true } }`.
- **Token lifetimes:** 1 h. Sessions last 7 days.
- **Sending mail:** don't `await` sends inside auth callbacks. Use `after()` / `waitUntil` so response timing can't be used to probe accounts. Each callback hands its send to `after()` itself: better-auth awaits `/send-verification-email` directly, so `advanced.backgroundTasks` doesn't cover it.
- **Rate limiting:** `rateLimit: { storage: "database", window: 60, max: 100, customRules }`; the rules allow 3 requests per 60 s on `/sign-up/email`, `/sign-in/email` (it re-sends verification), `/request-password-reset` and `/send-verification-email`, since each one sends an email.
- **`BETTER_AUTH_URL`:**
  - prod: `https://kesho.et`
  - preview: from `VERCEL_URL` (ahead of any `BETTER_AUTH_URL`), added to `trustedOrigins` with `VERCEL_BRANCH_URL`
  - local: `http://localhost:3000`
- **Middleware** (`proxy.ts` since Next.js 16): auth middleware **excludes `/api/cron/*` and `/api/webhooks/*`**. A redirect there silently breaks cron. Its matcher lists the signed-in routes (`/letters`) rather than excluding public ones.

## 7. Delivery run — [Email + cron](https://github.com/wuhibe/kesho/issues/3), [ADR 0001](adr/0001-daily-run-local-date-delivery.md)

`GET /api/cron/deliver`. Requests without `Authorization: Bearer $CRON_SECRET` are rejected, and so are requests where the secret is unset.

1. **Establish the run time.** `now` is the current time. Outside production (`VERCEL_ENV !== 'production'`) a `?now=YYYY-MM-DD` override is honoured.
2. **Release stale claims.** SENDING rows with `claimedAt < now − 1h` go back to SCHEDULED.
3. **Purge.** Delete unverified users with `createdAt < now − 7d`; their PENDING Letters cascade.
4. **Work out the budget.** `min(90, 100 − emails sent today)`. Track sends-today by counting in the DB or keeping a daily counter.
5. **Claim the due Letters.** A Letter is due when `status = 'SCHEDULED' AND (now AT TIME ZONE "timeZone")::date >= "deliveryDate"`. Claim them atomically:
   ```sql
   UPDATE "Letter" SET status='SENDING', "claimedAt"=now()
   WHERE id IN (SELECT id FROM "Letter" WHERE <due> ORDER BY "deliveryDate","createdAt" LIMIT $budget FOR UPDATE SKIP LOCKED)
   RETURNING *
   ```
6. **Send each Letter.** One `POST /emails` per Letter with `Idempotency-Key: delivery/<id>/<attempts>`. The payload must be byte-identical across retries: build it only from stored data.
7. **Handle the result.**
   - **Success:** DELIVERED, set `deliveredAt` and `resendEmailId`.
   - **Quota 429:** back to SCHEDULED, with no attempt counted.
   - **Other failure:** `attempts+1` and back to SCHEDULED; on the 3rd failure the Letter becomes UNDELIVERABLE.

Overflow waits for the next day's run. A missed or doubled cron run is harmless: the claim step and the idempotency key cover it.

**Bounce webhook** `POST /api/webhooks/resend` (production only):
- Verify the svix signature with `RESEND_WEBHOOK_SECRET`.
- Dedupe on `svix-id` via `WebhookEvent`, then map `resendEmailId` → Letter.
- `email.bounced` (Permanent), `email.suppressed` or `email.complained` → UNDELIVERABLE at once.
- Transient/Undetermined bounces and `email.failed` → `attempts+1`, back to SCHEDULED, and UNDELIVERABLE at 3.

## 8. Email — [Sender identity](https://github.com/wuhibe/kesho/issues/9), [Templates](https://github.com/wuhibe/kesho/issues/10)

Built with React Email, passed to Resend via `react:`, with the plain-text part auto-generated. Fonts are fallback stacks only (Georgia, Helvetica, Courier New). The prototype is on branch `prototype/email-templates`, route `/prototype/emails?variant=W`.

| Email | From | Subject | Look |
|---|---|---|---|
| Delivery | `You, from <Mon YYYY> <letters@mail.kesho.et>` | the Letter's subject, else `A letter from <Mon YYYY>`; preheader = first line of the body | **A, letter sheet:** cream page with a paper card, a mono `WRITTEN <date> · OPENED <date>` label, the subject, the italic serif "Dear future me," and the serif body. Then a divider, "It's in your archive whenever you want it again. Maybe write back to the next you?" and the button **Write the next one →** |
| Verify | `Kesho <hello@mail.kesho.et>` | "Confirm your email to seal your letter" | **C, envelope:** ink page, sand flap, red stamp "AWAITING YOUR SEAL", "One click to seal it.", a red button **Confirm & seal my letter**, and fine print (1 h expiry, 7-day draft deletion) |
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
  - **Shutdown promise:** at least 30 days' notice, and every Sealed Letter is emailed early rather than lost. The build needs a `scripts/deliver-all-now` that runs the delivery path with the due filter ignored.
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
| Cron | manual curl + `?now=` | manual curl + `?now=` | Vercel Cron |
| Webhook | — | — | `https://kesho.et/api/webhooks/resend` |
| Encryption key | dev | dev | **prod key already generated and in the owner's password manager: use it, never generate a new one** |

- **Env vars:** `DATABASE_URL`, `DATABASE_URL_UNPOOLED`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `LETTER_ENCRYPTION_KEY`, `CRON_SECRET`, `RESEND_API_KEY`, `RESEND_WEBHOOK_SECRET` (prod), `EMAIL_REDIRECT_TO` (non-prod).
  - Set them in Vercel, scoped Production vs Preview+Development.
  - Locally, run `vercel env pull .env.local`.
  - `.gitignore` lists `.env*`.
- **Domain:** `kesho.et` is canonical; `www` gets a 308 redirect to the apex.
- **DNS:** lives in Cloudflare. The Vercel A/CNAME records are **DNS only**.
- **Email setup:** Resend sends from `mail.kesho.et` (already verified). Cloudflare Email Routing forwards `hello@kesho.et` to the owner (live).
- **Backups:**
  - A weekly Sunday GitHub Action runs `pg_dump` of `main` and uploads it to R2, keeping the last 8.
  - Secrets: `BACKUP_DATABASE_URL`, `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET`.
  - Do one restore drill into a scratch Neon branch before launch.

**Launch checklist:**
- [ ] Vercel project + Neon integration (per-preview branching off, compute capped at 0.25 CU)
- [ ] Vercel A/CNAME in Cloudflare (DNS only) + `www` → apex redirect
- [ ] Prod env vars, including the existing encryption key from the password manager
- [ ] Resend webhook (prod) + `RESEND_WEBHOOK_SECRET`
- [ ] R2 bucket + token + backup Action + one restore drill
- [ ] `security.txt`, Vercel Web Analytics on
- [ ] **Tighten DMARC to `p=quarantine` ~2026-10-15 to 2026-10-22** (the reminder is in the owner's calendar)
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
