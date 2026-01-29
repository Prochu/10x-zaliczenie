import React from "react";
import type { MeDto } from "../types";
import { useMatchHistory } from "./hooks/useMatchHistory";
import MatchHistoryHeader from "./MatchHistoryHeader";
import MatchHistoryList from "./MatchHistoryList";
import { EmptyState } from "./EmptyState";
import { MatchHistorySkeleton } from "./MatchHistorySkeleton";
import LeaderboardContainer from "./LeaderboardContainer";

interface MatchHistoryPageProps {
  currentUser?: MeDto;
}

const MatchHistoryPage: React.FC<MatchHistoryPageProps> = ({ currentUser }) => {
  const matchHistory = useMatchHistory();

  return (
    <div className="container mx-auto px-4 py-8 min-h-[calc(100vh-4rem)] flex flex-col">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 flex-1">
        {/* Left column: Leaderboard */}
        <div className="lg:col-span-4 xl:col-span-3 relative">
          <div className="lg:sticky lg:top-1/2 lg:-translate-y-1/2 bg-background/40 backdrop-blur-md p-4 rounded-xl border border-white/10 shadow-lg">
            {currentUser && <LeaderboardContainer currentUser={currentUser} compact={true} />}
          </div>
        </div>

        {/* Right column: Match History */}
        <div className="lg:col-span-8 xl:col-span-9">
          <div className="bg-background/40 backdrop-blur-md p-6 rounded-xl border border-white/10 shadow-lg mb-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Match History</h1>
                <p className="text-foreground/70 mt-1">Review your past predictions and see how you performed</p>
              </div>
            </div>
          </div>

          <div className="bg-background/40 backdrop-blur-md p-6 rounded-xl border border-white/10 shadow-lg mb-8">
            <MatchHistoryHeader filters={matchHistory.filters} onFiltersChange={matchHistory.updateFilters} />
          </div>

          {/* Show skeleton during initial load */}
          {matchHistory.isLoading && matchHistory.items.length === 0 ? (
            <MatchHistorySkeleton count={5} />
          ) : (
            <>
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
            </>
          )}

          {matchHistory.error && (
            <div className="text-center py-8 bg-destructive/10 border border-destructive/20 rounded-xl backdrop-blur-sm mt-4">
              <p className="text-destructive font-medium">{matchHistory.error}</p>
              <button
                onClick={matchHistory.refreshData}
                className="mt-4 px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
              >
                Try Again
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MatchHistoryPage;
