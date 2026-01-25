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
    "homeTeamName" | "awayTeamName" | "homeTeamLogo" | "awayTeamLogo" | "finalHomeScore" | "finalAwayScore" | "matchStatus"
  >;
}

export const UserPredictionDisplay: React.FC<UserPredictionDisplayProps> = ({ prediction, match }) => {
  // Handle cancelled or postponed matches
  if (match.matchStatus === "cancelled" || match.matchStatus === "postponed") {
    const statusText = match.matchStatus === "cancelled" ? "Match Cancelled" : "Match Postponed";
    const statusColor = match.matchStatus === "cancelled" ? "text-gray-600" : "text-yellow-600";
    
    return (
      <div className="text-center py-3">
        <span className={`text-sm font-medium ${statusColor}`}>
          {statusText} - {prediction.hasBet ? "Bet voided" : "No bet placed"}
        </span>
      </div>
    );
  }

  if (!prediction.hasBet) {
    return (
      <div className="text-center py-3">
        <span className="text-sm text-muted-foreground">No prediction made</span>
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
      <div className="text-xs text-muted-foreground font-medium">Your prediction:</div>

      <div className={`rounded-lg border p-3 transition-colors ${isCorrect ? "bg-green-50 border-green-200" : "bg-muted/30"}`}>
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
          <div className="mt-2 flex justify-center">
            {isCorrect ? (
              <span className="text-xs text-green-600 font-medium flex items-center">
                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                Correct prediction!
              </span>
            ) : (
              <span className="text-xs text-muted-foreground">
                Final: {finalScore.home} - {finalScore.away}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
