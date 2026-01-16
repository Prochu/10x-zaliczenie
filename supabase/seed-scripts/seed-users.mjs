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
  const users = [
    {
      id: "57e03949-57b7-41e4-8b55-a6c6caf1cd98",
      email: "alice@test.com",
      password: "password123",
      email_confirm: true,
    },
    {
      id: "67e03949-57b7-41e4-8b55-a6c6caf1cd99",
      email: "bob@test.com",
      password: "password123",
      email_confirm: true,
    },
    {
      id: "77e03949-57b7-41e4-8b55-a6c6caf1cd9a",
      email: "charlie@test.com",
      password: "password123",
      email_confirm: true,
    },
    {
      id: "87e03949-57b7-41e4-8b55-a6c6caf1cd9b",
      email: "diana@test.com",
      password: "password123",
      email_confirm: true,
    },
    {
      id: "97e03949-57b7-41e4-8b55-a6c6caf1cd9c",
      email: "eve@test.com",
      password: "password123",
      email_confirm: true,
    },
  ];

  // Create auth users using admin API
  for (const user of users) {
    try {
      const { error } = await supabase.auth.admin.createUser({
        user_metadata: {},
        email: user.email,
        password: user.password,
        email_confirm: user.email_confirm,
        user_id: user.id,
      });

      // Handle different types of errors
      if (error) {
        if (error.message.includes("already registered") || error.message.includes("already exists")) {
          console.log(`  Note: User ${user.email} already exists, skipping creation`);
        } else {
          console.warn(`  Warning: Failed to create user ${user.email}: ${error.message}`);
          // Don't throw error - continue with other users
        }
      }
    } catch (error) {
      console.warn(`  Warning: Exception creating user ${user.email}: ${error.message}`);
      // Don't throw error - continue with other users
    }
  }

  // Then create profiles
  const profiles = [
    {
      id: "57e03949-57b7-41e4-8b55-a6c6caf1cd98",
      user_id: "57e03949-57b7-41e4-8b55-a6c6caf1cd98",
      nickname: "Alice",
      is_admin: false,
    },
    {
      id: "67e03949-57b7-41e4-8b55-a6c6caf1cd99",
      user_id: "67e03949-57b7-41e4-8b55-a6c6caf1cd99",
      nickname: "Bob",
      is_admin: false,
    },
    {
      id: "77e03949-57b7-41e4-8b55-a6c6caf1cd9a",
      user_id: "77e03949-57b7-41e4-8b55-a6c6caf1cd9a",
      nickname: "Charlie",
      is_admin: false,
    },
    {
      id: "87e03949-57b7-41e4-8b55-a6c6caf1cd9b",
      user_id: "87e03949-57b7-41e4-8b55-a6c6caf1cd9b",
      nickname: "Diana",
      is_admin: false,
    },
    {
      id: "97e03949-57b7-41e4-8b55-a6c6caf1cd9c",
      user_id: "97e03949-57b7-41e4-8b55-a6c6caf1cd9c",
      nickname: "Eve",
      is_admin: false,
    },
  ];

  const { error } = await supabase.from("profiles").upsert(profiles);
  if (error) throw new Error(`Failed to insert profiles: ${error.message}`);

  console.log("  ✓ Created 5 users with profiles");
}

// Run the seeding
seedUsers().catch((error) => {
  console.error("\n❌ Fatal error:", error);
  process.exit(1);
});
