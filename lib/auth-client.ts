import { createAuthClient } from "better-auth/react";

// Browser calls go through /api/auth over HTTP, where better-auth's rate limits apply (SPEC §6).
export const authClient = createAuthClient();
