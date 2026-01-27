import React from "react";
import { MatchCard } from "./MatchCard";
import { EmptyState } from "./EmptyState";
import type { MatchListItemDto } from "../types";

interface MatchListProps {
  matches?: MatchListItemDto[];
  isLoading?: boolean;
  onBetSaved?: () => void;
}

export const MatchList: React.FC<MatchListProps> = ({ matches = [], isLoading = false, onBetSaved }) => {
  if (isLoading) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Loading skeleton cards */}
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="h-64 bg-muted rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  if (matches.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {matches.map((match) => (
        <MatchCard key={match.id} match={match} onBetSaved={onBetSaved} />
      ))}
    </div>
  );
};
