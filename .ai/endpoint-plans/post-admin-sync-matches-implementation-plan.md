# API Endpoint Implementation Plan: POST `/admin/sync-matches`

## 1. Endpoint Overview

- Admin-triggered synchronization of match data from the external football API into `matches`, leveraging `api_match_id` uniqueness for idempotency.
- Supports optional date range to limit fetched fixtures; returns counts of inserted/updated/skipped records.
- Can run synchronously (returning results) or enqueue/short-circuit if throttled.

## 2. Request Details

- HTTP Method: POST
- URL: `/admin/sync-matches`
- Parameters:
  - Required: none
  - Optional (JSON body): `from?: ISO date`, `to?: ISO date`
- Validation (zod in route):
  - `from`/`to` optional strings; must be valid ISO dates (date-only or datetime) and in UTC; if both provided ensure `from <= to`.
  - Normalize to date boundaries if using date-only input (e.g., start-of-day/end-of-day UTC).
  - Reject bodies with unknown fields (strict schema).

## 3. Used Types

- Request DTO: `AdminSyncMatchesCommand` (`src/types.ts`)
- Response DTO: `AdminSyncMatchesResult` (`src/types.ts`)
- Domain rows: `matches` table (`api_match_id`, team names/ids/logos, scores, `kickoff_time`, `status`)

## 3. Response Details

- Success (sync path): `200 OK` with `AdminSyncMatchesResult` `{ synced, updated, skipped }`.
- Accepted (async or throttled-but-accepted path): `202 Accepted` with same payload (or queued metadata).
- Errors: `400` invalid body/range; `401` unauthenticated; `403` not admin; `429` when throttling window active; `500` unexpected/external API failure.

## 4. Data Flow

- Authenticate via Supabase JWT from `Authorization` header; use `locals.supabase` to get user and profile.
- Authorize: fetch profile and require `is_admin = true`; otherwise `403`.
- Parse & validate body with zod; if `from`/`to` omitted
- Invoke a service (new) in `src/lib/services/matchSyncService.ts`:
  - Accepts `{ from?: Date; to?: Date }` and Supabase client plus external API client.
  - Applies throttle guard (e.g., compare `lastSyncAt` cached in KV/DB env var; or simple in-memory timestamp with minimum interval from config).
  - Calls external API (api-football) to fetch fixtures within range; handle pagination/batching.
  - Map external payload to internal shape (team names/ids/logos, `api_match_id`, scores, status enum, kickoff UTC).
  - Upsert by `api_match_id` into `matches`:
    - Insert when new -> increment `synced`.
    - Update when record exists and any relevant fields changed -> increment `updated`.
    - If no changes -> increment `skipped`.
  - Use transaction where possible for consistency; ensure `updated_at` trigger fires.
  - Return counts + throttle metadata.
- Route returns counts with appropriate status (200/202).

## 5. Security Considerations

- Require valid Supabase session; return `401` if missing/expired.
- Enforce admin check via `profiles.is_admin`; return `403` otherwise.
- Validate inputs strictly with zod to prevent injection/over-fetching.
- Do not expose external API keys; load via `import.meta.env`.
- Consider rate limiting per admin to avoid abuse; enforce server-side throttling with `429` on too-frequent calls.

## 6. Error Handling

- `400`: zod validation failure (bad dates, from>to).
- `401`: no/invalid Supabase auth.
- `403`: non-admin profile.
- `429`: throttle window active (include `retryAfter` header if available).
- `500`: external API errors, unexpected DB issues; log details server-side.
- Logging: use existing server logger; record external API errors, mapping issues, and DB failures (no dedicated error table noted).

## 7. Performance Considerations

- Batch external API requests and limit date ranges to reduce payload size.
- Upsert using `api_match_id` unique index to avoid full scans.
- Prefer bulk upsert if API/DB client supports it; otherwise chunked writes.
- Avoid redundant updates by diffing fields before update; counts reflect actual changes.
- Consider short timeout/circuit breaker on external API calls.

## 8. Implementation Steps

1. Add zod schema for `AdminSyncMatchesCommand` in the route file; validate and normalize dates.
2. Implement route handler in `src/pages/api/admin/sync-matches.ts` (or `.astro` API route):
   - `export const prerender = false`.
   - Acquire Supabase client from `locals`, auth check, load profile, assert admin.
   - Parse body with schema; pass through provided range (no forced default window).
   - Call service; map response to `AdminSyncMatchesResult`.
   - Return 200 on sync success; 202 if async/queued; propagate throttle as 429.
3. Create `src/lib/services/matchSyncService.ts`:
   - Expose `syncMatches({ from, to }, deps)` returning counts.
   - Implement throttle guard (config-driven interval).
   - Fetch external fixtures, map to internal model, and perform upserts with change detection.
4. Add external API client/helper (if not existing) in `src/lib/clients/apiFootball.ts` with typed responses and minimal fields used.
5. Add configuration/env handling for API key, base URL, throttle interval, default date window.
6. Wire logging for failures and include context (range, counts).
7. Add tests (unit/service) for validation, throttle, and upsert counting logic if test setup exists; otherwise document manual verification steps.
8. Document endpoint in README/api docs if applicable.
