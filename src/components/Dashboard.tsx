import React from "react";
import { DashboardHeader } from "./DashboardHeader";
import { MatchList } from "./MatchList";
import { useMatches } from "./hooks/useMatches";

const Dashboard: React.FC = () => {
  const { matches, isLoading, error, lastUpdated, refetch } = useMatches();

  return (
    <div className="container mx-auto px-4 py-8">
      <DashboardHeader lastUpdated={lastUpdated || undefined} />
      {error && (
        <div className="mb-4 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
          <p className="text-destructive text-sm">{error}</p>
        </div>
      )}
      <MatchList matches={matches} isLoading={isLoading} onBetSaved={refetch} />
    </div>
  );
};

export default Dashboard;
