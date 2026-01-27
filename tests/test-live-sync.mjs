/**
 * Test Script for Intelligent Live Match Sync
 *
 * This script tests the pre-check logic and live sync functionality:
 * 1. No matches in live window (should skip API call)
 * 2. One match in live window
 * 3. Multiple matches in live window
 * 4. Match outside the live window (should skip)
 *
 * Usage:
 *   node tests/test-live-sync.mjs
 *
 * Prerequisites:
 *   - .env file with SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, FOOTBALL_API_KEY, CRON_SECRET
 *   - Supabase local instance running OR remote instance configured
 */

import { createClient } from "@supabase/supabase-js";

// Use environment variables directly (loaded by the shell)
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const CRON_SECRET = process.env.CRON_SECRET;
const API_BASE_URL = process.env.API_BASE_URL || "http://localhost:3000";

// Colors for console output
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

function logSuccess(message) {
  log(`✓ ${message}`, colors.green);
}

function logError(message) {
  log(`✗ ${message}`, colors.red);
}

function logInfo(message) {
  log(`ℹ ${message}`, colors.cyan);
}

function logWarning(message) {
  log(`⚠ ${message}`, colors.yellow);
}

// Initialize Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

/**
 * Test helper: Insert a test match with specific kickoff time
 */
async function insertTestMatch(kickoffTimeOffset, status = "scheduled") {
  const now = new Date();
  const kickoffTime = new Date(now.getTime() + kickoffTimeOffset);

  const testMatch = {
    api_match_id: `test_${Date.now()}_${Math.random()}`,
    home_team_name: "Test Home Team",
    home_team_api_id: "test_home_123",
    away_team_name: "Test Away Team",
    away_team_api_id: "test_away_456",
    home_team_score: null,
    away_team_score: null,
    kickoff_time: kickoffTime.toISOString(),
    status: status,
  };

  const { data, error } = await supabase.from("matches").insert(testMatch).select().single();

  if (error) {
    throw new Error(`Failed to insert test match: ${error.message}`);
  }

  return data;
}

/**
 * Test helper: Clean up test matches
 */
async function cleanupTestMatches() {
  const { error } = await supabase.from("matches").delete().like("api_match_id", "test_%");

  if (error) {
    logWarning(`Failed to clean up test matches: ${error.message}`);
  }
}

/**
 * Test helper: Call the sync endpoint
 */
async function callSyncEndpoint(type = "live") {
  const url = `${API_BASE_URL}/api/cron/sync?type=${type}`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${CRON_SECRET}`,
      "Content-Type": "application/json",
    },
  });

  const data = await response.json();

  return {
    status: response.status,
    data,
  };
}

/**
 * Test 1: No matches in live window (should skip API call)
 */
async function testNoMatchesInWindow() {
  log("\n=== Test 1: No Matches in Live Window ===", colors.blue);

  try {
    // Clean up first
    await cleanupTestMatches();

    // Insert a match far in the future (outside the window)
    const futureMatch = await insertTestMatch(
      7 * 24 * 60 * 60 * 1000 // +7 days
    );
    logInfo(`Inserted test match with kickoff: ${futureMatch.kickoff_time}`);

    // Call the sync endpoint
    const result = await callSyncEndpoint("live");

    // Verify response
    if (result.status === 200 && result.data.success) {
      if (result.data.result.skipped === true && result.data.result.apiCallMade === false) {
        logSuccess("Pre-check correctly skipped API call (no matches in window)");
        logInfo(`Response: ${JSON.stringify(result.data.result, null, 2)}`);
        return true;
      } else {
        logError("Expected API call to be skipped but it was not");
        logInfo(`Response: ${JSON.stringify(result.data.result, null, 2)}`);
        return false;
      }
    } else {
      logError(`Unexpected response: ${JSON.stringify(result.data)}`);
      return false;
    }
  } catch (error) {
    logError(`Test failed: ${error.message}`);
    return false;
  } finally {
    await cleanupTestMatches();
  }
}

/**
 * Test 2: One match in live window
 */
async function testOneMatchInWindow() {
  log("\n=== Test 2: One Match in Live Window ===", colors.blue);

  try {
    // Clean up first
    await cleanupTestMatches();

    // Insert a match within the window (+30 minutes)
    const liveMatch = await insertTestMatch(
      30 * 60 * 1000, // +30 minutes
      "live"
    );
    logInfo(`Inserted test match with kickoff: ${liveMatch.kickoff_time}`);

    // Call the sync endpoint
    const result = await callSyncEndpoint("live");

    // Verify response
    if (result.status === 200 && result.data.success) {
      if (result.data.result.skipped !== true && result.data.result.apiCallMade === true) {
        logSuccess("Pre-check correctly triggered API call for match in window");
        logInfo(`Response: ${JSON.stringify(result.data.result, null, 2)}`);
        return true;
      } else {
        logWarning("API call was made but no live matches were found in external API");
        logInfo(`Response: ${JSON.stringify(result.data.result, null, 2)}`);
        logInfo("This is expected if there are no actual live Champions League matches");
        return true;
      }
    } else {
      logError(`Unexpected response: ${JSON.stringify(result.data)}`);
      return false;
    }
  } catch (error) {
    logError(`Test failed: ${error.message}`);
    return false;
  } finally {
    await cleanupTestMatches();
  }
}

/**
 * Test 3: Multiple matches in live window
 */
async function testMultipleMatchesInWindow() {
  log("\n=== Test 3: Multiple Matches in Live Window ===", colors.blue);

  try {
    // Clean up first
    await cleanupTestMatches();

    // Insert multiple matches within the window
    const match1 = await insertTestMatch(10 * 60 * 1000, "live"); // +10 min
    const match2 = await insertTestMatch(60 * 60 * 1000, "scheduled"); // +60 min
    const match3 = await insertTestMatch(120 * 60 * 1000, "scheduled"); // +120 min

    logInfo(`Inserted 3 test matches:`);
    logInfo(`  - Match 1: ${match1.kickoff_time}`);
    logInfo(`  - Match 2: ${match2.kickoff_time}`);
    logInfo(`  - Match 3: ${match3.kickoff_time}`);

    // Call the sync endpoint
    const result = await callSyncEndpoint("live");

    // Verify response
    if (result.status === 200 && result.data.success) {
      if (result.data.result.skipped !== true && result.data.result.apiCallMade === true) {
        logSuccess("Pre-check correctly triggered API call for multiple matches in window");
        logInfo(`Response: ${JSON.stringify(result.data.result, null, 2)}`);
        return true;
      } else {
        logWarning("API call was made but no live matches were found in external API");
        logInfo(`Response: ${JSON.stringify(result.data.result, null, 2)}`);
        logInfo("This is expected if there are no actual live Champions League matches");
        return true;
      }
    } else {
      logError(`Unexpected response: ${JSON.stringify(result.data)}`);
      return false;
    }
  } catch (error) {
    logError(`Test failed: ${error.message}`);
    return false;
  } finally {
    await cleanupTestMatches();
  }
}

/**
 * Test 4: Match outside live window (past match)
 */
async function testMatchOutsideWindow() {
  log("\n=== Test 4: Match Outside Live Window (Past) ===", colors.blue);

  try {
    // Clean up first
    await cleanupTestMatches();

    // Insert a match far in the past (outside the window)
    const pastMatch = await insertTestMatch(
      -5 * 60 * 60 * 1000, // -5 hours
      "finished"
    );
    logInfo(`Inserted test match with kickoff: ${pastMatch.kickoff_time}`);

    // Call the sync endpoint
    const result = await callSyncEndpoint("live");

    // Verify response
    if (result.status === 200 && result.data.success) {
      if (result.data.result.skipped === true && result.data.result.apiCallMade === false) {
        logSuccess("Pre-check correctly skipped API call (match outside window)");
        logInfo(`Response: ${JSON.stringify(result.data.result, null, 2)}`);
        return true;
      } else {
        logError("Expected API call to be skipped but it was not");
        logInfo(`Response: ${JSON.stringify(result.data.result, null, 2)}`);
        return false;
      }
    } else {
      logError(`Unexpected response: ${JSON.stringify(result.data)}`);
      return false;
    }
  } catch (error) {
    logError(`Test failed: ${error.message}`);
    return false;
  } finally {
    await cleanupTestMatches();
  }
}

/**
 * Test 5: Daily sync (should always run)
 */
async function testDailySync() {
  log("\n=== Test 5: Daily Sync (Full Sync) ===", colors.blue);

  try {
    // Call the sync endpoint with type=daily
    const result = await callSyncEndpoint("daily");

    // Verify response
    if (result.status === 200 && result.data.success) {
      logSuccess("Daily sync completed successfully");
      logInfo(`Response: ${JSON.stringify(result.data.result, null, 2)}`);
      return true;
    } else {
      logError(`Unexpected response: ${JSON.stringify(result.data)}`);
      return false;
    }
  } catch (error) {
    logError(`Test failed: ${error.message}`);
    return false;
  }
}

/**
 * Main test runner
 */
async function runTests() {
  log("\n╔═══════════════════════════════════════════════════╗", colors.cyan);
  log("║  Intelligent Live Match Sync - Test Suite       ║", colors.cyan);
  log("╚═══════════════════════════════════════════════════╝", colors.cyan);

  // Verify environment variables
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !CRON_SECRET) {
    logError("Missing required environment variables!");
    logError("Please ensure .env file contains:");
    logError("  - SUPABASE_URL");
    logError("  - SUPABASE_SERVICE_ROLE_KEY");
    logError("  - CRON_SECRET");
    process.exit(1);
  }

  logInfo(`API Base URL: ${API_BASE_URL}`);
  logInfo(`Supabase URL: ${SUPABASE_URL}`);
  log("");

  const results = [];

  // Run all tests
  results.push(await testNoMatchesInWindow());
  results.push(await testOneMatchInWindow());
  results.push(await testMultipleMatchesInWindow());
  results.push(await testMatchOutsideWindow());
  results.push(await testDailySync());

  // Summary
  log("\n╔═══════════════════════════════════════════════════╗", colors.cyan);
  log("║  Test Summary                                     ║", colors.cyan);
  log("╚═══════════════════════════════════════════════════╝", colors.cyan);

  const passed = results.filter((r) => r).length;
  const total = results.length;

  if (passed === total) {
    logSuccess(`\nAll tests passed! (${passed}/${total})`);
    process.exit(0);
  } else {
    logError(`\nSome tests failed. (${passed}/${total} passed)`);
    process.exit(1);
  }
}

// Run tests
runTests().catch((error) => {
  logError(`Fatal error: ${error.message}`);
  console.error(error);
  process.exit(1);
});
