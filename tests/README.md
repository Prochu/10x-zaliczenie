# Tests

This directory contains test scripts for the API endpoints.

## Files

### `test-upcoming-matches.mjs`
Comprehensive manual test suite for the `/api/upcomingmatches` endpoint.

### `test-match-bet.mjs`
Comprehensive manual test suite for the `PUT /api/matches/[matchId]/bet` endpoint.

**Usage:**
```bash
# Make sure dev server is running
npm run dev

# Run upcoming matches tests
node tests/test-upcoming-matches.mjs

# Run match bet tests
node tests/test-match-bet.mjs
```

## Test Coverage

The test suite covers:

### 1. Basic Functionality
- Default parameters
- Response structure validation
- Pagination metadata

### 2. Pagination
- Multiple pages with different page sizes
- Page counting
- Offset calculation

### 3. Status Filtering
- Filter by `scheduled` only
- Filter by `live` only
- Default (both statuses)

### 4. Sorting
- Ascending order (default)
- Descending order
- Correct ordering by kickoff time

### 5. Date Range Filtering
- Filter from date
- Filter to date
- Combined date range

### 6. Combined Filters
- Multiple filters at once
- Status + date range + sorting

### 7. Error Handling
- Invalid page number (< 1)
- Invalid pageSize (> 100)
- Invalid status value
- Invalid sort value
- Invalid date format

## Match Bet Tests (`test-match-bet.mjs`)

The match bet test suite covers:

### 1. Success Cases
- Place new bet on scheduled match
- Update existing bet with different scores
- Place bet on live match

### 2. Input Validation
- Invalid matchId format (not UUID)
- Negative scores
- Non-integer scores
- Missing required fields (homeScore, awayScore)

### 3. Business Logic Guards
- Match not found (404)
- Betting locked for finished matches (403)
- Betting deadline enforcement (future feature)

### 4. Request Errors
- Invalid JSON body
- Malformed requests

### 5. Response Validation
- Correct HTTP status codes
- Proper error response structure
- Valid bet response with all required fields
- Correct bet upsert behavior (insert vs update)

## Prerequisites

Before running tests:

1. **Start Supabase**
   ```bash
   supabase start
   ```

2. **Load Test Data**
   ```bash
   node supabase/seed-scripts/seed-all.mjs
   ```

3. **Start Dev Server**
   ```bash
   npm run dev
   ```

## Test Output

The test script provides:
- Color-coded output (green = success, red = error)
- Detailed response validation
- Structure checks for all responses
- Summary of test results

## Expected Results

All tests should pass with:
- ✓ 200 OK for valid requests
- ✓ 400 Bad Request for invalid parameters
- ✓ Correct response structure
- ✓ Valid pagination metadata
- ✓ Proper data filtering and sorting

## Adding New Tests

To add new test cases:

1. Add a new test function in the appropriate test file (`test-upcoming-matches.mjs` or `test-match-bet.mjs`)
2. Call it from the respective `runTests()` function
3. Follow the existing pattern for consistency
4. Document the test case in this README

