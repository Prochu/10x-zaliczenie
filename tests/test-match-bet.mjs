#!/usr/bin/env node

/**
 * Manual test script for PUT /api/matches/[matchId]/bet endpoint
 *
 * Usage:
 *   node tests/test-match-bet.mjs
 *
 * Prerequisites:
 *   - Supabase local instance running
 *   - Seed data loaded (node supabase/seed-scripts/seed-all.mjs)
 *   - Dev server running on http://localhost:3000
 */

const BASE_URL = "http://localhost:3000";

// Test data from seed script
const TEST_USER_ID = "57e03949-57b7-41e4-8b55-a6c6caf1cd98"; // Alice

// Match IDs from seed script
const SCHEDULED_MATCH_ID = "44444444-4444-4444-4444-444444444444"; // Arsenal vs Chelsea (scheduled)
const LIVE_MATCH_ID = "88888888-8888-8888-8888-888888888888"; // Dortmund vs Leipzig (live)
const FINISHED_MATCH_ID = "11111111-1111-1111-1111-111111111111"; // Real Madrid vs Barcelona (finished)
const NONEXISTENT_MATCH_ID = "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee";

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

async function testEndpoint(description, matchId, body, expectedStatus = 200) {
  const url = `${BASE_URL}/api/matches/${matchId}/bet`;

  log(`\n📡 ${description}`, colors.blue);
  log(`URL: ${url}`, colors.yellow);
  log(`Body: ${JSON.stringify(body)}`, colors.yellow);

  try {
    const response = await fetch(url, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    let data;
    try {
      data = await response.json();
    } catch {
      data = null;
    }

    const statusColor = response.status === expectedStatus ? colors.green : colors.red;
    log(`Status: ${response.status} (expected: ${expectedStatus})`, statusColor);

    if (data) {
      log(`Response:`, colors.yellow);
      console.log(JSON.stringify(data, null, 2));
    } else {
      log(`Response: No JSON body`, colors.yellow);
    }

    return { response, data };
  } catch (error) {
    log(`Network Error: ${error.message}`, colors.red);
    return { error };
  }
}

async function runTests() {
  log("🚀 Starting PUT /api/matches/[matchId]/bet endpoint tests", colors.cyan);
  log("=".repeat(60), colors.cyan);

  let passedTests = 0;
  let totalTests = 0;

  function assert(condition, message) {
    totalTests++;
    if (condition) {
      log(`✓ ${message}`, colors.green);
      passedTests++;
    } else {
      log(`✗ ${message}`, colors.red);
    }
  }

  // ===== SUCCESS CASES =====

  logTest("SUCCESS: Place new bet on scheduled match");
  const result1 = await testEndpoint("Place bet on scheduled match", SCHEDULED_MATCH_ID, {
    homeScore: 2,
    awayScore: 1,
  });
  assert(result1.response?.status === 200, "Should return 200 for valid bet");
  assert(result1.data?.id, "Should return bet ID");
  assert(result1.data?.matchId === SCHEDULED_MATCH_ID, "Should return correct matchId");
  assert(result1.data?.homeScore === 2, "Should return correct homeScore");
  assert(result1.data?.awayScore === 1, "Should return correct awayScore");

  logTest("SUCCESS: Update existing bet");
  const result2 = await testEndpoint("Update existing bet with different scores", SCHEDULED_MATCH_ID, {
    homeScore: 3,
    awayScore: 0,
  });
  assert(result2.response?.status === 200, "Should return 200 for bet update");
  assert(result2.data?.homeScore === 3, "Should return updated homeScore");
  assert(result2.data?.awayScore === 0, "Should return updated awayScore");

  logTest("BUSINESS: Betting locked for live match with passed deadline");
  const result3 = await testEndpoint(
    "Live match with passed deadline",
    LIVE_MATCH_ID,
    { homeScore: 1, awayScore: 2 },
    403
  );
  assert(result3.response?.status === 403, "Should block bets on live matches with passed deadline");
  assert(result3.data?.error === "betting_locked", "Should return betting_locked error");

  // ===== VALIDATION ERRORS =====

  logTest("VALIDATION: Invalid matchId format");
  const result4 = await testEndpoint(
    "Invalid matchId (not UUID)",
    "invalid-match-id",
    { homeScore: 1, awayScore: 0 },
    400
  );
  assert(result4.response?.status === 400, "Should return 400 for invalid matchId");
  assert(result4.data?.error === "invalid_request", "Should return correct error type");

  logTest("VALIDATION: Negative homeScore");
  const result5 = await testEndpoint("Negative homeScore", SCHEDULED_MATCH_ID, { homeScore: -1, awayScore: 0 }, 400);
  assert(result5.response?.status === 400, "Should return 400 for negative homeScore");

  logTest("VALIDATION: Negative awayScore");
  const result6 = await testEndpoint("Negative awayScore", SCHEDULED_MATCH_ID, { homeScore: 0, awayScore: -2 }, 400);
  assert(result6.response?.status === 400, "Should return 400 for negative awayScore");

  logTest("VALIDATION: Non-integer scores");
  const result7 = await testEndpoint("Non-integer scores", SCHEDULED_MATCH_ID, { homeScore: 1.5, awayScore: 2.7 }, 400);
  assert(result7.response?.status === 400, "Should return 400 for non-integer scores");

  logTest("VALIDATION: Missing homeScore");
  const result8 = await testEndpoint("Missing homeScore", SCHEDULED_MATCH_ID, { awayScore: 1 }, 400);
  assert(result8.response?.status === 400, "Should return 400 for missing homeScore");

  logTest("VALIDATION: Missing awayScore");
  const result9 = await testEndpoint("Missing awayScore", SCHEDULED_MATCH_ID, { homeScore: 2 }, 400);
  assert(result9.response?.status === 400, "Should return 400 for missing awayScore");

  // ===== BUSINESS LOGIC ERRORS =====

  logTest("BUSINESS: Match not found");
  const result10 = await testEndpoint(
    "Non-existent match ID",
    NONEXISTENT_MATCH_ID,
    { homeScore: 1, awayScore: 0 },
    404
  );
  assert(result10.response?.status === 404, "Should return 404 for non-existent match");
  assert(result10.data?.error === "match_not_found", "Should return correct error type");

  logTest("BUSINESS: Betting locked (finished match)");
  const result11 = await testEndpoint("Bet on finished match", FINISHED_MATCH_ID, { homeScore: 2, awayScore: 1 }, 403);
  assert(result11.response?.status === 403, "Should return 403 for finished match");
  assert(result11.data?.error === "betting_locked", "Should return correct error type");

  // ===== REQUEST ERRORS =====

  logTest("REQUEST: Invalid JSON body");
  const invalidJsonResult = await fetch(`${BASE_URL}/api/matches/${SCHEDULED_MATCH_ID}/bet`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: "{ invalid json }",
  });
  const invalidJsonData = await invalidJsonResult.json().catch(() => null);

  assert(invalidJsonResult.status === 400, "Should return 400 for invalid JSON");
  assert(invalidJsonData?.error === "invalid_request", "Should return correct error type");

  // ===== SUMMARY =====

  log("\n" + "=".repeat(60), colors.cyan);
  log("TEST SUMMARY", colors.cyan);
  log("=".repeat(60), colors.cyan);
  log(`Total Tests: ${totalTests}`, colors.blue);
  log(`Passed: ${passedTests}`, passedTests === totalTests ? colors.green : colors.red);
  log(`Failed: ${totalTests - passedTests}`, totalTests - passedTests === 0 ? colors.green : colors.red);

  if (passedTests === totalTests) {
    log("\n🎉 All tests passed!", colors.green);
  } else {
    log("\n❌ Some tests failed. Check the output above.", colors.red);
    process.exit(1);
  }
}

// Run the tests
runTests().catch((error) => {
  log(`\n💥 Fatal error: ${error.message}`, colors.red);
  console.error(error);
  process.exit(1);
});
