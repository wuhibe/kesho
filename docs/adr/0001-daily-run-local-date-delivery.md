# One daily delivery run, due by the Author's local date

Letters are delivered by a single Vercel Cron run at 06:00 UTC, not an hourly scheduler. A Letter is due when the run's time, converted to the Author's stored IANA timezone, has reached the Delivery date. We chose this because Vercel Hobby allows only daily cron, and an external hourly trigger (GitHub Actions, QStash) adds a moving part. Judging due-ness in the Author's timezone means a Letter can arrive late on the right day (west of UTC it arrives in the evening) but never a day early.

**Consequences:**
- Each Letter stores `timeZone`.
- Delivery time of day isn't user-selectable.
- The daily Resend quota (100) means overflow slips a day, which the Terms disclose ("on or shortly after").
