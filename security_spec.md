# Security Spec for The Nexus

## Data Invariants
1. A user profile (`UserPreferences`) document in `/users/{userId}` can only be created, read, or updated by the authenticated user whose `uid` strictly matches the `{userId}`.
2. The user profile must conform strictly to the defined schema. Required fields must be present and correctly typed.
3. Timestamps (`createdAt`, `updatedAt`) must be server-enforced `request.time`. PII shouldn't be publicly leaked.

## The "Dirty Dozen" Payloads

1. **Spoofed Identity Create**: A user attempts to create a document in `/users/anotherUserUid` using their own token.
2. **Ghost Field Injection**: Adding an unmapped field `isAdmin: true` during profile creation or update.
3. **Array Explosion**: Creating a profile with 10,000 items in `favoriteSports` to exhaust the database memory limit.
4. **Invalid Type Attack**: Setting `jobIndustry` as an object `{ hacker: "yes" }` instead of a string.
5. **Schema Bypass Update**: Attempting to update the profile directly removing required fields or leaving them blank.
6. **Orphaned Writes**: Updating a profile without using `affectedKeys().hasOnly()`, attempting to bypass restrictions.
7. **Cross-Tenant Read**: Attempting to get `users/anotherUid` when authenticated as another user.
8. **Client-Side Timestamp Bypass**: Sending a payload with `createdAt: request.time` from a client with a fake time bypassing the `request.time` server rule.
9. **Blanket Read Request**: Trying to query `list` on `/users` collection without specifying `resource.id == request.auth.uid`.
10. **ID Poisoning**: Creating an ID containing an invalid character payload or massive string size.
11. **Update Immutable Data**: Updating the `createdAt` property.
12. **Unauthenticated Access**: Creating a profile completely unauthenticated.

## Test Runner
See `firestore.rules.test.ts`.
