import React from "react";
import { DashboardHeader } from "./DashboardHeader";
import { MatchList } from "./MatchList";
import { useMatches } from "./hooks/useMatches";
import LeaderboardContainer from "./LeaderboardContainer";
import type { MeDto } from "../types";

interface DashboardProps {
  user?: MeDto;
}

const DashboardComponent: React.FC<DashboardProps> = ({ user }) => {
  const { matches, isLoading, error, lastUpdated, refetch } = useMatches();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left column: Leaderboard */}
        <div className="lg:col-span-4 xl:col-span-3">
          <div className="lg:sticky lg:top-1/2 lg:-translate-y-1/2 bg-background/40 backdrop-blur-md p-4 rounded-xl border border-white/10 shadow-lg">
            {user && <LeaderboardContainer currentUser={user} compact={true} />}
          </div>
        </div>

        {/* Right column: Matches */}
        <div className="lg:col-span-8 xl:col-span-9">
          <div className="bg-background/40 backdrop-blur-md p-6 rounded-xl border border-white/10 shadow-lg mb-8">
            <DashboardHeader lastUpdated={lastUpdated || undefined} />
          </div>
          
          {error && (
            <div className="mb-4 p-4 bg-destructive/10 border border-destructive/20 rounded-lg backdrop-blur-sm">
              <p className="text-destructive text-sm">{error}</p>
            </div>
          )}
          
          <MatchList matches={matches} isLoading={isLoading} onBetSaved={refetch} />
        </div>
      </div>
    </div>
  );
};

export default DashboardComponent;
