import React from "react";
import type { MeDto } from "../types";
import { useMatchHistory } from "./hooks/useMatchHistory";
import MatchHistoryHeader from "./MatchHistoryHeader";
import MatchHistoryList from "./MatchHistoryList";
import { EmptyState } from "./EmptyState";

interface MatchHistoryPageProps {
  currentUser: MeDto;
}

const MatchHistoryPage: React.FC<MatchHistoryPageProps> = () => {
  const matchHistory = useMatchHistory();

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight">Match History</h1>
        <p className="text-muted-foreground mt-2">Review your past predictions and see how you performed</p>
      </div>

      <MatchHistoryHeader filters={matchHistory.filters} onFiltersChange={matchHistory.updateFilters} />

      <MatchHistoryList
        items={matchHistory.items}
        hasMore={matchHistory.hasMore}
        isLoadingMore={matchHistory.isLoading}
        onLoadMore={matchHistory.loadMore}
      />

      {!matchHistory.isLoading && matchHistory.items.length === 0 && (
        <EmptyState
          message="No match history available"
          description="You haven't placed any bets yet. Start betting on upcoming matches to see your history here."
        />
      )}

      {matchHistory.error && (
        <div className="text-center py-8">
          <p className="text-destructive">{matchHistory.error}</p>
          <button
            onClick={matchHistory.refreshData}
            className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            Try Again
          </button>
        </div>
      )}
    </div>
  );
};

export default MatchHistoryPage;
