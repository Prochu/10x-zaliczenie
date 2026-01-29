import React from "react";
import { TeamScoreDisplay } from "./TeamScoreDisplay";
import type { MatchHistoryItemViewModel } from "./hooks/useMatchHistory";

interface UserPredictionDisplayProps {
  prediction: {
    homeScore?: number;
    awayScore?: number;
    hasBet: boolean;
  };
  match: Pick<
    MatchHistoryItemViewModel,
    | "homeTeamName"
    | "awayTeamName"
    | "homeTeamLogo"
    | "awayTeamLogo"
    | "finalHomeScore"
    | "finalAwayScore"
    | "matchStatus"
  >;
}

export const UserPredictionDisplay: React.FC<UserPredictionDisplayProps> = ({ prediction, match }) => {
  // Handle cancelled or postponed matches
  if (match.matchStatus === "cancelled" || match.matchStatus === "postponed") {
    const statusText = match.matchStatus === "cancelled" ? "Match Cancelled" : "Match Postponed";
    const statusColor = match.matchStatus === "cancelled" ? "text-destructive" : "text-yellow-500";

    return (
      <div className="text-center py-3">
        <span className={`text-sm font-bold ${statusColor}`}>
          {statusText} - {prediction.hasBet ? "Bet voided" : "No bet placed"}
        </span>
      </div>
    );
  }

  if (!prediction.hasBet) {
    return (
      <div className="text-center py-3">
        <span className="text-sm text-foreground/60 font-medium italic">No prediction made</span>
      </div>
    );
  }

  const userScore =
    prediction.homeScore !== undefined && prediction.awayScore !== undefined
      ? { home: prediction.homeScore, away: prediction.awayScore }
      : undefined;

  const finalScore =
    match.finalHomeScore !== undefined && match.finalAwayScore !== undefined
      ? { home: match.finalHomeScore, away: match.finalAwayScore }
      : undefined;

  // Determine if prediction was correct
  const isCorrect = finalScore && userScore && finalScore.home === userScore.home && finalScore.away === userScore.away;

  return (
    <div className="space-y-2">
      <div className="text-xs text-foreground/60 font-bold uppercase tracking-wider ml-1">Your prediction:</div>

      <div
        className={`rounded-xl border p-4 transition-colors ${isCorrect ? "bg-green-500/10 border-green-500/20" : "bg-white/5 border-white/10"}`}
      >
        <TeamScoreDisplay
          homeTeam={{
            name: match.homeTeamName,
            logo: match.homeTeamLogo,
          }}
          awayTeam={{
            name: match.awayTeamName,
            logo: match.awayTeamLogo,
          }}
          score={userScore}
        />

        {finalScore && userScore && (
          <div className="mt-3 flex justify-center border-t border-white/5 pt-3">
            {isCorrect ? (
              <span className="text-xs text-green-400 font-bold flex items-center bg-green-500/20 px-3 py-1 rounded-full">
                <svg className="w-3.5 h-3.5 mr-1.5" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                Correct prediction!
              </span>
            ) : (
              <span className="text-xs text-foreground/70 font-medium bg-white/5 px-3 py-1 rounded-full">
                Final Score:{" "}
                <span className="text-foreground font-bold">
                  {finalScore.home} - {finalScore.away}
                </span>
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
