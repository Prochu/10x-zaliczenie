import React from "react";
import { Badge } from "./ui/badge";

interface PointsBadgeProps {
  points: number | null | undefined;
  matchStatus?: string;
  className?: string;
}

export const PointsBadge: React.FC<PointsBadgeProps> = ({ points, matchStatus, className = "" }) => {
  // Handle cancelled or postponed matches
  if (matchStatus === "cancelled") {
    return (
      <Badge
        variant="outline"
        className={`text-xs font-semibold bg-gray-100 text-gray-700 border-gray-300 ${className}`}
      >
        Cancelled
      </Badge>
    );
  }

  if (matchStatus === "postponed") {
    return (
      <Badge
        variant="outline"
        className={`text-xs font-semibold bg-yellow-100 text-yellow-700 border-yellow-300 ${className}`}
      >
        Postponed
      </Badge>
    );
  }

  // No prediction made
  if (points === null || points === undefined) {
    return (
      <Badge variant="secondary" className={`text-xs ${className}`}>
        No Bet
      </Badge>
    );
  }

  let variant: "default" | "secondary" | "destructive" | "outline" = "secondary";
  let colorClass = "";
  let label = "";

  // Determine styling based on points awarded
  if (points === 4) {
    // Exact score match - High contrast (Green/Gold)
    variant = "default";
    colorClass = "bg-green-600 text-white border-green-700";
    label = "4 pts - Exact";
  } else if (points === 2) {
    // Correct outcome + goal difference - Medium contrast (Blue/Silver)
    variant = "default";
    colorClass = "bg-blue-500 text-white border-blue-600";
    label = "2 pts - Close";
  } else if (points === 1) {
    // Correct outcome only - Low contrast (Gray/Bronze)
    variant = "secondary";
    colorClass = "bg-amber-600 text-white border-amber-700";
    label = "1 pt - Outcome";
  } else if (points === 0) {
    // Incorrect prediction - Muted/Red
    variant = "destructive";
    colorClass = "bg-red-100 text-red-700 border-red-200";
    label = "0 pts";
  } else {
    // Fallback for any other point values (shouldn't happen in standard scoring)
    variant = "outline";
    colorClass = "text-foreground";
    label = `${points} pts`;
  }

  return (
    <Badge variant={variant} className={`text-xs font-semibold ${colorClass} ${className}`}>
      {label}
    </Badge>
  );
};
