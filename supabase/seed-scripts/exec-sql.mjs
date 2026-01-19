#!/usr/bin/env node
/**
 * Execute SQL file using Supabase REST API
 */
import { readFileSync } from "fs";

const supabaseUrl = "http://127.0.0.1:54321";
const serviceKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU";

const sql1 = readFileSync("supabase/seed-scripts/seed_leaderboard_test_data.sql", "utf-8");
const sql2 = readFileSync("supabase/seed-scripts/seed_upcoming_matches.sql", "utf-8");

console.log("🌱 Loading seed data using SQL...\n");

// Execute SQL files using pg REST API
async function executeSql(sql, name) {
  console.log(`📄 Executing ${name}...`);

  const response = await fetch(`${supabaseUrl}/rest/v1/rpc`, {
    method: "POST",
    headers: {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query: sql,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error(`❌ Error executing ${name}:`, error);
    return false;
  }

  console.log(`✅ ${name} executed successfully\n`);
  return true;
}

// Simple approach: just use the load-test-data.mjs which works after leaderboard data is loaded
console.log("📝 Note: Using seed.sql which should contain leaderboard data");
console.log("📝 Then loading upcoming matches separately\n");

console.log("👉 Please run: supabase db reset");
console.log("👉 This will load seed.sql automatically");
console.log("👉 Then run: node supabase/seed-scripts/load-test-data.mjs\n");
