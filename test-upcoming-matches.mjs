#!/usr/bin/env node

/**
 * Manual test script for GET /api/upcomingmatches endpoint
 *
 * Usage:
 *   node test-upcoming-matches.mjs
 *
 * Prerequisites:
 *   - Supabase local instance running
 *   - Seed data loaded (including seed_upcoming_matches.sql)
 *   - Dev server running on http://localhost:3000
 */

const BASE_URL = "http://localhost:3000";
const API_ENDPOINT = "/api/upcomingmatches";

const colors = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function logTest(testName) {
  log(`\n${"=".repeat(60)}`, colors.cyan);
  log(`TEST: ${testName}`, colors.cyan);
  log("=".repeat(60), colors.cyan);
}

async function testEndpoint(description, params = {}) {
  const queryString = new URLSearchParams(params).toString();
  const url = `${BASE_URL}${API_ENDPOINT}${queryString ? "?" + queryString : ""}`;

  log(`\n📡 ${description}`, colors.blue);
  log(`URL: ${url}`, colors.yellow);

  try {
    const response = await fetch(url);
    const data = await response.json();

    log(`Status: ${response.status}`, response.status === 200 ? colors.green : colors.red);
    log(`Response:`, colors.yellow);
    console.log(JSON.stringify(data, null, 2));

    // Validate response structure
    if (response.status === 200) {
      const hasItems = Array.isArray(data.items);
      const hasPage = typeof data.page === "number";
      const hasPageSize = typeof data.pageSize === "number";
      const hasTotal = typeof data.total === "number";

      if (hasItems && hasPage && hasPageSize && hasTotal) {
        log(`✓ Response structure valid`, colors.green);
        log(`  - Items: ${data.items.length}`, colors.green);
        log(`  - Total: ${data.total}`, colors.green);
        log(`  - Page: ${data.page}/${Math.ceil(data.total / data.pageSize)}`, colors.green);

        // Validate first item structure if exists
        if (data.items.length > 0) {
          const item = data.items[0];
          const hasId = !!item.id;
          const hasTeams = !!item.homeTeamName && !!item.awayTeamName;
          const hasKickoff = !!item.kickoffTime;
          const hasDeadline = !!item.bettingDeadline;
          const hasStatus = !!item.status;

          if (hasId && hasTeams && hasKickoff && hasDeadline && hasStatus) {
            log(`✓ Item structure valid`, colors.green);
            log(`  - Match: ${item.homeTeamName} vs ${item.awayTeamName}`, colors.green);
            log(`  - Status: ${item.status}`, colors.green);
            log(`  - Kickoff: ${item.kickoffTime}`, colors.green);
            log(`  - Deadline: ${item.bettingDeadline}`, colors.green);
            if (item.userBet) {
              log(`  - User Bet: ${item.userBet.homeScore}-${item.userBet.awayScore}`, colors.green);
            }
          }
        }
      } else {
        log(`✗ Invalid response structure`, colors.red);
      }
    }

    return { success: response.status === 200, data };
  } catch (error) {
    log(`✗ Error: ${error.message}`, colors.red);
    return { success: false, error: error.message };
  }
}

async function runTests() {
  log("\n🧪 Starting Upcoming Matches Endpoint Tests", colors.cyan);
  log("=".repeat(60), colors.cyan);

  // Test 1: Basic request (default params)
  logTest("Basic Request - Default Parameters");
  await testEndpoint("Get first page with defaults");

  // Test 2: Pagination
  logTest("Pagination Tests");
  await testEndpoint("Page 1 with 2 items", { page: 1, pageSize: 2 });
  await testEndpoint("Page 2 with 2 items", { page: 2, pageSize: 2 });

  // Test 3: Status filtering
  logTest("Status Filtering Tests");
  await testEndpoint("Only scheduled matches", { status: "scheduled" });
  await testEndpoint("Only live matches", { status: "live" });

  // Test 4: Sorting
  logTest("Sorting Tests");
  await testEndpoint("Sort by kickoff time ascending (default)", { sort: "kickoff_time.asc" });
  await testEndpoint("Sort by kickoff time descending", { sort: "kickoff_time.desc" });

  // Test 5: Date range filtering
  logTest("Date Range Filtering Tests");
  const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
  const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
  await testEndpoint("Matches from tomorrow", { from: tomorrow });
  await testEndpoint("Matches until next week", { to: nextWeek });
  await testEndpoint("Matches in next week", { from: tomorrow, to: nextWeek });

  // Test 6: Combined filters
  logTest("Combined Filters Tests");
  await testEndpoint("Scheduled matches, next 3 days, sorted desc", {
    status: "scheduled",
    to: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    sort: "kickoff_time.desc",
  });

  // Test 7: Error cases
  logTest("Error Handling Tests");
  await testEndpoint("Invalid page number", { page: 0 });
  await testEndpoint("Invalid pageSize (too large)", { pageSize: 101 });
  await testEndpoint("Invalid status", { status: "invalid" });
  await testEndpoint("Invalid sort", { sort: "invalid" });
  await testEndpoint("Invalid date format", { from: "not-a-date" });

  log("\n✅ All tests completed!", colors.green);
  log("=".repeat(60), colors.cyan);
}

// Run tests
runTests().catch((error) => {
  log(`\n❌ Test suite failed: ${error.message}`, colors.red);
  process.exit(1);
});
