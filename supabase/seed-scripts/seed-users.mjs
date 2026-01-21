#!/usr/bin/env node
/* eslint-disable no-console, no-undef */

/**
 * User seeding script - creates test users and profiles
 *
 * Usage:
 *   node supabase/seed-scripts/seed-users.mjs
 *
 * Prerequisites:
 *   - Supabase local instance running (supabase start)
 *   - Node.js with @supabase/supabase-js installed
 */
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "http://127.0.0.1:54321";
const supabaseServiceKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU";

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function seedUsers() {
  console.log("👥 Creating users and profiles...");

  // First, create auth users using admin API
  const userConfigs = [
    {
      email: "alice@test.com",
      password: "password123",
      email_confirm: true,
      nickname: "Alice",
    },
    {
      email: "bob@test.com",
      password: "password123",
      email_confirm: true,
      nickname: "Bob",
    },
    {
      email: "charlie@test.com",
      password: "password123",
      email_confirm: true,
      nickname: "Charlie",
    },
    {
      email: "diana@test.com",
      password: "password123",
      email_confirm: true,
      nickname: "Diana",
    },
    {
      email: "eve@test.com",
      password: "password123",
      email_confirm: true,
      nickname: "Eve",
    },
  ];

  const createdUsers = [];

  // Create auth users using admin API
  for (const userConfig of userConfigs) {
    try {
      console.log(`  Creating user: ${userConfig.email}`);
      const { data, error } = await supabase.auth.admin.createUser({
        email: userConfig.email,
        password: userConfig.password,
        email_confirm: userConfig.email_confirm,
        user_metadata: {},
      });

      // Handle different types of errors
      if (error) {
        console.warn(`  Warning: Failed to create user ${userConfig.email}:`, JSON.stringify(error, null, 2));
        // Don't throw error - continue with other users
      } else {
        console.log(`  ✓ Created auth user: ${userConfig.email} (ID: ${data?.user?.id})`);
        createdUsers.push({
          auth_id: data.user.id,
          email: userConfig.email,
          nickname: userConfig.nickname,
        });
      }
    } catch (error) {
      console.warn(`  Warning: Exception creating user ${userConfig.email}:`, error);
      // Don't throw error - continue with other users
    }
  }

  // Then create profiles using the actual auth user IDs
  const profiles = createdUsers.map((user) => ({
    id: user.auth_id, // Use the actual auth user ID as profile ID
    user_id: user.auth_id, // Reference the auth user
    nickname: user.nickname,
    is_admin: false,
  }));

  const { error } = await supabase.from("profiles").upsert(profiles);
  if (error) throw new Error(`Failed to insert profiles: ${error.message}`);

  // Assign all users to the default group
  console.log("  Assigning users to default group...");
  const { data: defaultGroup, error: groupError } = await supabase
    .from("groups")
    .select("id")
    .eq("is_default", true)
    .single();

  if (groupError) {
    console.warn(`  Warning: Could not find default group: ${groupError.message}`);
  } else if (defaultGroup) {
    const userGroups = profiles.map((p) => ({
      user_id: p.id,
      group_id: defaultGroup.id,
    }));

    const { error: ugError } = await supabase.from("user_groups").upsert(userGroups);
    if (ugError) {
      console.warn(`  Warning: Failed to assign users to group: ${ugError.message}`);
    } else {
      console.log(`  ✓ Assigned 5 users to default group (${defaultGroup.id})`);
    }
  }

  console.log("  ✓ Created 5 users with profiles");
}

// Run the seeding
seedUsers().catch((error) => {
  console.error("\n❌ Fatal error:", error);
  process.exit(1);
});
