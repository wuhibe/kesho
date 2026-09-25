import assert from "node:assert/strict";
import { test } from "node:test";
import { ACCOUNT_EXISTS, errorCopy, LETTER_CAP_REACHED, RATE_LIMITED, SOMETHING_WENT_WRONG, WRONG_CREDENTIALS, WRONG_PASSWORD } from "./copy.ts";

test("each failed request maps to its SPEC §3 copy", () => {
  assert.equal(errorCopy({ status: 403, code: "LETTER_CAP" }), LETTER_CAP_REACHED);
  assert.equal(errorCopy({ status: 401 }), WRONG_CREDENTIALS);
  assert.equal(errorCopy({ status: 400, code: "INVALID_PASSWORD" }), WRONG_PASSWORD);
  assert.equal(errorCopy({ status: 429 }), RATE_LIMITED);
  assert.equal(errorCopy({ status: 500 }), SOMETHING_WENT_WRONG);
});

test("sign-up with a taken email says the account exists", () => {
  assert.equal(errorCopy({ status: 422, code: "ACCOUNT_EXISTS" }), ACCOUNT_EXISTS);
});
