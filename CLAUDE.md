# Kesho

Letters to your future self, emailed on a chosen date. One Next.js app on Vercel.

## Read first

- **`docs/SPEC.md`**: the approved build spec. Build exactly what it says. When the code needs to differ, update the spec (and add an ADR in `docs/adr/` if the change is hard to reverse) in the same PR.
- **`CONTEXT.md`**: domain glossary. Name code after these terms (`Author`, `Letter`, `deliveryDate`, `SCHEDULED`, `Sealed`, `Archive`) and use them in UI copy and commits.
- **Build issues**: GitHub issues labelled `build` (`gh issue list --label build`). A session prompt of just "build #N" is enough: read that issue, then the SPEC sections it cites. Work one issue per branch, in dependency order; the native "blocked by" links show what's ready. Leave later slices to their own issues.

## Material outside `main`

- `.env` / `.env.local` (local, gitignored): dev secrets. Production `LETTER_ENCRYPTION_KEY` lives in the owner's password manager; ask for it, and reuse it forever (ADR 0002).
- `givingli-design/` (local, gitignored): design reference for the `givingli-design` skill. Take colour, spacing and motion from it; fonts come from SPEC §3.
- UI prototypes live on the branches `prototype/composer-flow` and `prototype/email-templates`. Treat them as reference to rewrite from.

## Repo tooling

`package.json` already holds the repo tooling (husky, commitlint, `"prepare": "husky"`). When scaffolding Next.js, generate into a temp dir and merge deps/scripts into the existing file; keep `prepare`, and add `lint`, `typecheck` and `test` scripts so the pre-commit hook runs them.

Tests use `node --test` with native type stripping, so a test imports its module with the `.ts` extension. `AGENTS.md` holds the Next.js version notes that `next dev` manages: @AGENTS.md

## Workflow

1. Branch from `main` (`feat/…`, `fix/…`, `chore/…`, `docs/…`).
2. Make the change with its test (see Clean code → Tests).
3. **Review before every commit:**
   - Stage the change and run the `code-review` skill on the staged diff. The Standards axis is this file; the Spec axis is the build issue plus `docs/SPEC.md`. Without that skill, have a reviewer subagent check the staged diff against both.
   - Fix every finding, or note why it stands.
   - Show the owner (wuhibe) the review summary and the list of files, and commit only after their go-ahead.
4. Commit with a Conventional Commit message (`feat(letters): seal on verification`). Husky runs commitlint on the message and lint/typecheck/test on pre-commit; a red hook means fix the cause and commit again.
5. Open a PR that closes the build issue; ask before any Vercel, DNS or Resend dashboard change.

## Clean code

**Shape**
- Small modules with one job; a file reads top-down: exports first, helpers below.
- Functions do one thing at one level of abstraction; prefer early returns over nesting.
- Pure logic (due-date math, validation, encryption, lifecycle transitions) lives in plain TS modules under `lib/`, separate from React and route handlers, so it can be tested directly.
- Server by default: React Server Components and Server Actions; add `'use client'` only to the smallest component that owns state or handles browser events.
- Reuse before writing: search the codebase, then the platform (native inputs, CSS, Postgres constraints), then installed deps. Add a dependency only when it removes real code.

**Components**
- One component per file, the file named after it in kebab-case (`SubmitButton` → `submit-button.tsx`). Shared UI lives in `components/`; a component used by one route sits beside its `page.tsx`. Non-component helpers go in a `.ts` file.
- Named exports only. Default exports are only for the files Next.js requires them from (`page.tsx`, `layout.tsx`): declare the component, then `export default Page;` at the end.
- Declare components as typed arrow functions: `const Field: FC<{ label: string } & ComponentProps<"input">> = ({ label, ...input }) => …`. Pages too: `const Page: FC<PageProps<"/route">> = async ({ searchParams }) => …`.
- Import React types by name (`import type { FC, ReactNode } from "react"`); never write `React.ReactNode`.
- ESLint enforces all of this except the `FC` annotation (`eslint.config.mjs`).

**Naming**
- Names say intent in domain language: `sealLetter`, `isDue`, `releaseStaleClaims`.
- Booleans read as questions (`isVerified`, `hasReachedCap`); units in names where ambiguous (`timeoutMs`).
- One word per concept across the codebase: a `Letter` is always a letter, a delivery is always a delivery.

**Types & data**
- TypeScript `strict`; types flow from Prisma and the schema; `unknown` plus narrowing at boundaries.
- Validate every input at the trust boundary (form data, route params, webhooks, env vars) and hand typed values inward.
- Keep state transitions in one place: every `LetterStatus` change goes through the lifecycle module.

**Errors & security**
- Handle errors where you can act on them; let the rest surface to the route's error boundary with a useful message.
- User-facing errors use the copy strings from SPEC §3 and never reveal whether an account exists.
- Secrets come from env vars only; logs carry ids and statuses, never letter content, emails or tokens.
- Bodies of Sealed Letters stay encrypted until delivery; decrypt only in the delivery path and the Archive.

**Comments**
- Comments explain *why* (a constraint, a trade-off, a link to the SPEC section or ADR); the code explains *what*.
- Delete dead code and commented-out blocks; git remembers.

**Tests**
- Every piece of non-trivial logic ships with one focused test that fails if the logic breaks: due-date by timezone, encryption round-trip and tamper, lifecycle transitions, the delivery claim, webhook mapping.
- Test behaviour through the public function; one assertion theme per test; names read as sentences.

**Style**
- Formatting and lint rules live in config; follow the tools.
- Tailwind tokens from the theme (`bg-paper`, `text-ink`); focus styles stay neutral ink (SPEC §3).
