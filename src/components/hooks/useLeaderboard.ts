import { useState, useEffect, useCallback } from "react";
import type { LeaderboardEntryDto, LeaderboardResponse } from "../../types";

interface UseLeaderboardReturn {
  items: LeaderboardEntryDto[];
  total: number;
  currentPage: number;
  pageSize: number;
  isLoading: boolean;
  error: string | null;
  setPage: (page: number) => void;
  refresh: () => Promise<void>;
}

export const useLeaderboard = (): UseLeaderboardReturn => {
  const [items, setItems] = useState<LeaderboardEntryDto[]>([]);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(50); // Default page size as per plan
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLeaderboard = useCallback(
    async (page: number = currentPage) => {
      try {
        setError(null);
        const params = new URLSearchParams({
          page: page.toString(),
          pageSize: pageSize.toString(),
          sort: "points_desc",
        });

        const response = await fetch(`/api/leaderboard?${params}`);

        if (!response.ok) {
          throw new Error(`Failed to fetch leaderboard: ${response.status}`);
        }

        const data: LeaderboardResponse = await response.json();
        setItems(data.items);
        setTotal(data.total);
        setCurrentPage(data.page);
      } catch (err) {
        console.error("Error fetching leaderboard:", err);
        setError(err instanceof Error ? err.message : "Failed to fetch leaderboard");
      } finally {
        setIsLoading(false);
      }
    },
    [currentPage, pageSize]
  );

  const setPage = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    await fetchLeaderboard(currentPage);
  }, [fetchLeaderboard, currentPage]);

  useEffect(() => {
    // Initial fetch
    fetchLeaderboard(currentPage);
  }, [currentPage, fetchLeaderboard]);

  useEffect(() => {
    // Set up polling every 5 minutes (300,000 ms)
    const intervalId = setInterval(() => {
      fetchLeaderboard(currentPage);
    }, 300000);

    // Cleanup interval on unmount
    return () => clearInterval(intervalId);
  }, [fetchLeaderboard, currentPage]);

  return {
    items,
    total,
    currentPage,
    pageSize,
    isLoading,
    error,
    setPage,
    refresh,
  };
};
