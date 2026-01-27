import React from "react";
import { useLeaderboard } from "./hooks/useLeaderboard";
import { LeaderboardTable } from "./LeaderboardTable";
import { LeaderboardPagination } from "./LeaderboardPagination";
import type { MeDto } from "../types";

interface LeaderboardContainerProps {
  currentUser: MeDto;
}

export const LeaderboardContainer: React.FC<LeaderboardContainerProps> = ({ currentUser }) => {
  const { items, total, currentPage, pageSize, isLoading, error, setPage, refresh } = useLeaderboard();

  const handlePageChange = (page: number) => {
    const totalPages = Math.ceil(total / pageSize);
    if (page >= 1 && page <= totalPages) {
      setPage(page);
    }
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="text-destructive mb-4">
          <p className="text-lg font-medium">Failed to load leaderboard</p>
          <p className="text-sm text-muted-foreground">{error}</p>
        </div>
        <button
          onClick={refresh}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Leaderboard</h2>
        <p className="text-muted-foreground">Compete with other players and climb the rankings!</p>
      </div>

      {isLoading && items.length === 0 ? (
        <div className="flex justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading leaderboard...</p>
          </div>
        </div>
      ) : (
        <>
          <LeaderboardTable entries={items} currentUserId={currentUser.id} />

          <LeaderboardPagination
            currentPage={currentPage}
            totalItems={total}
            pageSize={pageSize}
            onPageChange={handlePageChange}
          />
        </>
      )}
    </div>
  );
};

export default LeaderboardContainer;
