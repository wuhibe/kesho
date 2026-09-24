# Kesho

Kesho lets a person write a letter to their future self and have it emailed to them on a chosen date.

## Language

**Author**:
A person with a Kesho account whose email address has been verified. The only possible recipient of their own letters.
_Avoid_: User, sender, recipient, customer

**Letter**:
A private message an Author writes to their future self: an optional subject and a plain-text body.
_Avoid_: Note, message, email, capsule

**Draft**:
The unsent subject and body in the composer, kept in the Author's browser. It becomes a Letter only when sent, and is cleared once that Letter is Sealed.
_Avoid_: using it for a Pending Letter

**Delivery date**:
The calendar day a Letter is emailed to its Author: at least tomorrow, at most five years out.
_Avoid_: Send date, schedule, delivery time

### Letter lifecycle

**Pending**:
A Letter whose Author has not yet verified their email. It is never delivered, and it is discarded if the email stays unverified for seven days.
_Avoid_: Draft, unconfirmed

**Scheduled**:
A Letter waiting for its Delivery date. It can be cancelled.
_Avoid_: Queued, active

**Delivered**:
A Letter that has been emailed to its Author and now lives in their Archive.
_Avoid_: Sent, opened

**Undeliverable**:
A Letter whose email could not reach its Author. It stays in the Archive and is retried when the Author verifies a new email.
_Avoid_: Failed, bounced

**Cancelled**:
Not a state. Cancelling a Pending or Scheduled Letter deletes it permanently.

### Viewing

**Sealed**:
The state of a Letter whose body its Author cannot read until the Delivery date.
_Avoid_: Locked, hidden

**Archive**:
An Author's delivered Letters, readable in full.
_Avoid_: History, inbox
