import { useState, useEffect, useCallback } from "react";
import type { MatchListItemDto, MatchListResponse } from "../../types";

interface UseMatchesReturn {
  matches: MatchListItemDto[];
  isLoading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  refetch: () => Promise<void>;
}

export const useMatches = (): UseMatchesReturn => {
  const [matches, setMatches] = useState<MatchListItemDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchMatches = useCallback(async () => {
    try {
      setError(null);
      const response = await fetch("/api/upcomingmatches?sort=kickoff_time.asc");

      if (!response.ok) {
        throw new Error(`Failed to fetch matches: ${response.status}`);
      }

      const data: MatchListResponse = await response.json();
      setMatches(data.items);
      setLastUpdated(new Date());
    } catch (err) {
      console.error("Error fetching matches:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch matches");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refetch = useCallback(async () => {
    setIsLoading(true);
    await fetchMatches();
  }, [fetchMatches]);

  useEffect(() => {
    // Initial fetch
    fetchMatches();

    // Set up polling every 5 minutes (300,000 ms)
    const intervalId = setInterval(fetchMatches, 300000);

    // Cleanup interval on unmount
    return () => clearInterval(intervalId);
  }, [fetchMatches]);

  return {
    matches,
    isLoading,
    error,
    lastUpdated,
    refetch,
  };
};
