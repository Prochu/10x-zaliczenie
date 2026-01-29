import React, { useState } from "react";
import { Button } from "./ui/button";
import { MatchSummary } from "./MatchSummary";
import { UserPredictionDisplay } from "./UserPredictionDisplay";
import { PointsBadge } from "./PointsBadge";
import type { MatchHistoryItemViewModel } from "./hooks/useMatchHistory";

interface MatchHistoryItemProps {
  match: MatchHistoryItemViewModel;
  expanded?: boolean;
  onToggle?: () => void;
}

const MatchHistoryItem: React.FC<MatchHistoryItemProps> = ({ match, expanded: initialExpanded = false, onToggle }) => {
  const [expanded, setExpanded] = useState(initialExpanded);

  const handleToggle = () => {
    const newExpanded = !expanded;
    setExpanded(newExpanded);
    onToggle?.();
  };

  return (
    <div className="bg-background/40 backdrop-blur-md rounded-xl border border-white/10 shadow-lg overflow-hidden transition-all hover:shadow-xl hover:border-white/20">
      <div className="p-4 md:p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <MatchSummary match={match} />
          </div>

          <div className="flex items-center space-x-3 ml-4">
            <PointsBadge points={match.pointsAwarded} matchStatus={match.matchStatus} />

            {/* Mobile expand/collapse button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleToggle}
              className="md:hidden transition-transform hover:scale-110"
              aria-label={expanded ? "Collapse details" : "Expand details"}
            >
              <svg
                className={`w-4 h-4 transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </Button>
          </div>
        </div>
      </div>

      {/* Desktop view - always show prediction details */}
      <div className="hidden md:block transition-all px-6 pb-6 pt-0">
        <UserPredictionDisplay
          prediction={{
            homeScore: match.userHomePrediction,
            awayScore: match.userAwayPrediction,
            hasBet: match.hasBet,
          }}
          match={match}
        />
      </div>

      {/* Mobile view - expandable prediction details */}
      {expanded && (
        <div className="md:hidden animate-in slide-in-from-top duration-200 px-4 pb-4 pt-0 border-t border-white/5">
          <UserPredictionDisplay
            prediction={{
              homeScore: match.userHomePrediction,
              awayScore: match.userAwayPrediction,
              hasBet: match.hasBet,
            }}
            match={match}
          />
        </div>
      )}
    </div>
  );
};

export default MatchHistoryItem;
