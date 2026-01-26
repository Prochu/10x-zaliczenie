import type { APIRoute } from "astro";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "../../../db/database.types";

const supabaseUrl = import.meta.env.SUPABASE_URL;
const supabaseAnonKey = import.meta.env.SUPABASE_KEY;

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const { email, password, nickname } = await request.json();

    // Validate input
    if (!email || !password || !nickname) {
      return new Response(
        JSON.stringify({ error: "Email, password, and nickname are required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Validate nickname format
    if (nickname.length < 3 || nickname.length > 15) {
      return new Response(
        JSON.stringify({ error: "Nickname must be 3-15 characters" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    if (!/^[a-zA-Z0-9]+$/.test(nickname)) {
      return new Response(
        JSON.stringify({ error: "Nickname must be alphanumeric only" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Create Supabase client
    const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

    // Check if nickname already exists
    const { data: existingProfile } = await supabase
      .from("profiles")
      .select("id")
      .eq("nickname", nickname)
      .single();

    if (existingProfile) {
      return new Response(
        JSON.stringify({ error: "Nickname already taken" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Sign up with email and password
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (signUpError || !signUpData.user) {
      return new Response(
        JSON.stringify({ error: signUpError?.message || "Registration failed" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Create profile
    const { error: profileError } = await supabase.from("profiles").insert({
      user_id: signUpData.user.id,
      nickname,
      is_admin: false,
    });

    if (profileError) {
      // If profile creation fails, we should clean up the auth user
      // but for simplicity, we'll just return the error
      return new Response(
        JSON.stringify({ error: "Failed to create profile: " + profileError.message }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    // Get the created profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("id")
      .eq("user_id", signUpData.user.id)
      .single();

    if (!profile) {
      return new Response(
        JSON.stringify({ error: "Profile not found after creation" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    // Add user to default group
    const { data: defaultGroup } = await supabase
      .from("groups")
      .select("id")
      .eq("is_default", true)
      .single();

    if (defaultGroup) {
      await supabase.from("user_groups").insert({
        user_id: profile.id,
        group_id: defaultGroup.id,
      });
    }

    // If session is available, set cookies
    if (signUpData.session) {
      cookies.set("sb-access-token", signUpData.session.access_token, {
        path: "/",
        httpOnly: true,
        secure: import.meta.env.PROD,
        sameSite: "lax",
        maxAge: signUpData.session.expires_in,
      });

      cookies.set("sb-refresh-token", signUpData.session.refresh_token, {
        path: "/",
        httpOnly: true,
        secure: import.meta.env.PROD,
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7, // 7 days
      });
    }

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return new Response(
      JSON.stringify({ error: "An unexpected error occurred" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};
