import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { randomBytes, randomUUID } from "node:crypto";
import { after, before, beforeEach, test } from "node:test";
import type { LetterStatus } from "@/lib/generated/prisma/client";

// Each test empties the tables, so only a local Postgres is allowed (issue #28).
const url = process.env.TEST_DATABASE_URL ?? "";
const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "[::1]"]);
if (!URL.canParse(url) || !LOCAL_HOSTS.has(new URL(url).hostname)) {
  throw new Error("Set TEST_DATABASE_URL to a local Postgres, e.g. postgresql://localhost:5432/kesho_test");
}
process.env.DATABASE_URL = url;
process.env.LETTER_ENCRYPTION_KEY = randomBytes(32).toString("base64");

// Imported after the env is set: lib/db.ts reads DATABASE_URL on import.
const { db } = await import("@/lib/db");
const { encrypt } = await import("@/lib/encryption");
const { claimLetters, deleteLetter, listLetters, scheduleVerifiedLetters, sealLetter } = await import("@/lib/letters");

const now = new Date("2027-01-02T06:00:00Z");
const due = new Date("2027-01-01");

before(() => {
  execFileSync("prisma", ["migrate", "deploy"], { env: { ...process.env, DATABASE_URL_UNPOOLED: url }, stdio: ["ignore", "ignore", "inherit"] });
});

beforeEach(async () => {
  await db.$executeRaw`TRUNCATE "user", "Letter", "WebhookEvent" CASCADE`;
});

after(async () => {
  await db.$disconnect();
});

test("an Author cannot delete another Author's Letter", async () => {
  const [ada, ben] = await Promise.all([addAuthor(), addAuthor()]);
  const id = await addLetter(ada, { status: "SCHEDULED" });

  assert.equal(await deleteLetter(id, ben), false);
  assert.equal(await db.letter.count({ where: { id } }), 1);
});

test("a Letter the daily run has claimed cannot be deleted", async () => {
  const ada = await addAuthor();
  const id = await addLetter(ada, { status: "SENDING" });

  assert.equal(await deleteLetter(id, ada), false);
  assert.equal(await db.letter.count({ where: { id } }), 1);
});

test("the letters list never reads the body of a Sealed Letter", async () => {
  const ada = await addAuthor();
  // Undecryptable, so listLetters throws if it ever reads it.
  await addLetter(ada, { status: "SCHEDULED", body: "not ciphertext" });

  const { sealed } = await listLetters(ada);
  assert.equal(sealed.length, 1);
  assert.equal("body" in sealed[0], false);
});

test("a claimed Letter is in neither the Sealed list nor the Archive", async () => {
  const ada = await addAuthor();
  const scheduled = await addLetter(ada, { status: "SCHEDULED" });
  const delivered = await addLetter(ada, { status: "DELIVERED" });
  await addLetter(ada, { status: "SENDING" });

  const { sealed, archive } = await listLetters(ada);
  assert.deepEqual(sealed.map((letter) => letter.id), [scheduled]);
  assert.deepEqual(archive.map((letter) => letter.id), [delivered]);
});

test("sealing a twenty-first Sealed Letter is capped", async () => {
  const ada = await addAuthor();
  await Promise.all(Array.from({ length: 20 }, () => addLetter(ada, { status: "SCHEDULED" })));

  assert.equal(await sealLetter({ id: ada, emailVerified: true }, draft()), "capped");
  assert.equal(await db.letter.count({ where: { authorId: ada } }), 20);
});

test("sealing a Letter id another Author holds is refused", async () => {
  const [ada, ben] = await Promise.all([addAuthor(), addAuthor()]);
  const id = await addLetter(ada, { status: "SCHEDULED" });

  assert.equal(await sealLetter({ id: ben, emailVerified: true }, { ...draft(), id }), "id-taken");
  assert.equal(await db.letter.count({ where: { authorId: ben } }), 0);
});

test("verifying an email schedules Pending Letters and requeues Undeliverable ones", async () => {
  const [ada, ben] = await Promise.all([addAuthor(), addAuthor()]);
  const pending = await addLetter(ada, { status: "PENDING" });
  const undeliverable = await addLetter(ada, { status: "UNDELIVERABLE", attempts: 3, lastError: "bounced" });
  const othersPending = await addLetter(ben, { status: "PENDING" });

  await scheduleVerifiedLetters(ada);

  const letters = await db.letter.findMany({
    where: { id: { in: [pending, undeliverable] } },
    select: { status: true, attempts: true, lastError: true },
  });
  const requeued = { status: "SCHEDULED", attempts: 0, lastError: null };
  assert.deepEqual(letters, [requeued, requeued]);
  assert.equal((await db.letter.findUniqueOrThrow({ where: { id: othersPending } })).status, "PENDING");
});

test("a run claims only due Letters, soonest first, up to its budget", async () => {
  const ada = await addAuthor();
  // Inserted latest first, so table order alone can't pass.
  await addLetter(ada, { status: "SCHEDULED", deliveryDate: new Date("2027-06-01") });
  const today = await addLetter(ada, { status: "SCHEDULED", deliveryDate: new Date("2027-01-02") });
  const next = await addLetter(ada, { status: "SCHEDULED", deliveryDate: new Date("2027-01-01") });
  const soonest = await addLetter(ada, { status: "SCHEDULED", deliveryDate: new Date("2026-12-30") });

  assert.deepEqual(idsOf(await claimLetters(now, 2, "due")), [soonest, next].sort());
  assert.deepEqual(idsOf(await claimLetters(now, 10, "due")), [today]);
});

test("of two Letters due the same day, the older one is claimed first", async () => {
  const ada = await addAuthor();
  // The status/deliveryDate index already sorts by date; within one date it returns insertion
  // order, so the newer Letter goes in first and only ORDER BY "createdAt" picks the older.
  await addLetter(ada, { status: "SCHEDULED", createdAt: new Date("2026-06-02") });
  const older = await addLetter(ada, { status: "SCHEDULED", createdAt: new Date("2026-06-01") });

  assert.deepEqual(idsOf(await claimLetters(now, 1, "due")), [older]);
});

test("two runs at once never claim the same Letter", async () => {
  const ada = await addAuthor();
  await Promise.all(Array.from({ length: 10 }, () => addLetter(ada, { status: "SCHEDULED", deliveryDate: due })));

  const [first, second] = await Promise.all([claimLetters(now, 10, "due"), claimLetters(now, 10, "due")]);
  const ids = [...first, ...second].map((letter) => letter.id);
  assert.equal(ids.length, 10);
  assert.equal(new Set(ids).size, 10);
});

async function addAuthor(): Promise<string> {
  const id = randomUUID();
  await db.user.create({ data: { id, name: "Author", email: `${id}@example.com`, emailVerified: true } });
  return id;
}

async function addLetter(
  authorId: string,
  fields: { status: LetterStatus; body?: string; deliveryDate?: Date; createdAt?: Date; attempts?: number; lastError?: string },
): Promise<string> {
  const { body = encrypt("Dear future me"), deliveryDate = due, ...rest } = fields;
  const letter = await db.letter.create({
    data: { authorId, body, deliveryDate, timeZone: "UTC", ...rest },
    select: { id: true },
  });
  return letter.id;
}

// RETURNING has no guaranteed order, so claims compare as sorted ids.
function idsOf(letters: { id: string }[]): string[] {
  return letters.map((letter) => letter.id).sort();
}

function draft() {
  return { id: randomUUID(), subject: null, body: "Dear future me", deliveryDate: "2027-06-01", timeZone: "UTC" };
}
