import React from "react";
import { TeamScoreDisplay } from "./TeamScoreDisplay";
import type { MatchHistoryItemViewModel } from "./hooks/useMatchHistory";

interface MatchSummaryProps {
  match: Pick<
    MatchHistoryItemViewModel,
    | "homeTeamName"
    | "awayTeamName"
    | "homeTeamLogo"
    | "awayTeamLogo"
    | "finalHomeScore"
    | "finalAwayScore"
    | "kickoffTime"
  >;
}

export const MatchSummary: React.FC<MatchSummaryProps> = ({ match }) => {
  const formatDateTime = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const score =
    match.finalHomeScore !== undefined && match.finalAwayScore !== undefined
      ? { home: match.finalHomeScore, away: match.finalAwayScore }
      : undefined;

  return (
    <div className="space-y-3">
      {/* Match Date and Time */}
      <div className="text-sm text-muted-foreground">{formatDateTime(match.kickoffTime)}</div>

      {/* Teams and Final Score */}
      <TeamScoreDisplay
        homeTeam={{
          name: match.homeTeamName,
          logo: match.homeTeamLogo,
        }}
        awayTeam={{
          name: match.awayTeamName,
          logo: match.awayTeamLogo,
        }}
        score={score}
        className="py-2"
      />
    </div>
  );
};

