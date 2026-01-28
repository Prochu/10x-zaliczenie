import { describe, it, expect, vi, beforeEach } from "vitest";
import { upsertUserBet, MatchNotFoundError, BetLockedError } from "./bets";

describe("bets service", () => {
  const mockSupabase = {
    from: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn().mockReturnThis(),
    upsert: vi.fn().mockReturnThis(),
  } as any;

  const userId = "user-123";
  const matchId = "match-456";
  const homeScore = 2;
  const awayScore = 1;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("upsertUserBet", () => {
    it("should successfully upsert a bet when match is scheduled and deadline hasn't passed", async () => {
      const kickoffTime = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 mins in future
      const now = new Date();

      // Mock match fetch
      mockSupabase.single.mockResolvedValueOnce({
        data: { id: matchId, kickoff_time: kickoffTime, status: "scheduled" },
        error: null,
      });

      // Mock bet upsert
      const mockBet = {
        id: "bet-789",
        match_id: matchId,
        home_score: homeScore,
        away_score: awayScore,
        points_awarded: null,
        created_at: now.toISOString(),
        updated_at: now.toISOString(),
      };
      mockSupabase.single.mockResolvedValueOnce({
        data: mockBet,
        error: null,
      });

      const result = await upsertUserBet({
        supabase: mockSupabase,
        userId,
        matchId,
        homeScore,
        awayScore,
        now,
      });

      expect(result).toEqual({
        id: mockBet.id,
        matchId: mockBet.match_id,
        homeScore: mockBet.home_score,
        awayScore: mockBet.away_score,
        pointsAwarded: mockBet.points_awarded,
        createdAt: mockBet.created_at,
        updatedAt: mockBet.updated_at,
      });
      expect(mockSupabase.from).toHaveBeenCalledWith("matches");
      expect(mockSupabase.from).toHaveBeenCalledWith("bets");
    });

    it("should throw MatchNotFoundError if match does not exist", async () => {
      mockSupabase.single.mockResolvedValueOnce({
        data: null,
        error: { message: "Not found" },
      });

      await expect(
        upsertUserBet({
          supabase: mockSupabase,
          userId,
          matchId,
          homeScore,
          awayScore,
        })
      ).rejects.toThrow(MatchNotFoundError);
    });

    it("should throw BetLockedError if match status is finished", async () => {
      mockSupabase.single.mockResolvedValueOnce({
        data: { id: matchId, kickoff_time: new Date().toISOString(), status: "finished" },
        error: null,
      });

      await expect(
        upsertUserBet({
          supabase: mockSupabase,
          userId,
          matchId,
          homeScore,
          awayScore,
        })
      ).rejects.toThrow(BetLockedError);
      expect(mockSupabase.upsert).not.toHaveBeenCalled();
    });

    it("should throw BetLockedError if betting deadline (5 mins before kickoff) has passed", async () => {
      const kickoffTime = new Date(Date.now() + 2 * 60 * 1000).toISOString(); // 2 mins in future (deadline passed)
      const now = new Date();

      mockSupabase.single.mockResolvedValueOnce({
        data: { id: matchId, kickoff_time: kickoffTime, status: "scheduled" },
        error: null,
      });

      await expect(
        upsertUserBet({
          supabase: mockSupabase,
          userId,
          matchId,
          homeScore,
          awayScore,
          now,
        })
      ).rejects.toThrow(BetLockedError);
      expect(mockSupabase.upsert).not.toHaveBeenCalled();
    });

    it("should throw error if bet upsert fails", async () => {
      const kickoffTime = new Date(Date.now() + 10 * 60 * 1000).toISOString();
      
      mockSupabase.single.mockResolvedValueOnce({
        data: { id: matchId, kickoff_time: kickoffTime, status: "scheduled" },
        error: null,
      });

      mockSupabase.single.mockResolvedValueOnce({
        data: null,
        error: { message: "Database error" },
      });

      await expect(
        upsertUserBet({
          supabase: mockSupabase,
          userId,
          matchId,
          homeScore,
          awayScore,
        })
      ).rejects.toThrow("Failed to upsert bet: Database error");
    });
  });
});
