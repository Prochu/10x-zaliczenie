import React from "react";
import type { MatchStatus } from "../types";

interface ScoreDisplayProps {
  homeScore: number | null;
  awayScore: number | null;
  status: MatchStatus;
}

export const ScoreDisplay: React.FC<ScoreDisplayProps> = ({
  homeScore,
  awayScore,
  status,
}) => {
  // Only show scores for live or finished matches
  if (status !== "live" && status !== "finished") {
    return <span className="text-2xl font-bold text-muted-foreground">-</span>;
  }

  return (
    <div className="flex items-center space-x-2">
      <span className="text-2xl font-bold">
        {homeScore ?? 0}
      </span>
      <span className="text-muted-foreground">-</span>
      <span className="text-2xl font-bold">
        {awayScore ?? 0}
      </span>
    </div>
  );
};
