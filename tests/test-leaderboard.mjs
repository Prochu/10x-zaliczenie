#!/usr/bin/env node

/**
 * Manual test script for GET /api/leaderboard endpoint
 *
 * Usage:
 *   node tests/test-leaderboard.mjs
 *
 * Prerequisites:
 *   - Supabase local instance running
 *   - Seed data loaded (node supabase/seed-scripts/seed-all.mjs)
 *   - Dev server running on http://localhost:3000
 */

const BASE_URL = "http://localhost:3001";
const API_ENDPOINT = "/api/leaderboard";

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
        log(`  - Page: ${data.page}/${Math.ceil(data.total / data.pageSize) || 1}`, colors.green);

        // Validate first item structure if exists
        if (data.items.length > 0) {
          const item = data.items[0];
          const hasRank = typeof item.rank === "number" || typeof item.rank === "string";
          const hasUserId = !!item.userId;
          const hasNickname = !!item.nickname;
          const hasTotalPoints = typeof item.totalPoints === "number";
          const hasMatchesBet = typeof item.matchesBet === "number";

          if (hasRank && hasUserId && hasNickname && hasTotalPoints && hasMatchesBet) {
            log(`✓ Item structure valid`, colors.green);
            log(`  - Rank: ${item.rank}`, colors.green);
            log(`  - User: ${item.nickname} (${item.userId})`, colors.green);
            log(`  - Points: ${item.totalPoints}`, colors.green);
            log(`  - Matches Bet: ${item.matchesBet}`, colors.green);
          } else {
            log(`✗ Invalid item structure`, colors.red);
            if (!hasRank) log(`  - Missing or invalid rank`, colors.red);
            if (!hasUserId) log(`  - Missing or invalid userId`, colors.red);
            if (!hasNickname) log(`  - Missing or invalid nickname`, colors.red);
            if (!hasTotalPoints) log(`  - Missing or invalid totalPoints`, colors.red);
            if (!hasMatchesBet) log(`  - Missing or invalid matchesBet`, colors.red);
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
  log("\n🧪 Starting Leaderboard Endpoint Tests", colors.cyan);
  log("=".repeat(60), colors.cyan);

  // Test 1: Basic request (default params)
  logTest("Basic Request - Default Parameters");
  await testEndpoint("Get first page with defaults");

  // Test 2: Pagination
  logTest("Pagination Tests");
  await testEndpoint("Page 1 with 2 items", { page: 1, pageSize: 2 });
  await testEndpoint("Page 2 with 2 items", { page: 2, pageSize: 2 });

  // Test 3: Group Filtering (Optional)
  // We need a valid group ID for this. Let's try to get it from the default response if possible.
  // The current API doesn't return groupId in the response, but it uses it internally.

  // Test 4: Error cases
  logTest("Error Handling Tests");
  await testEndpoint("Invalid page number", { page: 0 });
  await testEndpoint("Invalid pageSize (too large)", { pageSize: 101 });
  await testEndpoint("Invalid sort", { sort: "invalid" });
  await testEndpoint("Invalid groupId", { groupId: "not-a-uuid" });

  log("\n✅ All tests completed!", colors.green);
  log("=".repeat(60), colors.cyan);
}

// Run tests
runTests().catch((error) => {
  log(`\n❌ Test suite failed: ${error.message}`, colors.red);
  process.exit(1);
});
