---
name: Kesho
description: Letters to your future self, sealed and emailed on the day you choose.
colors:
  cream: "#f0ebe2"
  paper: "#faf7f1"
  ink: "#210c02"
  red: "#c42121"
  sand: "#e1d8c4"
  bark: "#7b6556"
  muted: "#5a6a92"
typography:
  display:
    fontFamily: "Newsreader, ui-serif, Georgia, serif"
    fontSize: "clamp(3rem, 4.4vw, 4.5rem)"
    fontWeight: 400
    lineHeight: 1.25
  headline:
    fontFamily: "Instrument Sans, ui-sans-serif, system-ui, sans-serif"
    fontSize: "3rem"
    fontWeight: 500
    lineHeight: 1
    letterSpacing: "-0.025em"
  title:
    fontFamily: "Instrument Sans, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.875rem"
    fontWeight: 500
    lineHeight: 1.2
    letterSpacing: "-0.025em"
  body:
    fontFamily: "Instrument Sans, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.5
  letter:
    fontFamily: "Newsreader, ui-serif, Georgia, serif"
    fontSize: "1.5rem"
    fontWeight: 400
    lineHeight: "2.5rem"
  salutation:
    fontFamily: "Zeyada, cursive"
    fontSize: "3rem"
    fontWeight: 400
    lineHeight: 1
  label:
    fontFamily: "Fragment Mono, ui-monospace, monospace"
    fontSize: "0.75rem"
    fontWeight: 400
    lineHeight: "1rem"
  label-micro:
    fontFamily: "Fragment Mono, ui-monospace, monospace"
    fontSize: "10px"
    fontWeight: 400
    lineHeight: 1
rounded:
  stamp: "2px"
  envelope: "6px"
  field: "12px"
  bar: "16px"
  sheet: "28px"
  dialog: "32px"
  pill: "9999px"
spacing:
  gutter: "24px"
  row: "16px"
  section: "48px"
  page: "48rem"
components:
  button-primary:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
    rounded: "{rounded.pill}"
    padding: "12px 20px"
  button-primary-disabled:
    backgroundColor: "{colors.sand}"
    textColor: "{colors.bark}"
  button-ghost:
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    padding: "12px 20px"
  button-ghost-hover:
    backgroundColor: "{colors.paper}"
  button-danger:
    backgroundColor: "{colors.red}"
    textColor: "{colors.paper}"
    rounded: "{rounded.pill}"
    padding: "12px 20px"
  chip:
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    padding: "8px 16px"
  chip-selected:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
  input:
    backgroundColor: "#ffffff"
    textColor: "{colors.ink}"
    rounded: "{rounded.field}"
    padding: "12px 16px"
  letter-sheet:
    backgroundColor: "{colors.paper}"
    rounded: "{rounded.sheet}"
    padding: "56px"
  dialog:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.dialog}"
    padding: "32px"
  send-bar:
    backgroundColor: "{colors.cream}"
    rounded: "{rounded.bar}"
    padding: "16px 24px"
  nav-link:
    textColor: "{colors.bark}"
    typography: "{typography.label}"
    height: "44px"
---

# Design System: Kesho

## Overview

**Creative North Star: "The Sealed Envelope"**

Kesho is stationery. A cream desk holds one sheet of letter paper that lifts off it with a soft shadow; ink writes on it; a red stamp seals it. Every surface borrows from paper goods: the composer is a ruled letter sheet, the confirmation screens are an envelope stamped PENDING or SEALED, dates and statuses are typed in mono like a postmark. The wait between writing and delivery is the product, and the visual system makes that wait physical: sealed things look sealed.

Density is low and the pace is unhurried. One column, generous space, few colours, almost no motion. Components are soft and unhurried: round pills, hairline rows, a single float shadow. Nothing shouts, nothing nags, and red appears only where something is sealed, emphasised or destroyed.

**Key Characteristics:**
- Warm cream page, paper surfaces, near-black brown ink. No pure black, no pure white page.
- Four typefaces with strict jobs: sans for UI, mono for labels, serif for the letter, script for the salutation only.
- One shadow (`float`) for everything that lifts off the desk.
- Pills for actions, hairline-divided rows for lists.
- Red is a seal, not a colour scheme.

## Colors

A warm, low-chroma paper palette with one saturated red reserved for seals and danger.

### Primary
- **ink** (`colors.ink`): Text, primary pill buttons, selected chips and segments, the focus ring (at 35% alpha). Used at reduced alpha for secondary text (`ink/70`), placeholders (`ink/50`, 3.5:1 for their large text), field borders (`ink/20`) and hairlines (`ink/10`).

### Secondary
- **red** (`colors.red`): The SEALED and PENDING stamps on the envelope, emphasis words ("See you in 365 days."), the Undeliverable mark and banner link, Delete account, and the danger pill. Also the logo mark's square.

### Neutral
- **cream** (`colors.cream`): The page, the send bar and the phone send drawer.
- **paper** (`colors.paper`): Lifted surfaces: the letter sheet, dialogs, the envelope, banners, ghost-pill hover. Text on ink and red pills.
- **sand** (`colors.sand`): The envelope flap, disabled pill backgrounds, the close-button hover wash (`sand/60`).
- **bark** (`colors.bark`): Mono labels, footer and header links, metadata, disabled pill text.
- **muted** (`colors.muted`): A cool slate used once, for the auth modal's "Forgot password?" link. Rare by design.

### Named Rules
**The Seal Rule.** Red marks only seals, emphasis words and destructive actions. If removing the red would not change what the Author understands, it should not be red.

**The Neutral Focus Rule.** Focus is never red. Buttons and links get a 2px ink outline at 35% alpha with a 2px offset; inputs swap to a solid ink border.

## Typography

**Display Font:** Newsreader (with ui-serif, Georgia)
**Body Font:** Instrument Sans (with ui-sans-serif, system-ui)
**Label/Mono Font:** Fragment Mono (with ui-monospace)
**Script:** Zeyada, for "Dear future self," and "to my future self" only

**Character:** A clean grotesque runs the interface while a bookish serif carries everything the Author writes or reads; small mono caps read like a postmark, and one line of handwriting makes the sheet personal.

### Hierarchy
- **Display** (Newsreader italic, 400, 1.5rem phones / `clamp(3rem, 4.4vw, 4.5rem)` md+, tight leading, balanced): The home `h1` only. It grows with the viewport so it anchors wide screens.
- **Headline** (Instrument Sans 500, 3rem, tracking -0.025em): Page titles such as "Your letters".
- **Title** (Instrument Sans 500, 1.875rem, tracking -0.025em): Dialog titles, the shared `Heading`, the composer subject (1.5rem phones).
- **Body** (Instrument Sans 400, 1rem; 0.875rem in pills, fields and banners): Interface copy. Secondary copy at `ink/70`.
- **Letter** (Newsreader 400, 1.5rem on 2.5rem ruled lines): The composer body. Archive letters drop to 1.25rem with relaxed leading (1.625) and no rules.
- **Salutation** (Zeyada, 2.25rem phones / 3rem md+, `font-synthesis: none`): "Dear future self," on the sheet; the envelope address.
- **Label** (Fragment Mono, 0.75rem, uppercase, bark): Section labels, dates, statuses ("OPENS 24 SEPT 2027 · 365 DAYS"), word count, header and footer links. The sheet's date label adds 0.2em tracking.
- **Label micro** (Fragment Mono, 10px, uppercase): Only inside small objects: the envelope's stamp and the calendar's weekday row. Never for anything the Author must read to act.

### Named Rules
**The One Job Rule.** Each face has one job. Serif is for Letters, mono is for labels, script is for the salutation. Never set UI in serif or a Letter in sans.

**The Postmark Rule.** Dates, counts and statuses are mono caps in bark. Plain sentences are never mono.

## Layout

A single centred column, `max-w-3xl` (48rem), with a 24px side gutter on every page; the site header uses 16px plus 8px link padding so its text lines up with that gutter. The home page stacks: dictionary entry, serif `h1`, letter sheet, How it works, Questions. Page sections are separated by about 48–64px of space and introduced by a mono label, not a heading weight.

Lists are hairline rows: `ink/10` dividers with borders top and bottom, 16px vertical padding per row, content left and actions right, wrapping on narrow screens.

Responsive behaviour turns on `md` (48rem). On md+ the send bar is the sheet's width and sticky: hidden until the letter has text, then pinned 24px above the viewport bottom while the sheet is on screen, resting under the sheet once it scrolls past. Below md the bar is replaced by a floating **Send to the future →** pill bottom-right that opens a bottom drawer; the page pads 96px. The letter sheet's padding grows from 24px/32px to 56px on md+, and its empty body grows from about four ruled lines to 320px, short enough that the sheet ends and the send bar comes into view on a 900px-tall screen. Every tap target is at least 44px.

## Elevation & Depth

Flat by default, with one shadow. Depth means "lifted off the desk": the letter sheet, dialogs, the envelope, the send bar, the floating Send pill, the reset-password card and the Undeliverable banner all use the same `float` shadow, a 1px ink hairline at 6% plus a soft 20px drop. Everything else is flat and separated by hairlines or tone (paper on cream). Dialog backdrops dim the desk with ink at 60% (40% for the phone drawer).

### Shadow Vocabulary
- **float** (`box-shadow: 0 0 0 1px rgb(33 12 2 / 0.06), 0 8px 20px -6px rgb(33 12 2 / 0.25)`): Any paper object resting on the cream desk.

### Named Rules
**The One Sheet Rule.** There is one shadow. A surface either lifts like paper (`float`) or lies flat. No second elevation level, no coloured glows.

## Shapes

Soft, rounded paper. Actions are full pills (9999px). Large paper surfaces are generously curved: the letter sheet (28px) and dialogs (32px); the send bar and drawer top corners are 16px; fields and banners 12px. The envelope is the exception: nearly square corners (6px), tilted -3°, with a triangular sand flap clipped from its top edge and a rectangular stamp (2px corners, 2px red border). The logo mark is a red rounded square with a paper half sun over two horizon bars.

## Components

### Buttons
Soft and unhurried pills; colour changes on hover, nothing moves.
- **Shape:** full pill (9999px), 12px × 20px padding, 0.875rem medium text.
- **Primary (ink pill):** ink background, paper text; hover drops to 85% ink. Disabled turns sand with bark text. Used for Send to the future →, Write a letter, Log in and form submits.
- **Ghost:** transparent with a 20% ink border; hover fills paper.
- **Danger:** red background, paper text; only for irreversible deletes ("Delete account forever").
- **Focus:** the neutral ink outline (Neutral Focus Rule).

### Chips
- **Style:** pill, 8px × 16px, 0.875rem, 20% ink border, transparent; hover fills paper.
- **State:** selected chips fill ink with paper text and `aria-pressed`. Used for Delivery date presets (6 months / 1 year / 3 years / 5 years / Pick a date). A two-way **segment** toggle (New here / I have an account) uses the same on-state inside a shared pill track of sand at 60%.

### Cards / Containers
- **Letter sheet:** paper, 28px corners, `float`, 24–56px padding. Holds the mono date, the subject, the salutation and the ruled body.
- **Dialog:** a native `<dialog>`, paper, 32px corners, `float`, 32px padding, max 28rem wide, centred on all sizes; a 44px round × close top-right that washes sand on hover.
- **Banner:** paper, 12px corners, `float`, 16px padding, 0.875rem text.

### Inputs / Fields
- **Style:** white field, 20% ink border, 12px corners, 12px × 16px padding, 1rem ink text; label above in 0.875rem bark.
- **Composer fields:** borderless on the sheet. The subject has an `ink/10` underline; the body is ruled with a repeating 40px gradient line at 8% ink and grows with its content.
- **Focus:** the border turns solid ink; no outline, no glow.

### Navigation
- **Site header:** logo mark (20px) and "KESHO" wordmark on the left, links on the right, all mono 0.75rem uppercase. Links are bark and turn ink on hover, each padded to a 44px target. It scrolls away with the page.
- **Footer:** the same mono caps register in bark: tagline (hidden below sm), Terms, Privacy, email, each link padded to a 44px target.

### Envelope (signature)
A 288 × 176px paper envelope tilted -3° with the `float` shadow, a sand triangular flap, "to my future self" in script bottom-left with an optional mono bark note, and a red mono stamp (PENDING or SEALED) top-right. It is the visual proof that a Letter is sealed, used on `/check-inbox`, `/sealed/[id]` and the Open Graph image.

### Send bar and drawer
On md+, a cream bar with `float` and 16px corners, exactly the sheet's width, holding the preset chips, the mono "→ ARRIVES …" line and the ink Send pill. It stays hidden (and out of the tab order) until the body has text, then fades and slides up 12px over 300ms ease-out and sticks to the viewport bottom until the sheet scrolls past. Below md the same contents live in a bottom-sheet `<dialog>` (cream, 16px top corners) opened by a floating ink pill, with a mono "Hide" control.

## Do's and Don'ts

### Do:
- **Do** set every page on cream and every lifted object on paper with the `float` shadow.
- **Do** keep red to seals, emphasis words and destructive actions (The Seal Rule).
- **Do** set dates, counts and statuses in mono caps, bark, 0.75rem (The Postmark Rule).
- **Do** render Letter text in Newsreader on 2.5rem lines, and use Zeyada only for the salutation and envelope address.
- **Do** use full pills for actions and hairline `ink/10` rows for lists.
- **Do** keep focus neutral ink and every target at least 44px.
- **Do** honour `prefers-reduced-motion`; motion stays at colour transitions, the send bar's arrival and the Archive row's + turning to ×.

### Don't:
- **Don't** use red for focus rings, links in general, success states or decoration.
- **Don't** add a second shadow, gradients (beyond the ruled lines), glows or glassmorphism.
- **Don't** use pure black text or a pure white page; white is for input fields only.
- **Don't** set interface copy in serif or script, or mono for running sentences.
- **Don't** hint at a Sealed body anywhere: no blurred previews, excerpts or peeking envelopes.
- **Don't** use em-dashes in copy; use a middle dot or a full stop.
- **Don't** introduce third-party brand marks or commercial fonts.
