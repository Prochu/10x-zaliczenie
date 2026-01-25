import React from "react";

interface TeamScoreDisplayProps {
  homeTeam: {
    name: string;
    logo?: string;
  };
  awayTeam: {
    name: string;
    logo?: string;
  };
  score?: {
    home: number;
    away: number;
  };
  className?: string;
}

export const TeamScoreDisplay: React.FC<TeamScoreDisplayProps> = ({ homeTeam, awayTeam, score, className = "" }) => {
  return (
    <div className={`flex items-center justify-between ${className}`}>
      {/* Home Team */}
      <div className="flex items-center space-x-3 flex-1 min-w-0">
        {homeTeam.logo && (
          <img src={homeTeam.logo} alt={homeTeam.name} className="w-6 h-6 object-contain flex-shrink-0" />
        )}
        <span className="font-medium truncate text-sm">{homeTeam.name}</span>
      </div>

      {/* Score */}
      {score && (
        <div className="flex items-center space-x-2 px-3">
          <span className="text-lg font-bold text-foreground">{score.home}</span>
          <span className="text-muted-foreground">-</span>
          <span className="text-lg font-bold text-foreground">{score.away}</span>
        </div>
      )}

      {/* Away Team */}
      <div className="flex items-center space-x-3 flex-1 justify-end min-w-0">
        <span className="font-medium truncate text-sm text-right">{awayTeam.name}</span>
        {awayTeam.logo && (
          <img src={awayTeam.logo} alt={awayTeam.name} className="w-6 h-6 object-contain flex-shrink-0" />
        )}
      </div>
    </div>
  );
};

