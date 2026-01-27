import React, { useState } from "react";
import { Card, CardContent, CardHeader } from "./ui/card";
import { LiveBadge } from "./LiveBadge";
import { CountdownTimer } from "./CountdownTimer";
import { ScoreDisplay } from "./ScoreDisplay";
import { BettingForm } from "./BettingForm";
import { useCountdown } from "./hooks/useCountdown";
import { toast } from "sonner";
import type { MatchListItemDto } from "../types";

interface MatchCardProps {
  match: MatchListItemDto;
  onBetSaved?: () => void;
}

export const MatchCard: React.FC<MatchCardProps> = ({ match, onBetSaved }) => {
  const { isExpired } = useCountdown(match.bettingDeadline);

  const [bettingState, setBettingState] = useState({
    homeScore: match.userBet?.homeScore ?? 0,
    awayScore: match.userBet?.awayScore ?? 0,
    isDirty: false,
    isSaving: false,
  });

  const isBettingDisabled =
    isExpired || new Date() > new Date(match.bettingDeadline) || !["scheduled", "live"].includes(match.status);

  const handleBetChange = (homeScore: number, awayScore: number) => {
    setBettingState((prev) => ({
      ...prev,
      homeScore,
      awayScore,
      isDirty: true,
    }));
  };

  const handleBetSave = async () => {
    setBettingState((prev) => ({ ...prev, isSaving: true }));
    try {
      const response = await fetch(`/api/matches/${match.id}/bet`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          homeScore: bettingState.homeScore,
          awayScore: bettingState.awayScore,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to save bet: ${response.status}`);
      }

      setBettingState((prev) => ({ ...prev, isDirty: false }));
      
      // Notify parent to refresh data
      if (onBetSaved) {
        onBetSaved();
      }

      toast.success("Bet saved successfully!");
    } catch (error) {
      console.error("Error saving bet:", error);
      toast.error(error instanceof Error ? error.message : "Failed to save bet");
    } finally {
      setBettingState((prev) => ({ ...prev, isSaving: false }));
    }
  };

  const formatKickoffTime = (kickoffTime: string) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(kickoffTime));
  };

  return (
    <Card className="relative">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {match.status === "live" && <LiveBadge />}
            <span className="text-sm font-medium text-muted-foreground">{formatKickoffTime(match.kickoffTime)}</span>
          </div>
          {!isBettingDisabled && <CountdownTimer deadline={match.bettingDeadline} />}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Teams */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 flex-1">
            {match.homeTeamLogo ? (
              <img src={match.homeTeamLogo} alt={match.homeTeamName} className="w-8 h-8 object-contain" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                <span className="text-xs font-bold text-muted-foreground">
                  {match.homeTeamName.substring(0, 2).toUpperCase()}
                </span>
              </div>
            )}
            <span className="font-medium truncate">{match.homeTeamName}</span>
          </div>

          <ScoreDisplay homeScore={match.homeTeamScore} awayScore={match.awayTeamScore} status={match.status} />

          <div className="flex items-center space-x-3 flex-1 justify-end">
            <span className="font-medium truncate">{match.awayTeamName}</span>
            {match.awayTeamLogo ? (
              <img src={match.awayTeamLogo} alt={match.awayTeamName} className="w-8 h-8 object-contain" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                <span className="text-xs font-bold text-muted-foreground">
                  {match.awayTeamName.substring(0, 2).toUpperCase()}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Betting Form */}
        <BettingForm
          homeScore={bettingState.homeScore}
          awayScore={bettingState.awayScore}
          isDirty={bettingState.isDirty}
          isSaving={bettingState.isSaving}
          isDisabled={isBettingDisabled}
          onChange={handleBetChange}
          onSave={handleBetSave}
        />
      </CardContent>
    </Card>
  );
};
