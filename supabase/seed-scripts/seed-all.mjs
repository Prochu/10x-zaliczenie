#!/usr/bin/env node
/* eslint-disable no-console, no-undef */

/**
 * Test data seed script - loads matches and bets for testing
 *
 * Usage:
 *   node supabase/seed-scripts/seed-all.mjs
 *
 * This script loads:
 * 1. Finished matches (for leaderboard)
 * 2. Upcoming matches (scheduled and live)
 * 3. All test bets
 *
 * Note: Users should be created separately using seed-users.mjs
 *
 * Prerequisites:
 *   - Supabase local instance running (supabase start)
 *   - Users created (run seed-users.mjs first)
 *   - Node.js with @supabase/supabase-js installed
 */
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "http://127.0.0.1:54321";
const supabaseServiceKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU";

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function seedAll() {
  console.log("🌱 Starting test data seed...\n");

  try {
    // Step 0: Clean up existing test data
    console.log("🧹 Step 0: Cleaning up existing test matches and bets...");
    await cleanupTestData();

    // Step 1: Create finished matches (for leaderboard)
    console.log("\n⚽ Step 1: Creating finished matches...");
    await seedFinishedMatches();

    // Step 2: Create upcoming matches
    console.log("\n📅 Step 2: Creating upcoming matches...");
    await seedUpcomingMatches();

    // Step 3: Create bets for finished matches (with points)
    console.log("\n🎲 Step 3: Creating bets for finished matches...");
    await seedLeaderboardBets();

    // Step 4: Create bets for upcoming matches (without points)
    console.log("\n🎲 Step 4: Creating bets for upcoming matches...");
    await seedUpcomingBets();

    console.log("\n✅ Test data seeding completed successfully!\n");
    console.log("📊 Summary:");
    console.log("  - 3 finished matches (for leaderboard)");
    console.log("  - 6 upcoming matches (4 scheduled + 2 live)");
    console.log("  - 15 bets for finished matches (with points)");
    console.log("  - 7 bets for upcoming matches (without points)");
    console.log("\n💡 Note: Users should be created separately using seed-users.mjs");
    console.log("\n🎉 Ready for testing!\n");
  } catch (error) {
    console.error("\n❌ Seeding failed:", error);
    process.exit(1);
  }
}

async function cleanupTestData() {
  console.log("🧹 Cleaning up existing test matches and bets...");

  try {
    // Delete in reverse dependency order to handle foreign keys properly

    // Delete bets first (depends on users and matches)
    const { error: betsError } = await supabase
      .from("bets")
      .delete()
      .or(
        "user_id.eq.57e03949-57b7-41e4-8b55-a6c6caf1cd98,user_id.eq.67e03949-57b7-41e4-8b55-a6c6caf1cd99,user_id.eq.77e03949-57b7-41e4-8b55-a6c6caf1cd9a,user_id.eq.87e03949-57b7-41e4-8b55-a6c6caf1cd9b,user_id.eq.97e03949-57b7-41e4-8b55-a6c6caf1cd9c"
      );
    if (betsError) throw new Error(`Failed to delete bets: ${betsError.message}`);

    // Delete matches
    const { error: matchesError } = await supabase
      .from("matches")
      .delete()
      .or(
        "api_match_id.eq.api_match_1,api_match_id.eq.api_match_2,api_match_id.eq.api_match_3,api_match_id.eq.api_match_4,api_match_id.eq.api_match_5,api_match_id.eq.api_match_6,api_match_id.eq.api_match_7,api_match_id.eq.api_match_8,api_match_id.eq.api_match_9"
      );
    if (matchesError) throw new Error(`Failed to delete matches: ${matchesError.message}`);

    console.log("  ✓ Cleaned up test matches and bets");
  } catch (error) {
    console.warn(`Warning during cleanup: ${error.message}`);
    // Don't throw error during cleanup - continue with seeding
  }
}

async function seedFinishedMatches() {
  const matches = [
    {
      id: "11111111-1111-1111-1111-111111111111",
      api_match_id: "api_match_1",
      home_team_name: "Real Madrid",
      home_team_api_id: "team_1",
      away_team_name: "Barcelona",
      away_team_api_id: "team_2",
      home_team_score: 2,
      away_team_score: 1,
      kickoff_time: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      status: "finished",
    },
    {
      id: "22222222-2222-2222-2222-222222222222",
      api_match_id: "api_match_2",
      home_team_name: "Bayern Munich",
      home_team_api_id: "team_3",
      away_team_name: "PSG",
      away_team_api_id: "team_4",
      home_team_score: 3,
      away_team_score: 3,
      kickoff_time: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      status: "finished",
    },
    {
      id: "33333333-3333-3333-3333-333333333333",
      api_match_id: "api_match_3",
      home_team_name: "Liverpool",
      home_team_api_id: "team_5",
      away_team_name: "Man City",
      away_team_api_id: "team_6",
      home_team_score: 1,
      away_team_score: 0,
      kickoff_time: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      status: "finished",
    },
  ];

  const { error } = await supabase.from("matches").upsert(matches, { onConflict: "api_match_id" });
  if (error) throw new Error(`Failed to insert finished matches: ${error.message}`);

  console.log("  ✓ Created 3 finished matches");
}

async function seedUpcomingMatches() {
  const matches = [
    {
      id: "44444444-4444-4444-4444-444444444444",
      api_match_id: "api_match_4",
      home_team_name: "Arsenal",
      home_team_api_id: "team_7",
      away_team_name: "Chelsea",
      away_team_api_id: "team_8",
      kickoff_time: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      status: "scheduled",
      home_team_logo: "https://example.com/arsenal.png",
      away_team_logo: "https://example.com/chelsea.png",
    },
    {
      id: "55555555-5555-5555-5555-555555555555",
      api_match_id: "api_match_5",
      home_team_name: "AC Milan",
      home_team_api_id: "team_9",
      away_team_name: "Inter Milan",
      away_team_api_id: "team_10",
      kickoff_time: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
      status: "scheduled",
      home_team_logo: "https://example.com/acmilan.png",
      away_team_logo: "https://example.com/inter.png",
    },
    {
      id: "66666666-6666-6666-6666-666666666666",
      api_match_id: "api_match_6",
      home_team_name: "Juventus",
      home_team_api_id: "team_11",
      away_team_name: "Napoli",
      away_team_api_id: "team_12",
      kickoff_time: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      status: "scheduled",
      home_team_logo: null,
      away_team_logo: null,
    },
    {
      id: "77777777-7777-7777-7777-777777777777",
      api_match_id: "api_match_7",
      home_team_name: "Atletico Madrid",
      home_team_api_id: "team_13",
      away_team_name: "Sevilla",
      away_team_api_id: "team_14",
      kickoff_time: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      status: "scheduled",
      home_team_logo: "https://example.com/atletico.png",
      away_team_logo: "https://example.com/sevilla.png",
    },
    {
      id: "88888888-8888-8888-8888-888888888888",
      api_match_id: "api_match_8",
      home_team_name: "Dortmund",
      home_team_api_id: "team_15",
      away_team_name: "Leipzig",
      away_team_api_id: "team_16",
      kickoff_time: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      status: "live",
      home_team_score: 1,
      away_team_score: 1,
      home_team_logo: "https://example.com/dortmund.png",
      away_team_logo: "https://example.com/leipzig.png",
    },
    {
      id: "99999999-9999-9999-9999-999999999999",
      api_match_id: "api_match_9",
      home_team_name: "Tottenham",
      home_team_api_id: "team_17",
      away_team_name: "Man United",
      away_team_api_id: "team_18",
      kickoff_time: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
      status: "live",
      home_team_score: 2,
      away_team_score: 0,
      home_team_logo: "https://example.com/tottenham.png",
      away_team_logo: "https://example.com/manutd.png",
    },
  ];

  const { error } = await supabase.from("matches").upsert(matches, { onConflict: "api_match_id" });
  if (error) throw new Error(`Failed to insert upcoming matches: ${error.message}`);

  console.log("  ✓ Created 6 upcoming matches (4 scheduled + 2 live)");
}

async function seedLeaderboardBets() {
  const bets = [
    // Alice: 8 points
    {
      user_id: "57e03949-57b7-41e4-8b55-a6c6caf1cd98",
      match_id: "11111111-1111-1111-1111-111111111111",
      home_score: 2,
      away_score: 1,
      points_awarded: 4,
    },
    {
      user_id: "57e03949-57b7-41e4-8b55-a6c6caf1cd98",
      match_id: "22222222-2222-2222-2222-222222222222",
      home_score: 3,
      away_score: 3,
      points_awarded: 2,
    },
    {
      user_id: "57e03949-57b7-41e4-8b55-a6c6caf1cd98",
      match_id: "33333333-3333-3333-3333-333333333333",
      home_score: 2,
      away_score: 0,
      points_awarded: 2,
    },
    // Bob: 5 points
    {
      user_id: "67e03949-57b7-41e4-8b55-a6c6caf1cd99",
      match_id: "11111111-1111-1111-1111-111111111111",
      home_score: 3,
      away_score: 2,
      points_awarded: 2,
    },
    {
      user_id: "67e03949-57b7-41e4-8b55-a6c6caf1cd99",
      match_id: "22222222-2222-2222-2222-222222222222",
      home_score: 2,
      away_score: 2,
      points_awarded: 2,
    },
    {
      user_id: "67e03949-57b7-41e4-8b55-a6c6caf1cd99",
      match_id: "33333333-3333-3333-3333-333333333333",
      home_score: 2,
      away_score: 1,
      points_awarded: 1,
    },
    // Charlie: 5 points
    {
      user_id: "77e03949-57b7-41e4-8b55-a6c6caf1cd9a",
      match_id: "11111111-1111-1111-1111-111111111111",
      home_score: 1,
      away_score: 0,
      points_awarded: 1,
    },
    {
      user_id: "77e03949-57b7-41e4-8b55-a6c6caf1cd9a",
      match_id: "22222222-2222-2222-2222-222222222222",
      home_score: 3,
      away_score: 3,
      points_awarded: 4,
    },
    {
      user_id: "77e03949-57b7-41e4-8b55-a6c6caf1cd9a",
      match_id: "33333333-3333-3333-3333-333333333333",
      home_score: 0,
      away_score: 0,
      points_awarded: 0,
    },
    // Diana: 2 points
    {
      user_id: "87e03949-57b7-41e4-8b55-a6c6caf1cd9b",
      match_id: "11111111-1111-1111-1111-111111111111",
      home_score: 1,
      away_score: 1,
      points_awarded: 0,
    },
    {
      user_id: "87e03949-57b7-41e4-8b55-a6c6caf1cd9b",
      match_id: "22222222-2222-2222-2222-222222222222",
      home_score: 1,
      away_score: 1,
      points_awarded: 0,
    },
    {
      user_id: "87e03949-57b7-41e4-8b55-a6c6caf1cd9b",
      match_id: "33333333-3333-3333-3333-333333333333",
      home_score: 2,
      away_score: 0,
      points_awarded: 2,
    },
    // Eve: no bets
  ];

  const { error } = await supabase.from("bets").upsert(bets, { onConflict: "user_id,match_id" });
  if (error) throw new Error(`Failed to insert leaderboard bets: ${error.message}`);

  console.log("  ✓ Created 12 bets for finished matches (with points)");
}

async function seedUpcomingBets() {
  const bets = [
    // Alice
    {
      user_id: "57e03949-57b7-41e4-8b55-a6c6caf1cd98",
      match_id: "44444444-4444-4444-4444-444444444444",
      home_score: 2,
      away_score: 1,
      points_awarded: null,
    },
    {
      user_id: "57e03949-57b7-41e4-8b55-a6c6caf1cd98",
      match_id: "55555555-5555-5555-5555-555555555555",
      home_score: 1,
      away_score: 1,
      points_awarded: null,
    },
    // Bob
    {
      user_id: "67e03949-57b7-41e4-8b55-a6c6caf1cd99",
      match_id: "44444444-4444-4444-4444-444444444444",
      home_score: 3,
      away_score: 0,
      points_awarded: null,
    },
    {
      user_id: "67e03949-57b7-41e4-8b55-a6c6caf1cd99",
      match_id: "66666666-6666-6666-6666-666666666666",
      home_score: 2,
      away_score: 2,
      points_awarded: null,
    },
    {
      user_id: "67e03949-57b7-41e4-8b55-a6c6caf1cd99",
      match_id: "77777777-7777-7777-7777-777777777777",
      home_score: 1,
      away_score: 0,
      points_awarded: null,
    },
    // Charlie
    {
      user_id: "77e03949-57b7-41e4-8b55-a6c6caf1cd9a",
      match_id: "88888888-8888-8888-8888-888888888888",
      home_score: 2,
      away_score: 2,
      points_awarded: null,
    },
    {
      user_id: "77e03949-57b7-41e4-8b55-a6c6caf1cd9a",
      match_id: "55555555-5555-5555-5555-555555555555",
      home_score: 0,
      away_score: 2,
      points_awarded: null,
    },
  ];

  const { error } = await supabase.from("bets").upsert(bets, { onConflict: "user_id,match_id" });
  if (error) throw new Error(`Failed to insert upcoming bets: ${error.message}`);

  console.log("  ✓ Created 7 bets for upcoming matches (without points)");
}

// Run the seeding
seedAll().catch((error) => {
  console.error("\n❌ Fatal error:", error);
  process.exit(1);
});
