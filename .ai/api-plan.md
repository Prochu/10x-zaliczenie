# REST API Plan

## 1. Resources

The API is organized around the following main resources, each corresponding to a database table or aggregated view:

- **Profiles** - User profiles extending Supabase auth.users (`profiles` table)
- **Matches** - Champions League matches (`matches` table)
- **Bets** - User score predictions for matches (`bets` table)
- **Leaderboard** - Aggregated user scores and rankings (calculated from `bets` and `profiles`)
- **Groups** - User groups (`groups` table, MVP: single default group)
- **User Groups** - User-group memberships (`user_groups` table)
- **Bet Logs** - Audit trail of bet operations (`bet_logs` table, read-only)

---

## 2. Endpoints

### 2.1. Authentication Endpoints

#### POST /api/auth/session
**Description:** Verify current user session and get user profile information.

**Request Headers:**
- `Authorization: Bearer <supabase_jwt_token>`

**Response Payload:**
```json
{
  "user": {
    "id": "uuid",
    "user_id": "uuid",
    "nickname": "string",
    "is_admin": boolean,
    "created_at": "ISO 8601 timestamp",
    "updated_at": "ISO 8601 timestamp"
  }
}
```

**Success Codes:**
- `200 OK` - Session valid, user profile returned

**Error Codes:**
- `401 Unauthorized` - Invalid or missing authentication token
- `404 Not Found` - User profile not found (should trigger nickname creation flow)

---

### 2.2. Profile Endpoints

#### GET /api/profiles/me
**Description:** Get current authenticated user's profile.

**Request Headers:**
- `Authorization: Bearer <supabase_jwt_token>`

**Response Payload:**
```json
{
  "id": "uuid",
  "user_id": "uuid",
  "nickname": "string",
  "is_admin": boolean,
  "created_at": "ISO 8601 timestamp",
  "updated_at": "ISO 8601 timestamp"
}
```

**Success Codes:**
- `200 OK` - Profile retrieved successfully

**Error Codes:**
- `401 Unauthorized` - Not authenticated
- `404 Not Found` - Profile does not exist

---

#### POST /api/profiles/me/nickname
**Description:** Create or update user's nickname (first-time setup or nickname change).

**Request Headers:**
- `Authorization: Bearer <supabase_jwt_token>`

**Request Payload:**
```json
{
  "nickname": "string"
}
```

**Validation:**
- `nickname` must be 3-15 characters
- `nickname` must contain only alphanumeric characters (a-z, A-Z, 0-9)
- `nickname` must be unique across all profiles

**Response Payload:**
```json
{
  "id": "uuid",
  "user_id": "uuid",
  "nickname": "string",
  "is_admin": boolean,
  "created_at": "ISO 8601 timestamp",
  "updated_at": "ISO 8601 timestamp"
}
```

**Success Codes:**
- `200 OK` - Nickname updated successfully
- `201 Created` - Profile created with nickname

**Error Codes:**
- `400 Bad Request` - Invalid nickname format or validation failed
- `401 Unauthorized` - Not authenticated
- `409 Conflict` - Nickname already taken

---

#### GET /api/profiles/:id
**Description:** Get a specific user's public profile information (for leaderboard display).

**Request Headers:**
- `Authorization: Bearer <supabase_jwt_token>` (optional, but recommended)

**Path Parameters:**
- `id` - Profile UUID

**Response Payload:**
```json
{
  "id": "uuid",
  "nickname": "string",
  "created_at": "ISO 8601 timestamp"
}
```

**Success Codes:**
- `200 OK` - Profile retrieved successfully

**Error Codes:**
- `404 Not Found` - Profile does not exist

---

### 2.3. Match Endpoints

#### GET /api/matches
**Description:** Get list of matches with optional filtering and pagination.

**Query Parameters:**
- `status` (optional) - Filter by match status: `scheduled`, `live`, `finished`, `cancelled`, `postponed`
- `upcoming` (optional, boolean) - Filter for upcoming matches (status: `scheduled` or `live`, kickoff_time > NOW())
- `finished` (optional, boolean) - Filter for finished matches (status: `finished`)
- `page` (optional, default: 1) - Page number for pagination
- `limit` (optional, default: 50, max: 100) - Number of results per page
- `sort` (optional, default: `kickoff_time`) - Sort field: `kickoff_time`, `created_at`
- `order` (optional, default: `asc`) - Sort order: `asc`, `desc`

**Request Headers:**
- `Authorization: Bearer <supabase_jwt_token>` (optional, but recommended)

**Response Payload:**
```json
{
  "matches": [
    {
      "id": "uuid",
      "api_match_id": "string",
      "home_team_name": "string",
      "home_team_api_id": "string",
      "home_team_logo": "string | null",
      "away_team_name": "string",
      "away_team_api_id": "string",
      "away_team_logo": "string | null",
      "home_team_score": "integer | null",
      "away_team_score": "integer | null",
      "kickoff_time": "ISO 8601 timestamp",
      "status": "scheduled | live | finished | cancelled | postponed",
      "created_at": "ISO 8601 timestamp",
      "updated_at": "ISO 8601 timestamp",
      "betting_deadline": "ISO 8601 timestamp",
      "can_bet": boolean,
      "user_bet": {
        "id": "uuid",
        "home_score": "integer",
        "away_score": "integer",
        "points_awarded": "integer | null"
      } | null
    }
  ],
  "pagination": {
    "page": "integer",
    "limit": "integer",
    "total": "integer",
    "total_pages": "integer"
  }
}
```

**Notes:**
- `betting_deadline` is calculated as `kickoff_time - 5 minutes`
- `can_bet` is `true` if current time < betting_deadline and status is `scheduled` or `live`
- `user_bet` is included only if user is authenticated and has placed a bet for this match

**Success Codes:**
- `200 OK` - Matches retrieved successfully

**Error Codes:**
- `400 Bad Request` - Invalid query parameters

---

#### GET /api/matches/:id
**Description:** Get detailed information about a specific match.

**Request Headers:**
- `Authorization: Bearer <supabase_jwt_token>` (optional, but recommended)

**Path Parameters:**
- `id` - Match UUID

**Response Payload:**
```json
{
  "id": "uuid",
  "api_match_id": "string",
  "home_team_name": "string",
  "home_team_api_id": "string",
  "home_team_logo": "string | null",
  "away_team_name": "string",
  "away_team_api_id": "string",
  "away_team_logo": "string | null",
  "home_team_score": "integer | null",
  "away_team_score": "integer | null",
  "kickoff_time": "ISO 8601 timestamp",
  "status": "scheduled | live | finished | cancelled | postponed",
  "created_at": "ISO 8601 timestamp",
  "updated_at": "ISO 8601 timestamp",
  "betting_deadline": "ISO 8601 timestamp",
  "can_bet": boolean,
  "user_bet": {
    "id": "uuid",
    "home_score": "integer",
    "away_score": "integer",
    "points_awarded": "integer | null"
  } | null
}
```

**Success Codes:**
- `200 OK` - Match retrieved successfully

**Error Codes:**
- `404 Not Found` - Match does not exist

---

### 2.4. Bet Endpoints

#### GET /api/bets
**Description:** Get list of bets for the authenticated user with optional filtering.

**Query Parameters:**
- `match_id` (optional) - Filter bets by specific match
- `status` (optional) - Filter by match status: `scheduled`, `live`, `finished`, `cancelled`, `postponed`
- `page` (optional, default: 1) - Page number for pagination
- `limit` (optional, default: 50, max: 100) - Number of results per page
- `sort` (optional, default: `created_at`) - Sort field: `created_at`, `updated_at`
- `order` (optional, default: `desc`) - Sort order: `asc`, `desc`

**Request Headers:**
- `Authorization: Bearer <supabase_jwt_token>` (required)

**Response Payload:**
```json
{
  "bets": [
    {
      "id": "uuid",
      "user_id": "uuid",
      "match_id": "uuid",
      "home_score": "integer",
      "away_score": "integer",
      "points_awarded": "integer | null",
      "created_at": "ISO 8601 timestamp",
      "updated_at": "ISO 8601 timestamp",
      "match": {
        "id": "uuid",
        "home_team_name": "string",
        "away_team_name": "string",
        "home_team_score": "integer | null",
        "away_team_score": "integer | null",
        "kickoff_time": "ISO 8601 timestamp",
        "status": "scheduled | live | finished | cancelled | postponed"
      }
    }
  ],
  "pagination": {
    "page": "integer",
    "limit": "integer",
    "total": "integer",
    "total_pages": "integer"
  }
}
```

**Success Codes:**
- `200 OK` - Bets retrieved successfully

**Error Codes:**
- `401 Unauthorized` - Not authenticated
- `400 Bad Request` - Invalid query parameters

---

#### GET /api/bets/:id
**Description:** Get a specific bet by ID (must belong to authenticated user).

**Request Headers:**
- `Authorization: Bearer <supabase_jwt_token>` (required)

**Path Parameters:**
- `id` - Bet UUID

**Response Payload:**
```json
{
  "id": "uuid",
  "user_id": "uuid",
  "match_id": "uuid",
  "home_score": "integer",
  "away_score": "integer",
  "points_awarded": "integer | null",
  "created_at": "ISO 8601 timestamp",
  "updated_at": "ISO 8601 timestamp",
  "match": {
    "id": "uuid",
    "home_team_name": "string",
    "away_team_name": "string",
    "home_team_score": "integer | null",
    "away_team_score": "integer | null",
    "kickoff_time": "ISO 8601 timestamp",
    "status": "scheduled | live | finished | cancelled | postponed"
  }
}
```

**Success Codes:**
- `200 OK` - Bet retrieved successfully

**Error Codes:**
- `401 Unauthorized` - Not authenticated
- `403 Forbidden` - Bet does not belong to authenticated user
- `404 Not Found` - Bet does not exist

---

#### POST /api/bets
**Description:** Create or update a bet for a match (UPSERT operation). Validates betting deadline before allowing operation.

**Request Headers:**
- `Authorization: Bearer <supabase_jwt_token>` (required)

**Request Payload:**
```json
{
  "match_id": "uuid",
  "home_score": "integer",
  "away_score": "integer"
}
```

**Validation:**
- `match_id` must exist and match must be in `scheduled` or `live` status
- `home_score` must be >= 0
- `away_score` must be >= 0
- Current time must be before betting deadline (kickoff_time - 5 minutes)
- If bet already exists for this user and match, it will be updated

**Response Payload:**
```json
{
  "id": "uuid",
  "user_id": "uuid",
  "match_id": "uuid",
  "home_score": "integer",
  "away_score": "integer",
  "points_awarded": "integer | null",
  "created_at": "ISO 8601 timestamp",
  "updated_at": "ISO 8601 timestamp"
}
```

**Success Codes:**
- `200 OK` - Bet updated successfully
- `201 Created` - Bet created successfully

**Error Codes:**
- `400 Bad Request` - Invalid request payload or validation failed
- `401 Unauthorized` - Not authenticated
- `403 Forbidden` - Betting deadline has passed
- `404 Not Found` - Match does not exist or is not available for betting

---

#### DELETE /api/bets/:id
**Description:** Delete a bet (only allowed before betting deadline).

**Request Headers:**
- `Authorization: Bearer <supabase_jwt_token>` (required)

**Path Parameters:**
- `id` - Bet UUID

**Validation:**
- Bet must belong to authenticated user
- Current time must be before betting deadline

**Success Codes:**
- `204 No Content` - Bet deleted successfully

**Error Codes:**
- `401 Unauthorized` - Not authenticated
- `403 Forbidden` - Bet does not belong to user or betting deadline has passed
- `404 Not Found` - Bet does not exist

---

### 2.5. Leaderboard Endpoints

#### GET /api/leaderboard
**Description:** Get the current leaderboard with user rankings and total points.

**Query Parameters:**
- `group_id` (optional) - Filter leaderboard by group (defaults to default group for MVP)
- `page` (optional, default: 1) - Page number for pagination
- `limit` (optional, default: 50, max: 100) - Number of results per page

**Request Headers:**
- `Authorization: Bearer <supabase_jwt_token>` (optional, but recommended for highlighting current user)

**Response Payload:**
```json
{
  "leaderboard": [
    {
      "rank": "integer",
      "user_id": "uuid",
      "nickname": "string",
      "total_points": "integer",
      "matches_bet": "integer",
      "matches_won": "integer",
      "exact_scores": "integer",
      "correct_winners": "integer"
    }
  ],
  "pagination": {
    "page": "integer",
    "limit": "integer",
    "total": "integer",
    "total_pages": "integer"
  },
  "current_user_rank": "integer | null"
}
```

**Notes:**
- `rank` is calculated based on `total_points` (descending), then `nickname` (ascending) for tie-breaking
- `matches_bet` is count of bets where `points_awarded IS NOT NULL`
- `matches_won` is count of bets where `points_awarded > 0`
- `exact_scores` is count of bets where `points_awarded = 4`
- `correct_winners` is count of bets where `points_awarded IN (1, 2, 4)`
- `current_user_rank` is included only if user is authenticated

**Success Codes:**
- `200 OK` - Leaderboard retrieved successfully

**Error Codes:**
- `400 Bad Request` - Invalid query parameters

---

### 2.6. Group Endpoints

#### GET /api/groups
**Description:** Get list of groups (MVP: returns single default group).

**Query Parameters:**
- `default` (optional, boolean) - Filter for default group only

**Request Headers:**
- `Authorization: Bearer <supabase_jwt_token>` (optional, but recommended)

**Response Payload:**
```json
{
  "groups": [
    {
      "id": "uuid",
      "name": "string",
      "description": "string | null",
      "created_by": "uuid | null",
      "is_default": boolean,
      "created_at": "ISO 8601 timestamp",
      "member_count": "integer"
    }
  ]
}
```

**Success Codes:**
- `200 OK` - Groups retrieved successfully

---

#### GET /api/groups/:id
**Description:** Get detailed information about a specific group.

**Request Headers:**
- `Authorization: Bearer <supabase_jwt_token>` (optional, but recommended)

**Path Parameters:**
- `id` - Group UUID

**Response Payload:**
```json
{
  "id": "uuid",
  "name": "string",
  "description": "string | null",
  "created_by": "uuid | null",
  "is_default": boolean,
  "created_at": "ISO 8601 timestamp",
  "member_count": "integer"
}
```

**Success Codes:**
- `200 OK` - Group retrieved successfully

**Error Codes:**
- `404 Not Found` - Group does not exist

---

#### GET /api/groups/default
**Description:** Get the default group (convenience endpoint for MVP).

**Request Headers:**
- `Authorization: Bearer <supabase_jwt_token>` (optional, but recommended)

**Response Payload:**
```json
{
  "id": "uuid",
  "name": "string",
  "description": "string | null",
  "created_by": "uuid | null",
  "is_default": true,
  "created_at": "ISO 8601 timestamp",
  "member_count": "integer"
}
```

**Success Codes:**
- `200 OK` - Default group retrieved successfully

**Error Codes:**
- `404 Not Found` - Default group does not exist (should not happen in MVP)

---

### 2.7. Bet Logs Endpoints (Read-Only)

#### GET /api/bet-logs
**Description:** Get audit trail of bet operations for the authenticated user.

**Query Parameters:**
- `match_id` (optional) - Filter logs by specific match
- `action` (optional) - Filter by action type: `created`, `updated`
- `page` (optional, default: 1) - Page number for pagination
- `limit` (optional, default: 50, max: 100) - Number of results per page
- `sort` (optional, default: `created_at`) - Sort field: `created_at`
- `order` (optional, default: `desc`) - Sort order: `asc`, `desc`

**Request Headers:**
- `Authorization: Bearer <supabase_jwt_token>` (required)

**Response Payload:**
```json
{
  "logs": [
    {
      "id": "uuid",
      "user_id": "uuid",
      "match_id": "uuid",
      "home_score": "integer",
      "away_score": "integer",
      "action": "created | updated",
      "created_at": "ISO 8601 timestamp",
      "match": {
        "id": "uuid",
        "home_team_name": "string",
        "away_team_name": "string",
        "kickoff_time": "ISO 8601 timestamp"
      }
    }
  ],
  "pagination": {
    "page": "integer",
    "limit": "integer",
    "total": "integer",
    "total_pages": "integer"
  }
}
```

**Success Codes:**
- `200 OK` - Bet logs retrieved successfully

**Error Codes:**
- `401 Unauthorized` - Not authenticated
- `400 Bad Request` - Invalid query parameters

---

### 2.8. Admin Endpoints

#### GET /api/admin/matches
**Description:** Get list of matches for admin panel with additional filtering options.

**Query Parameters:**
- `status` (optional) - Filter by match status
- `page` (optional, default: 1) - Page number for pagination
- `limit` (optional, default: 50, max: 100) - Number of results per page

**Request Headers:**
- `Authorization: Bearer <supabase_jwt_token>` (required)

**Response Payload:**
```json
{
  "matches": [
    {
      "id": "uuid",
      "api_match_id": "string",
      "home_team_name": "string",
      "away_team_name": "string",
      "home_team_score": "integer | null",
      "away_team_score": "integer | null",
      "kickoff_time": "ISO 8601 timestamp",
      "status": "scheduled | live | finished | cancelled | postponed",
      "created_at": "ISO 8601 timestamp",
      "updated_at": "ISO 8601 timestamp",
      "bet_count": "integer"
    }
  ],
  "pagination": {
    "page": "integer",
    "limit": "integer",
    "total": "integer",
    "total_pages": "integer"
  }
}
```

**Success Codes:**
- `200 OK` - Matches retrieved successfully

**Error Codes:**
- `401 Unauthorized` - Not authenticated
- `403 Forbidden` - User does not have admin role

---

#### PATCH /api/admin/matches/:id/score
**Description:** Manually update the final score of a match (admin only). Automatically triggers point recalculation for all bets on this match.

**Request Headers:**
- `Authorization: Bearer <supabase_jwt_token>` (required)

**Path Parameters:**
- `id` - Match UUID

**Request Payload:**
```json
{
  "home_team_score": "integer",
  "away_team_score": "integer",
  "status": "finished"
}
```

**Validation:**
- User must have `is_admin = true` in profile
- `home_team_score` must be >= 0
- `away_team_score` must be >= 0
- `status` should typically be `finished` when updating scores

**Response Payload:**
```json
{
  "id": "uuid",
  "api_match_id": "string",
  "home_team_name": "string",
  "away_team_name": "string",
  "home_team_score": "integer",
  "away_team_score": "integer",
  "kickoff_time": "ISO 8601 timestamp",
  "status": "finished",
  "updated_at": "ISO 8601 timestamp",
  "points_recalculated": true,
  "bets_updated": "integer"
}
```

**Business Logic:**
- Updates match scores and status
- Recalculates points for all bets on this match using scoring rules:
  - 4 points: Exact score match
  - 2 points: Correct winner + goal difference OR correct draw prediction
  - 1 point: Correct winner only
  - 0 points: Incorrect prediction
- Updates `points_awarded` field in all related bets
- Returns count of bets that were updated

**Success Codes:**
- `200 OK` - Match score updated and points recalculated successfully

**Error Codes:**
- `400 Bad Request` - Invalid request payload or validation failed
- `401 Unauthorized` - Not authenticated
- `403 Forbidden` - User does not have admin role
- `404 Not Found` - Match does not exist

---

#### GET /api/admin/stats
**Description:** Get administrative statistics and system health information.

**Request Headers:**
- `Authorization: Bearer <supabase_jwt_token>` (required)

**Response Payload:**
```json
{
  "users": {
    "total": "integer",
    "active": "integer",
    "admins": "integer"
  },
  "matches": {
    "total": "integer",
    "scheduled": "integer",
    "live": "integer",
    "finished": "integer"
  },
  "bets": {
    "total": "integer",
    "pending_scoring": "integer"
  },
  "api_usage": {
    "requests_today": "integer",
    "requests_limit": 7000
  }
}
```

**Success Codes:**
- `200 OK` - Statistics retrieved successfully

**Error Codes:**
- `401 Unauthorized` - Not authenticated
- `403 Forbidden` - User does not have admin role

---

### 2.9. Health and Utility Endpoints

#### GET /api/health
**Description:** Health check endpoint for monitoring and load balancers.

**Response Payload:**
```json
{
  "status": "ok",
  "timestamp": "ISO 8601 timestamp",
  "database": "connected"
}
```

**Success Codes:**
- `200 OK` - Service is healthy

---

#### GET /api/time
**Description:** Get current server time in UTC (for client-side deadline calculations).

**Response Payload:**
```json
{
  "utc_time": "ISO 8601 timestamp",
  "unix_timestamp": "integer"
}
```

**Success Codes:**
- `200 OK` - Time retrieved successfully

---

## 3. Authentication and Authorization

### 3.1. Authentication Mechanism

**Supabase JWT Authentication:**
- The API uses Supabase's built-in authentication system
- Users authenticate via third-party providers (Google, Facebook, Apple) through Supabase Auth
- Upon successful authentication, Supabase issues a JWT token
- All protected endpoints require the JWT token in the `Authorization` header: `Authorization: Bearer <token>`

**Implementation Details:**
- JWT tokens are validated on each API request using Supabase client
- Token validation includes checking expiration, signature, and user existence
- User identity is extracted from the JWT token's `sub` claim (user ID)
- The authenticated user's profile is fetched from the `profiles` table using the `user_id` field

### 3.2. Authorization

**Role-Based Access Control:**
- **Public Endpoints:** Some endpoints are accessible without authentication (e.g., `/api/health`, `/api/time`)
- **Authenticated Endpoints:** Most endpoints require valid authentication (JWT token)
- **Admin Endpoints:** Endpoints under `/api/admin/*` require both authentication and `is_admin = true` in the user's profile

**Authorization Checks:**
1. **User Resource Access:** Users can only access their own bets, bet logs, and profile data
2. **Admin Access:** Admin endpoints verify `is_admin` flag in the user's profile before allowing access
3. **Resource Ownership:** Operations on bets and bet logs verify that the resource belongs to the authenticated user

**Implementation:**
- Authorization checks are performed in API route handlers
- Admin role is checked by querying the `profiles` table for `is_admin = true`
- Resource ownership is verified by comparing `user_id` fields

---

## 4. Validation and Business Logic

### 4.1. Profile Validation

**Nickname Creation/Update:**
- **Length:** Must be between 3 and 15 characters (inclusive)
- **Format:** Must contain only alphanumeric characters (a-z, A-Z, 0-9) - regex: `^[a-zA-Z0-9]+$`
- **Uniqueness:** Must be unique across all profiles (enforced at database level)
- **Database Constraint:** `CHECK (LENGTH(nickname) >= 3 AND nickname ~ '^[a-zA-Z0-9]+$')`

**Profile Creation:**
- Profile is automatically created when user first authenticates (if not exists)
- User must set nickname before accessing main application features
- Profile is linked to Supabase `auth.users` via `user_id` foreign key

---

### 4.2. Match Validation

**Match Data:**
- `api_match_id` must be unique (prevents duplicate matches during API sync)
- `home_team_score` and `away_team_score` must be >= 0 (if not null)
- `kickoff_time` must be a valid timestamp in UTC
- `status` must be one of: `scheduled`, `live`, `finished`, `cancelled`, `postponed`

**Betting Deadline Calculation:**
- Betting deadline = `kickoff_time - 5 minutes`
- Betting is allowed only if:
  - Current time < betting deadline
  - Match status is `scheduled` or `live`
- This validation is enforced in the API before allowing bet creation/update

---

### 4.3. Bet Validation

**Bet Creation/Update:**
- `home_score` must be >= 0 (integer)
- `away_score` must be >= 0 (integer)
- `match_id` must reference an existing match
- Match must be in `scheduled` or `live` status
- Current time must be before betting deadline (kickoff_time - 5 minutes)
- One bet per user per match (enforced by unique constraint: `UNIQUE (user_id, match_id)`)
- If bet already exists, operation becomes an UPDATE (UPSERT)

**Database Constraints:**
- `CHECK (home_score >= 0)`
- `CHECK (away_score >= 0)`
- `UNIQUE (user_id, match_id)`

---

### 4.4. Scoring Business Logic

**Point Calculation Rules (Mutually Exclusive):**
1. **4 points:** Exact score match (home_score = predicted home_score AND away_score = predicted away_score)
2. **2 points:** 
   - Correct winner + correct goal difference (but not exact score), OR
   - Correct draw prediction (home_score = away_score AND predicted home_score = predicted away_score, but not exact score)
3. **1 point:** Correct winner only (home team wins and predicted home wins, OR away team wins and predicted away wins, but goal difference is incorrect)
4. **0 points:** Incorrect prediction (wrong winner or wrong draw prediction)

**Implementation:**
- Points are calculated automatically when:
  - Match scores are updated (via external API sync)
  - Admin manually updates match scores
- Calculation is performed in the API layer (not database triggers) for clarity and maintainability
- `points_awarded` field is updated for all bets on the match
- `points_awarded` are are updated when match starts and each time the result is updated 
- Points are NULL until match is started

**Point Recalculation:**
- Triggered automatically when match scores change
- All bets for the match are recalculated in a single transaction
- Leaderboard is updated automatically (calculated on-the-fly from aggregated points)

---

### 4.5. Bet Logging Business Logic

**Automatic Audit Trail:**
- Every bet INSERT creates a log entry with `action = 'created'`
- Every bet UPDATE creates a log entry with `action = 'updated'`
- Logging is handled by database triggers (not API layer) to ensure completeness
- Log entries are immutable (read-only via API)

**Log Data:**
- Stores: `user_id`, `match_id`, `home_score`, `away_score`, `action`, `created_at`
- Preserves complete history even if bet is updated multiple times
- Independent of `bets` table (does not reference `bets.id`) to maintain audit integrity

---

### 4.6. Leaderboard Business Logic

**Calculation:**
- Leaderboard is calculated on-the-fly using SQL aggregation
- Groups bets by `user_id` and sums `points_awarded`
- Only includes bets where `points_awarded IS NOT NULL` (finished matches)
- Ranking is based on:
  1. `total_points` (descending)
  2. `nickname` (ascending) for tie-breaking

**Performance:**
- Uses index: `idx_bets_user_id_points_awarded` for optimal query performance
- Expected to perform well for MVP user base size
- Future consideration: Materialized view if user base grows significantly

---

### 4.7. Group Business Logic

**Default Group:**
- MVP uses a single default group for all users
- Default group is identified by `is_default = TRUE`
- Partial unique index ensures only one default group exists
- All new users are automatically assigned to default group

**User Assignment:**
- Users are assigned to groups via `user_groups` junction table
- Assignment happens automatically during profile creation (for MVP)
- Future: Support for multiple groups and manual group management

---

### 4.8. API Rate Limiting and External API Management

**External API (api-football.com) Limits:**
- Daily limit: 7000 requests
- Live updates: 5-minute intervals during matches
- API sync operations should be scheduled/queued to stay within limits

**Internal API Rate Limiting (Future Consideration):**
- Consider implementing rate limiting for public endpoints
- Admin endpoints may have different rate limits
- Authentication endpoints should have stricter rate limiting

---

### 4.9. Error Handling

**Standard Error Response Format:**
```json
{
  "error": {
    "code": "string",
    "message": "string",
    "details": "object | null"
  }
}
```

**Common Error Codes:**
- `400 Bad Request` - Invalid request payload or validation failed
- `401 Unauthorized` - Authentication required or invalid token
- `403 Forbidden` - Insufficient permissions or resource access denied
- `404 Not Found` - Resource does not exist
- `409 Conflict` - Resource conflict (e.g., duplicate nickname)
- `500 Internal Server Error` - Unexpected server error

**Validation Error Details:**
- Validation errors include field-specific error messages
- Example: `{ "error": { "code": "VALIDATION_ERROR", "message": "Invalid nickname", "details": { "field": "nickname", "reason": "Must be 3-15 alphanumeric characters" } } }`

---

### 4.10. Pagination

**Standard Pagination:**
- All list endpoints support pagination via `page` and `limit` query parameters
- Default: `page = 1`, `limit = 50`
- Maximum: `limit = 100`
- Response includes pagination metadata:
  ```json
  {
    "pagination": {
      "page": "integer",
      "limit": "integer",
      "total": "integer",
      "total_pages": "integer"
    }
  }
  ```

---

### 4.11. Timezone Handling

**Storage:**
- All timestamps stored as `TIMESTAMPTZ` in UTC
- Database handles timezone conversion automatically

**API Response:**
- Timestamps returned as ISO 8601 strings in UTC
- Client-side conversion to user's local timezone for display
- `kickoff_time` and `betting_deadline` are in UTC

**Calculation:**
- Betting deadline calculations use UTC to ensure accuracy
- Client receives UTC timestamps and converts for display

---

## 5. API Implementation Notes

### 5.1. Astro API Routes

**File Structure:**
- API endpoints are implemented as Astro API routes in `./src/pages/api/`
- Each endpoint is a separate file: `./src/pages/api/{resource}/{action}.ts`
- Example: `./src/pages/api/bets/index.ts` for `GET /api/bets` and `POST /api/bets`

**Request Handling:**
- Astro API routes receive `Request` and `Response` objects
- Use Supabase client from middleware context: `context.locals.supabase`
- Extract JWT token from `Authorization` header
- Validate authentication and authorization in route handlers

### 5.2. Type Safety

**TypeScript Types:**
- Use generated Supabase types from `./src/db/database.types.ts`
- Define request/response types in `./src/types.ts`
- Ensure type safety for all API payloads and responses

### 5.3. Database Queries

**Query Patterns:**
- Use Supabase client for all database operations
- Leverage indexes for optimal query performance
- Use transactions for operations that require atomicity (e.g., score updates with point recalculation)
- Consider connection pooling for high-traffic scenarios

### 5.4. Security Considerations

**Input Validation:**
- Validate all input at API layer before database operations
- Sanitize user inputs to prevent injection attacks
- Use parameterized queries (Supabase client handles this)

**Authentication:**
- Never trust client-side authentication checks
- Always verify JWT token on server side
- Check admin role from database, not from token claims

**CORS:**
- Configure CORS appropriately for production
- Allow only trusted origins

---

## 6. Future Enhancements (Post-MVP)

### 6.1. Multi-Group Support
- Endpoints for creating and managing groups
- Group-specific leaderboards
- Group membership management endpoints

### 6.2. Real-Time Updates
- WebSocket support for live score updates
- Server-Sent Events (SSE) for leaderboard updates
- Push notifications for match start and score updates

### 6.3. Advanced Filtering
- More sophisticated filtering options for matches and bets
- Date range filtering
- Team-based filtering

### 6.4. Analytics Endpoints
- User performance analytics
- Match statistics
- Betting trends

### 6.5. Rate Limiting
- Implement rate limiting middleware
- Different limits for different endpoint categories
- IP-based and user-based rate limiting

---

## 7. API Versioning

**Current Version:** v1 (implicit)

**Future Considerations:**
- When breaking changes are needed, introduce versioning: `/api/v1/...`, `/api/v2/...`
- Maintain backward compatibility for at least one major version
- Document deprecation timeline for old versions

