import assert from "node:assert/strict";
import { randomBytes } from "node:crypto";
import { test } from "node:test";
import { decrypt, encrypt } from "./encryption.ts";

process.env.LETTER_ENCRYPTION_KEY = randomBytes(32).toString("base64");

test("a letter body survives an encrypt/decrypt round-trip", () => {
  const body = "Dear future me,\nDid you finish the marathon? 🏃🏾";
  const stored = encrypt(body);
  assert.match(stored, /^v1:/);
  assert.equal(decrypt(stored), body);
});

test("a tampered ciphertext fails to decrypt", () => {
  const bytes = Buffer.from(encrypt("sealed").slice(3), "base64");
  bytes[bytes.length - 1] ^= 1;
  assert.throws(() => decrypt("v1:" + bytes.toString("base64")), /unable to authenticate/);
});
