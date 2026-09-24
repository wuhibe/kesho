# Letters encrypted at rest with an app-held key (not end-to-end)

Letter subjects and bodies are encrypted with AES-256-GCM, using a single key held in the app's environment (`LETTER_ENCRYPTION_KEY`). Stored values are prefixed with a key version (`v1:`). This protects against database leaks and provider access. It is deliberately not end-to-end: the server must decrypt Letters to email them years later, while the Author may not be present to supply a key. The Privacy page says so plainly.

**Consequences:**
- Losing the production key makes every Letter unreadable, so it is backed up in the owner's password manager and must be reused, never regenerated.
- Letter contents can't be searched.
- The version prefix allows rotation by re-encrypting.
