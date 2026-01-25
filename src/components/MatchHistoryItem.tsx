import React, { useState } from "react";
import { Card, CardContent, CardHeader } from "./ui/card";
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
    <Card className="overflow-hidden transition-shadow hover:shadow-md">
      <CardHeader className="pb-3">
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
      </CardHeader>

      {/* Desktop view - always show prediction details */}
      <div className="hidden md:block transition-all">
        <CardContent className="pt-0">
          <UserPredictionDisplay
            prediction={{
              homeScore: match.userHomePrediction,
              awayScore: match.userAwayPrediction,
              hasBet: match.hasBet,
            }}
            match={match}
          />
        </CardContent>
      </div>

      {/* Mobile view - expandable prediction details */}
      {expanded && (
        <div className="md:hidden animate-in slide-in-from-top duration-200">
          <CardContent className="pt-0 border-t">
            <UserPredictionDisplay
              prediction={{
                homeScore: match.userHomePrediction,
                awayScore: match.userAwayPrediction,
                hasBet: match.hasBet,
              }}
              match={match}
            />
          </CardContent>
        </div>
      )}
    </Card>
  );
};

export default MatchHistoryItem;
