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
      <div className="text-sm text-foreground/70 font-medium flex items-center gap-2">
        <svg className="w-4 h-4 text-primary/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        {formatDateTime(match.kickoffTime)}
      </div>

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
