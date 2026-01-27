# API Endpoint Implementation Plan: GET `/me`

## 1. Endpoint Overview

- Purpose: Return the authenticated user’s profile with group memberships (MVP: single default group).
- Behavior: Require valid Supabase JWT, fetch profile and groups, respond with profile + groups array.

## 2. Request Details

- HTTP Method: GET
- URL Structure: `/api/me` (Astro endpoint)
- Parameters:
  - Required: none (auth token required via `Authorization: Bearer` or auth cookie handled by Supabase).
  - Optional: none.
- Request Body: none.

## 3. Used Types

- DTOs: `MeDto`, `GroupDto`, `ProfileDto`.
- Domain/DB: `profiles`, `groups`, `user_groups`.
- Command Models: none (read-only).

## 3. Response Details

- Success 200: `MeDto` shaped response `{ id, nickname, isAdmin, groups: GroupDto[] }`.
- Errors:
  - 401 unauthorized (missing/invalid token).
  - 404 profile_missing (if auth valid but profile row absent; optional per broader plan).
  - 500 fetch_failed on unexpected errors.
- Content-Type: `application/json`.

## 4. Data Flow

1. Auth: Resolve Supabase user from request via `locals.supabase.auth.getUser()` (middleware provided). If absent → 401.
2. Fetch profile: Query `profiles` by `user_id = authUser.id`. If not found → 404 profile_missing (or 401 if we choose to hide existence; prefer 404 per API doc secondary list).
3. Fetch groups: Join `user_groups` → `groups` to get memberships (MVP expected single default). If no membership found, still return empty array (or attach default if business rule requires).
4. Map to DTO: normalize casing (`isAdmin`, `isDefault`) and return JSON 200.

## 5. Security Considerations

- Authentication: required Supabase JWT; use server-side Supabase client from `context.locals.supabase`.
- Authorization: user can only read their own profile (enforced by using auth user id).
- Input validation: none (no payload); validate presence/format of auth token.
- Data leakage: avoid exposing `user_id` or Supabase auth metadata; only return profile fields and group metadata.
- Rate limiting: rely on global middleware if available; low-risk read endpoint.
- Logging: log failures (auth errors, DB errors) with minimal PII (user_id only).

## 6. Error Handling

- 401: missing/invalid token (Supabase auth failure).
- 404: profile missing for authenticated user.
- 500: Supabase client errors (network/db). Include safe error code/message `{ "error": "fetch_failed", "message": "Failed to load profile" }`.
- Validation errors (none expected): would be 400 if added later.

## 7. Performance Considerations

- Single user-specific query + join; ensure `profiles.user_id` unique index and `user_groups.user_id` index used (exists).
- Keep response minimal; no pagination required.
- Cache not required; per-user fetch lightweight.

## 8. Implementation Steps

1. Create endpoint file `src/pages/api/me.ts` (Astro API route). Set `export const prerender = false`.
2. Inject Supabase client from `Astro.locals.supabase`; resolve auth user with `auth.getUser()`. On failure → 401 JSON error.
3. Fetch profile by `user_id`. If not found → 404 JSON error.
4. Fetch groups by joining `user_groups` and `groups` for `user_id`; filter active default group; map to `GroupDto`.
5. Map profile to `MeDto` with camelCase keys.
6. Return 200 JSON with `{ id, nickname, isAdmin, groups }`.
7. Add Zod schema for response typing if needed for future validation (no request body).
8. Add unit/integration test skeleton (if test infra exists) for: unauthenticated → 401, missing profile → 404, success returns groups array.
