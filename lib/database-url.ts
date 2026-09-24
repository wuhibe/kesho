// pg 8 treats these modes as verify-full, but pg 9 gives them libpq's weaker meaning: encrypt
// without checking the server's certificate. Naming verify-full keeps today's check.
const WEAKENED_SSL_MODES = new Set(["prefer", "require", "verify-ca"]);

/** The Postgres URL with its TLS pinned to verify-full wherever pg 9 would weaken it. */
export function withVerifiedTls(connectionString: string): string {
  let url: URL;
  try {
    url = new URL(connectionString);
  } catch {
    // URL's own error carries the input, password included, into the logs.
    throw new Error("The database URL is not a valid URL");
  }
  const sslMode = url.searchParams.get("sslmode");
  if (sslMode !== null && WEAKENED_SSL_MODES.has(sslMode)) url.searchParams.set("sslmode", "verify-full");
  return url.toString();
}
