#!/usr/bin/env node
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "http://127.0.0.1:54321";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU";

const supabase = createClient(supabaseUrl, supabaseKey);

async function loadTestData() {
  console.log("🔄 Loading test data for upcoming matches...\n");

  // Insert upcoming test matches
  const matches = [
    // Scheduled matches (future)
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
    // Live matches
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

  const { data: matchData, error: matchError } = await supabase
    .from("matches")
    .upsert(matches, { onConflict: "api_match_id" });

  if (matchError) {
    console.error("❌ Error inserting matches:", matchError);
    process.exit(1);
  }

  console.log("✅ Inserted 6 matches (4 scheduled + 2 live)\n");

  // Insert test bets
  const bets = [
    // Alice bets
    {
      user_id: "57e03949-57b7-41e4-8b55-a6c6caf1cd98",
      match_id: "44444444-4444-4444-4444-444444444444",
      home_score: 2,
      away_score: 1,
    },
    {
      user_id: "57e03949-57b7-41e4-8b55-a6c6caf1cd98",
      match_id: "55555555-5555-5555-5555-555555555555",
      home_score: 1,
      away_score: 1,
    },
    // Bob bets
    {
      user_id: "67e03949-57b7-41e4-8b55-a6c6caf1cd99",
      match_id: "44444444-4444-4444-4444-444444444444",
      home_score: 3,
      away_score: 0,
    },
    {
      user_id: "67e03949-57b7-41e4-8b55-a6c6caf1cd99",
      match_id: "66666666-6666-6666-6666-666666666666",
      home_score: 2,
      away_score: 2,
    },
    {
      user_id: "67e03949-57b7-41e4-8b55-a6c6caf1cd99",
      match_id: "77777777-7777-7777-7777-777777777777",
      home_score: 1,
      away_score: 0,
    },
    // Charlie bets
    {
      user_id: "77e03949-57b7-41e4-8b55-a6c6caf1cd9a",
      match_id: "88888888-8888-8888-8888-888888888888",
      home_score: 2,
      away_score: 2,
    },
    {
      user_id: "77e03949-57b7-41e4-8b55-a6c6caf1cd9a",
      match_id: "55555555-5555-5555-5555-555555555555",
      home_score: 0,
      away_score: 2,
    },
  ];

  const { data: betData, error: betError } = await supabase
    .from("bets")
    .upsert(bets, { onConflict: "user_id,match_id" });

  if (betError) {
    console.error("❌ Error inserting bets:", betError);
    process.exit(1);
  }

  console.log("✅ Inserted 7 bets for Alice, Bob, and Charlie\n");
  console.log("🎉 Test data loaded successfully!\n");
}

loadTestData().catch((error) => {
  console.error("❌ Failed to load test data:", error);
  process.exit(1);
});
