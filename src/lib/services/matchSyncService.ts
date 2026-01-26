import type { SupabaseClient } from "../../db/supabase.client";
import { FootballApiService, type FootballApiFixture } from "./footballApi";
import { updateMatchBetsPoints } from "./scoringService";
import type { Database } from "../../db/database.types";

type MatchStatus = Database["public"]["Enums"]["match_status"];

export class MatchSyncService {
  constructor(
    private supabase: SupabaseClient,
    private footballApi: FootballApiService
  ) {}

  /**
   * Daily sync: Fetches all fixtures for the season and updates the DB.
   */
  async syncAllFixtures(): Promise<{ synced: number; updated: number }> {
    const fixtures = await this.footballApi.getFixtures();
    let synced = 0;
    let updated = 0;

    for (const fixture of fixtures) {
      const status = this.mapApiStatus(fixture.fixture.status.short);
      
      const { data: existing } = await this.supabase
        .from("matches")
        .select("id, status")
        .eq("api_match_id", fixture.fixture.id.toString())
        .single();

      const matchData = {
        api_match_id: fixture.fixture.id.toString(),
        home_team_api_id: fixture.teams.home.id.toString(),
        home_team_name: fixture.teams.home.name,
        home_team_logo: fixture.teams.home.logo,
        away_team_api_id: fixture.teams.away.id.toString(),
        away_team_name: fixture.teams.away.name,
        away_team_logo: fixture.teams.away.logo,
        home_team_score: fixture.goals.home,
        away_team_score: fixture.goals.away,
        kickoff_time: fixture.fixture.date,
        status: status,
        updated_at: new Date().toISOString(),
      };

      const { error } = await this.supabase
        .from("matches")
        .upsert(matchData, { onConflict: "api_match_id" });

      if (error) {
        console.error(`Failed to sync match ${fixture.fixture.id}:`, error.message);
        continue;
      }

      if (existing) {
        updated++;
        // If match just finished, trigger scoring
        if (existing.status !== "finished" && status === "finished") {
          await updateMatchBetsPoints(
            this.supabase,
            existing.id,
            fixture.goals.home ?? 0,
            fixture.goals.away ?? 0
          );
        }
      } else {
        synced++;
      }
    }

    return { synced, updated };
  }

  /**
   * Live sync: Fetches currently live matches and updates scores/status.
   */
  async syncLiveMatches(): Promise<{ updated: number }> {
    const liveFixtures = await this.footballApi.getLiveFixtures();
    let updated = 0;

    for (const fixture of liveFixtures) {
      const { data: match } = await this.supabase
        .from("matches")
        .select("id, status")
        .eq("api_match_id", fixture.fixture.id.toString())
        .single();

      if (!match) continue;

      const status = this.mapApiStatus(fixture.fixture.status.short);

      const { error } = await this.supabase
        .from("matches")
        .update({
          home_team_score: fixture.goals.home,
          away_team_score: fixture.goals.away,
          status: status,
          updated_at: new Date().toISOString(),
        })
        .eq("id", match.id);

      if (!error) {
        updated++;
        // Recalculate points for live updates (PRD R-011)
        await updateMatchBetsPoints(
          this.supabase,
          match.id,
          fixture.goals.home ?? 0,
          fixture.goals.away ?? 0
        );
      }
    }

    return { updated };
  }

  private mapApiStatus(apiStatus: string): MatchStatus {
    switch (apiStatus) {
      case "NS": // Not Started
      case "TBD":
        return "scheduled";
      case "1H": // First Half
      case "HT": // Halftime
      case "2H": // Second Half
      case "ET": // Extra Time
      case "P": // Penalty
      case "LIVE":
        return "live";
      case "FT": // Finished
      case "AET": // After Extra Time
      case "PEN": // After Penalty
        return "finished";
      case "CANCL":
        return "cancelled";
      case "PST":
        return "postponed";
      default:
        return "scheduled";
    }
  }
}
