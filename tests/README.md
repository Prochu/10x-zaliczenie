# Tests

This directory contains test scripts for the API endpoints.

## Files

### `test-upcoming-matches.mjs`
Comprehensive manual test suite for the `/api/upcomingmatches` endpoint.

**Usage:**
```bash
# Make sure dev server is running
npm run dev

# Run tests
node tests/test-upcoming-matches.mjs
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

## Prerequisites

Before running tests:

1. **Start Supabase**
   ```bash
   supabase start
   ```

2. **Load Test Data**
   ```bash
   node supabase/seed-scripts/load-test-data.mjs
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

1. Add a new test function in `test-upcoming-matches.mjs`
2. Call it from `runTests()` function
3. Follow the existing pattern for consistency
4. Document the test case in this README

