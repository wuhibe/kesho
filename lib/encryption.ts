import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";

// AES-256-GCM with an app-held key, versioned for rotation (ADR 0002).
// Stored form: "v1:" + base64(iv | tag | ciphertext).
const VERSION = "v1:";
const IV_BYTES = 12;
const TAG_BYTES = 16;

export function encrypt(plaintext: string): string {
  const iv = randomBytes(IV_BYTES);
  const cipher = createCipheriv("aes-256-gcm", readKey(), iv);
  const ciphertext = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  return VERSION + Buffer.concat([iv, cipher.getAuthTag(), ciphertext]).toString("base64");
}

/** Throws if the value was tampered with or sealed under another key. */
export function decrypt(stored: string): string {
  if (!stored.startsWith(VERSION)) throw new Error("Unknown encryption version");
  const bytes = Buffer.from(stored.slice(VERSION.length), "base64");
  const decipher = createDecipheriv("aes-256-gcm", readKey(), bytes.subarray(0, IV_BYTES));
  decipher.setAuthTag(bytes.subarray(IV_BYTES, IV_BYTES + TAG_BYTES));
  return Buffer.concat([decipher.update(bytes.subarray(IV_BYTES + TAG_BYTES)), decipher.final()]).toString("utf8");
}

// Read per call so importing this module never needs the env var (e.g. at build time).
function readKey(): Buffer {
  const key = Buffer.from(process.env.LETTER_ENCRYPTION_KEY ?? "", "base64");
  if (key.length !== 32) throw new Error("LETTER_ENCRYPTION_KEY must be 32 bytes, base64-encoded");
  return key;
}
