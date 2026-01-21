import { useState, useEffect, useCallback } from "react";
import type { MatchHistoryResponse, MatchHistoryItemDto } from "../../types";

// ViewModel types for the frontend
export interface MatchHistoryFiltersViewModel {
  from?: Date;
  to?: Date;
  sortOrder: "asc" | "desc";
  pageSize: number;
}

export interface MatchHistoryItemViewModel {
  id: string;
  homeTeamName: string;
  awayTeamName: string;
  homeTeamLogo?: string;
  awayTeamLogo?: string;
  finalHomeScore?: number;
  finalAwayScore?: number;
  kickoffTime: Date;
  userHomePrediction?: number;
  userAwayPrediction?: number;
  pointsAwarded?: number;
  hasBet: boolean;
  matchStatus: string;
}

export interface MatchHistoryViewModel {
  items: MatchHistoryItemViewModel[];
  isLoading: boolean;
  error?: string;
  hasMore: boolean;
  currentPage: number;
  totalItems: number;
  filters: MatchHistoryFiltersViewModel;
}

interface UseMatchHistoryReturn extends MatchHistoryViewModel {
  loadInitialData: () => Promise<void>;
  loadMore: () => Promise<void>;
  refreshData: () => Promise<void>;
  updateFilters: (filters: MatchHistoryFiltersViewModel) => Promise<void>;
}

/**
 * Custom hook for managing match history data fetching and state
 */
export function useMatchHistory(): UseMatchHistoryReturn {
  const [state, setState] = useState<MatchHistoryViewModel>({
    items: [],
    isLoading: false,
    error: undefined,
    hasMore: false,
    currentPage: 1,
    totalItems: 0,
    filters: {
      sortOrder: "desc",
      pageSize: 20,
    },
  });

  /**
   * Transforms DTO to ViewModel
   */
  const transformDtoToViewModel = useCallback((dto: MatchHistoryItemDto): MatchHistoryItemViewModel => {
    return {
      id: dto.match.id,
      homeTeamName: dto.match.homeTeamName,
      awayTeamName: dto.match.awayTeamName,
      homeTeamLogo: dto.match.homeTeamLogo || undefined,
      awayTeamLogo: dto.match.awayTeamLogo || undefined,
      finalHomeScore: dto.match.homeTeamScore ?? undefined,
      finalAwayScore: dto.match.awayTeamScore ?? undefined,
      kickoffTime: new Date(dto.match.kickoffTime),
      userHomePrediction: dto.bet?.homeScore ?? undefined,
      userAwayPrediction: dto.bet?.awayScore ?? undefined,
      pointsAwarded: dto.pointsAwarded ?? undefined,
      hasBet: !!dto.bet,
      matchStatus: dto.match.status,
    };
  }, []);

  /**
   * Builds query parameters for API call
   */
  const buildQueryParams = useCallback((page: number, filters: MatchHistoryFiltersViewModel) => {
    const params = new URLSearchParams();
    params.append("page", page.toString());
    params.append("pageSize", filters.pageSize.toString());
    params.append("order", filters.sortOrder);

    if (filters.from) {
      params.append("from", filters.from.toISOString());
    }
    if (filters.to) {
      params.append("to", filters.to.toISOString());
    }

    return params.toString();
  }, []);

  /**
   * Fetches data from API
   */
  const fetchData = useCallback(
    async (page: number, filters: MatchHistoryFiltersViewModel, append: boolean = false): Promise<void> => {
      try {
        setState((prev) => ({
          ...prev,
          isLoading: !append,
          error: undefined,
        }));

        const queryParams = buildQueryParams(page, filters);
        const response = await fetch(`/api/matches/history?${queryParams}`);

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || `HTTP ${response.status}`);
        }

        const data: MatchHistoryResponse = await response.json();

        setState((prev) => {
          const newItems = append
            ? [...prev.items, ...data.items.map(transformDtoToViewModel)]
            : data.items.map(transformDtoToViewModel);

          return {
            ...prev,
            items: newItems,
            isLoading: false,
            hasMore: newItems.length < data.total,
            currentPage: page,
            totalItems: data.total,
            filters,
          };
        });
      } catch (error) {
        console.error("Error fetching match history:", error);
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: error instanceof Error ? error.message : "An unexpected error occurred",
        }));
      }
    },
    [buildQueryParams, transformDtoToViewModel]
  );

  /**
   * Loads initial data (first page)
   */
  const loadInitialData = useCallback(async (): Promise<void> => {
    await fetchData(1, state.filters, false);
  }, [fetchData, state.filters]);

  /**
   * Loads more data (next page) for infinite scroll
   */
  const loadMore = useCallback(async (): Promise<void> => {
    if (state.isLoading || !state.hasMore) return;

    const nextPage = state.currentPage + 1;
    await fetchData(nextPage, state.filters, true);
  }, [fetchData, state.isLoading, state.hasMore, state.currentPage, state.filters]);

  /**
   * Refreshes current data
   */
  const refreshData = useCallback(async (): Promise<void> => {
    await fetchData(1, state.filters, false);
  }, [fetchData, state.filters]);

  /**
   * Updates filters and reloads data
   */
  const updateFilters = useCallback(
    async (filters: MatchHistoryFiltersViewModel): Promise<void> => {
      await fetchData(1, filters, false);
    },
    [fetchData]
  );

  // Load initial data on mount
  useEffect(() => {
    loadInitialData();
  }, []); // Empty dependency array - only run once on mount

  return {
    ...state,
    loadInitialData,
    loadMore,
    refreshData,
    updateFilters,
  };
}
