# API Endpoint Implementation Plan: POST /profiles/nickname

## 1. Endpoint Overview

- Purpose: Set the initial nickname for an authenticated user, ensuring uniqueness and valid format. Creates a `profiles` row linked to the Supabase `auth.users` record. Does not allow updates once set.
- Success: `201 Created` with profile summary.

## 2. Request Details

- HTTP Method: POST
- URL: `/profiles/nickname`
- Authentication: Required (Supabase auth; use `locals.supabase` per middleware).
- Parameters:
  - Required: none in path/query.
  - Optional: none.
- Request Body (JSON):
  - `nickname` (string, 3-15 chars, alphanumeric only).
- Validation:
  - Zod schema: `z.string().min(3).max(15).regex(/^[a-zA-Z0-9]+$/)`.
  - Reject body without `nickname` or extra unknown keys (strip/strict).

## 3. Used Types

- DTOs: `ProfileDto` (id, nickname, isAdmin).
- Command Models: `CreateProfileCommand` (nickname).
- Supabase rows: `profiles`.

## 3. Response Details

- Success `201`: `{ id, nickname, is_admin }` mapped to `ProfileDto` shape (note `is_admin` from DB -> `isAdmin` if following DTO mapper; API spec shows snake_case -> align with API contract, keep `is_admin` in response per spec or map consistently across API—choose one and document; prefer camelCase DTO for consistency unless API spec mandates snake_case).
- Errors:
  - `400` invalid format (failed validation).
  - `401` unauthenticated.
  - `409` nickname taken or profile already exists.
  - `500` unexpected server error.

## 4. Data Flow

1. Authenticate via middleware: obtain `user` from Supabase session (`locals.supabase.auth.getUser()` or already injected).
2. Parse and validate body with Zod into `CreateProfileCommand`.
3. Check if profile already exists for `user.id` via `profiles` table.
4. Insert new profile with `user_id = user.id`, `nickname`, `is_admin` default false; rely on DB constraints for uniqueness/format.
5. On unique violation for nickname or existing user_id, map to `409`.
6. Return created profile mapped to response DTO with `201 Created`.

## 5. Security Considerations

- Auth required; reject missing/invalid session with `401`.
- Prevent nickname enumeration timing leaks by uniform error message for 409 conflicts.
- Input validation on nickname to avoid injection; rely on prepared queries.
- Rate limit (future middleware) to mitigate brute-force nickname probing.
- Ensure no ability to overwrite existing profile (guard clause).

## 6. Error Handling

- Validation error → `400` with message.
- No session/user → `401`.
- Profile already exists for user_id → `409`.
- Nickname unique constraint violation → `409`.
- Other Supabase errors → log (server) and respond `500`.
- No dedicated error table noted; use standard logging (console/error logger).

## 7. Performance Considerations

- Single select + insert; low cost.
- Use targeted select on `profiles` by `user_id` (unique) to short-circuit.
- Avoid extra round trips by catching unique violation instead of pre-check for nickname; pre-check only for own profile existence.

## 8. Implementation Steps

1. Add Zod schema for `CreateProfileCommand` (nickname rules).
2. Implement handler at `src/pages/api/profiles/nickname.ts` (Astro server endpoint):
   - Export `POST`.
   - Use `locals.supabase` for auth; enforce session.
   - Parse JSON body, validate with schema; on failure, return `400`.
3. Guard: query `profiles` where `user_id = session.user.id`; if exists, return `409`.
4. Attempt insert into `profiles` with `user_id` and `nickname`:
   - On unique violation (nickname or user_id), return `409`.
   - On other DB error, log and return `500`.
5. Map inserted row to response payload; return `201` with JSON.
6. Add/extend service helper (e.g., `src/lib/services/profileService.ts`):
   - `createProfile(supabase, userId, nickname)` encapsulating steps and error mapping.
   - Reuse DTO mapper if available (`toProfileDto`); otherwise inline.
7. Tests (if test harness present): unit for validation, integration for conflict paths (happy, validation fail, already set, nickname taken).
8. Update API documentation/plan references if needed.
