# Sign-up says when an email is taken

Signing up with an email that already has an account returns `ACCOUNT_EXISTS` and the copy "You already have an account. Log in or reset your password." The auth modal switches to log-in with the email and Draft kept, so logging in seals the Letter. better-auth's default with `requireEmailVerification` is a look-alike success that sends nothing, which hid the account but left the Author waiting on `/check-inbox` forever with their just-written Letter unsealed. For a letters-to-self app, learning that an email has an account is low harm; losing a Letter is worse.

**Consequences:**
- Anyone can check whether an email has an account, at the sign-up rate limit of 3 a minute per IP.
- Log-in ("That email and password don't match.") and password reset still don't reveal it, and account emails still send after the response.
