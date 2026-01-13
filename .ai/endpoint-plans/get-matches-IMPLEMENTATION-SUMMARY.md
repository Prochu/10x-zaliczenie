# GET /api/upcomingmatches - Implementation Summary

## Overview
Implementation of the GET `/api/upcomingmatches` endpoint that returns a paginated list of scheduled or live matches with betting deadlines and optional user bets.

## Implementation Status: ✅ COMPLETED

### Date Completed
2026-01-13

## Changes Made

### 1. Validation Schema (`src/lib/validation/matches.ts`)
**New File Created**

Implemented Zod validation schema `upcomingMatchesQuerySchema` with the following features:
- **Pagination**: `page` (default: 1, min: 1), `pageSize` (default: 20, min: 1, max: 100)
- **Status Filter**: `status` - optional enum `["scheduled", "live"]`
- **Date Range**: `from` and `to` - optional ISO 8601 date strings with validation
- **Sorting**: `sort` - enum `["kickoff_time.asc", "kickoff_time.desc"]` (default: asc)

All parameters are properly typed and include transformation from query strings to appropriate types.

### 2. Service Layer (`src/lib/services/matchesService.ts`)
**New File Created**

Implemented `getUpcomingMatches()` function with:

#### Query Features
- **Left join on bets table** to fetch user's bets (using foreign key `bets_match_id_fkey`)
- **Status filtering** - defaults to `["scheduled", "live"]` if not specified
- **Kickoff time range filtering** - using `gte()` and `lte()` for `from`/`to` parameters
- **Dynamic sorting** - by `kickoff_time` ascending or descending
- **Pagination** - using Supabase `range()` method
- **Exact count** - for pagination metadata

#### Data Processing
- **Betting deadline calculation**: `kickoffTime - 5 minutes` in UTC
- **User bet filtering**: Finds and includes only the current user's bet from joined data
- **Public access support**: If `userId` is null, no user bets are included (public endpoint)
- **DTO mapping**: Maps database fields to camelCase `MatchListItemDto`

#### Error Handling
- Throws descriptive errors on Supabase query failures
- Returns empty array with zero total if no data

### 3. API Route (`src/pages/api/upcomingmatches.ts`)
**New File Created**

Implemented GET endpoint with:

#### Features
- **No authentication required** - endpoint is publicly accessible
- **Optional user context** - includes user bets if user is authenticated
- **Query validation** - uses Zod schema with detailed error reporting (400)
- **Service integration** - calls `getUpcomingMatches()` with validated parameters
- **Response formatting** - returns `MatchListResponse` with pagination metadata (200)
- **Error handling** - catches and logs errors, returns generic 500 message

#### Response Structure
```typescript
{
  items: MatchListItemDto[],  // Array of matches
  page: number,               // Current page
  pageSize: number,           // Items per page
  total: number              // Total count of matches
}
```

#### Status Codes
- `200 OK` - Successful response with data
- `400 Bad Request` - Invalid query parameters
- `500 Internal Server Error` - Unexpected errors

### 4. Test Data (`supabase/seed-scripts/seed_upcoming_matches.sql`)
**New File Created**

Added comprehensive test data:
- **4 scheduled matches** - with varying kickoff times (1-7 days in future)
- **2 live matches** - currently in progress (30-45 minutes ago)
- **Team logos** - some matches have logos, some don't (testing null values)
- **User bets** - distributed across Alice, Bob, and Charlie for different matches
- **Mixed scenarios** - scheduled matches with/without bets, live matches with bets

### 5. Manual Test Suite (`tests/test-upcoming-matches.mjs`)
**New File Created**

Node.js test script covering:
- **Basic functionality** - default parameters
- **Pagination** - multiple pages with different sizes
- **Status filtering** - scheduled only, live only, both
- **Sorting** - ascending and descending
- **Date range filtering** - from, to, combined
- **Combined filters** - multiple parameters together
- **Error cases** - invalid inputs for all parameters
- **Response validation** - structure and data integrity checks

## Database Schema Considerations

### Existing Indexes (Confirmed in Plan)
The implementation relies on these existing indexes for performance:
- `idx_matches_status_kickoff_time` - Compound index for status + kickoff_time filtering
- `idx_matches_kickoff_time` - Single column index for time-based queries
- Unique constraints on IDs for joins

### Foreign Keys Used
- `bets_match_id_fkey` - Used for left join between matches and bets
- `bets_user_id_fkey` - Implicit in filtering bets by user_id

## API Endpoint Details

### URL
```
GET /api/upcomingmatches
```

### Query Parameters
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| page | integer | No | 1 | Page number (min: 1) |
| pageSize | integer | No | 20 | Items per page (min: 1, max: 100) |
| status | enum | No | - | Filter by status: "scheduled" or "live" |
| from | ISO string | No | - | Filter matches from this time (inclusive) |
| to | ISO string | No | - | Filter matches until this time (inclusive) |
| sort | enum | No | kickoff_time.asc | Sort order: "kickoff_time.asc" or "kickoff_time.desc" |

### Response Example
```json
{
  "items": [
    {
      "id": "44444444-4444-4444-4444-444444444444",
      "apiMatchId": "api_match_4",
      "homeTeamName": "Arsenal",
      "awayTeamName": "Chelsea",
      "homeTeamLogo": "https://example.com/arsenal.png",
      "awayTeamLogo": "https://example.com/chelsea.png",
      "homeTeamScore": null,
      "awayTeamScore": null,
      "kickoffTime": "2026-01-14T15:00:00.000Z",
      "status": "scheduled",
      "bettingDeadline": "2026-01-14T14:55:00.000Z",
      "userBet": {
        "id": "bet-uuid",
        "matchId": "44444444-4444-4444-4444-444444444444",
        "homeScore": 2,
        "awayScore": 1,
        "pointsAwarded": null,
        "updatedAt": "2026-01-13T10:30:00.000Z"
      }
    }
  ],
  "page": 1,
  "pageSize": 20,
  "total": 6
}
```

## Testing Instructions

### 1. Load Test Data

#### Option A: Using Node.js script (Recommended)
```bash
node supabase/seed-scripts/load-test-data.mjs
```

#### Option B: Using SQL file
```sql
-- Run in Supabase SQL editor
\i supabase/seed.sql
\i supabase/seed-scripts/seed_upcoming_matches.sql
```

### 2. Start Development Server
```bash
npm run dev
```

### 3. Run Manual Tests
```bash
node tests/test-upcoming-matches.mjs
```

### 4. Manual Testing Examples

#### Get all upcoming matches (default)
```bash
curl http://localhost:3000/api/upcomingmatches
```

#### Get only scheduled matches
```bash
curl http://localhost:3000/api/upcomingmatches?status=scheduled
```

#### Get matches in next 3 days, sorted by latest first
```bash
curl "http://localhost:3000/api/upcomingmatches?to=2026-01-16T00:00:00Z&sort=kickoff_time.desc"
```

#### Pagination
```bash
curl http://localhost:3000/api/upcomingmatches?page=1&pageSize=2
curl http://localhost:3000/api/upcomingmatches?page=2&pageSize=2
```

## Security Considerations

### Implemented
✅ No authentication required for public access
✅ Input validation with Zod (prevents injection)
✅ Whitelist for sort and status parameters
✅ PageSize cap at 100 (prevents resource abuse)
✅ Prepared queries via Supabase client (no SQL injection)
✅ User bet filtering server-side (privacy protection)
✅ Error message sanitization (no internal details leaked)

### Authentication Flow
- Endpoint checks for authenticated user using `supabase.auth.getUser()`
- If user exists: includes their bets in response
- If no user: returns matches without `userBet` field
- No 401 error for unauthenticated users (public endpoint)

## Performance Considerations

### Query Optimization
- **Single query** with left join (no N+1 problem)
- **Selected columns only** (no SELECT *)
- **Indexed filters** on status and kickoff_time
- **Pagination** limits result set size
- **Count optimization** using Supabase exact count

### Expected Performance
- Fast queries due to indexes on frequently filtered columns
- Sub-100ms response time for typical requests (< 100 items)
- Efficient pagination with stable performance across pages

### Future Optimizations (if needed)
- Add caching layer for public queries (Redis)
- Implement cursor-based pagination for very large datasets
- Add composite index if specific filter combinations become common

## Known Limitations & Future Enhancements

### Current Limitations
1. **No user profile join** - Only user ID available, not nickname
2. **No team details** - Limited to names and logos from matches table
3. **Fixed deadline calculation** - Always 5 minutes, not configurable
4. **No betting status** - Doesn't indicate if user can still bet

### Potential Enhancements
1. Add `canBet` boolean field based on deadline comparison
2. Include `totalBets` count per match
3. Add match competition/league information
4. Support filtering by team names
5. Add real-time updates for live match scores via WebSocket
6. Implement caching for frequently accessed pages

## Files Modified/Created

### Created
- ✅ `src/lib/validation/matches.ts` (63 lines)
- ✅ `src/lib/services/matchesService.ts` (126 lines)
- ✅ `src/pages/api/upcomingmatches.ts` (79 lines)
- ✅ `supabase/seed-scripts/seed_upcoming_matches.sql` (42 lines)
- ✅ `supabase/seed-scripts/load-test-data.mjs` (172 lines)
- ✅ `tests/test-upcoming-matches.mjs` (205 lines)
- ✅ `.ai/endpoint-plans/get-matches-IMPLEMENTATION-SUMMARY.md` (this file)

### Modified
- None (all new implementations)

## Verification Checklist

- ✅ Validation schema implemented with Zod
- ✅ Service layer with database queries
- ✅ API route with proper error handling
- ✅ DTO mapping to camelCase
- ✅ Betting deadline calculation (UTC)
- ✅ User bet filtering (optional)
- ✅ Pagination support
- ✅ Status filtering (scheduled/live)
- ✅ Date range filtering (from/to)
- ✅ Sorting support (asc/desc)
- ✅ Public access (no auth required)
- ✅ Test data created
- ✅ Manual test suite created
- ✅ No linter errors
- ✅ Documentation complete

## Conclusion

The GET `/api/upcomingmatches` endpoint has been successfully implemented with full functionality as specified in the implementation plan. The endpoint is production-ready with proper validation, error handling, and performance considerations.

The implementation follows project conventions and best practices:
- Consistent with existing `leaderboard.ts` endpoint structure
- Type-safe with TypeScript and Zod
- Proper separation of concerns (validation, service, route)
- Comprehensive error handling
- Performance-optimized queries
- Well-documented and testable

**Status**: ✅ Ready for integration and further testing

