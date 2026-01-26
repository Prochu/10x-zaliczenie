import type { APIRoute } from "astro";
import { createClient } from "@supabase/supabase-js";
import { FootballApiService } from "../../../lib/services/footballApi";
import { MatchSyncService } from "../../../lib/services/matchSyncService";
import type { Database } from "../../../db/database.types";

export const prerender = false;

/**
 * POST /api/cron/sync
 * 
 * This endpoint is intended to be called by Supabase Cron.
 * It handles both daily full sync and 5-minute live updates.
 * 
 * Query params:
 * - type: "daily" | "live"
 * 
 * Security:
 * - Requires CRON_SECRET header to match environment variable.
 */
export const POST: APIRoute = async ({ request, url }) => {
  const authHeader = request.headers.get("Authorization");
  const cronSecret = import.meta.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  const syncType = url.searchParams.get("type") || "live";

  // Use Service Role Key for sync operations to bypass RLS
  const supabaseAdmin = createClient<Database>(
    import.meta.env.SUPABASE_URL,
    import.meta.env.SUPABASE_SERVICE_ROLE_KEY
  );

  const footballApi = new FootballApiService(import.meta.env.FOOTBALL_API_KEY);
  const syncService = new MatchSyncService(supabaseAdmin, footballApi);

  try {
    let result;
    if (syncType === "daily") {
      result = await syncService.syncAllFixtures();
    } else {
      result = await syncService.syncLiveMatches();
    }

    return new Response(JSON.stringify({ success: true, result }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error(`Sync failed (${syncType}):`, error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
