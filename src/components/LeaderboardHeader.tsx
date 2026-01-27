import React from "react";

interface LeaderboardHeaderProps {
  totalPlayers?: number;
  lastUpdated?: Date;
}

export const LeaderboardHeader: React.FC<LeaderboardHeaderProps> = ({ totalPlayers, lastUpdated }) => {
  const formatLastUpdated = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }).format(date);
  };

  return (
    <header className="mb-8">
      <h1 className="text-3xl font-bold text-foreground mb-2">Champions League Leaderboard</h1>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        {totalPlayers && (
          <p className="text-sm text-muted-foreground">{totalPlayers.toLocaleString()} players competing</p>
        )}
        {lastUpdated && <p className="text-sm text-muted-foreground">Last updated: {formatLastUpdated(lastUpdated)}</p>}
      </div>
    </header>
  );
};

export default LeaderboardHeader;
