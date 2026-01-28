import React from "react";
import { TableRow, TableCell } from "./ui/table";
import type { LeaderboardEntryDto } from "../types";

interface LeaderboardRowProps {
  entry: LeaderboardEntryDto;
  isCurrentUser: boolean;
  compact?: boolean;
}

export const LeaderboardRow: React.FC<LeaderboardRowProps> = ({ entry, isCurrentUser, compact = false }) => {
  return (
    <TableRow className={isCurrentUser ? "bg-blue-50 dark:bg-blue-950" : ""}>
      <TableCell className={`font-medium ${compact ? "px-2" : ""}`}>{entry.rank}</TableCell>
      <TableCell className={compact ? "px-2" : ""}>{entry.nickname}</TableCell>
      <TableCell className={`text-right font-semibold ${compact ? "px-2" : ""}`}>{entry.totalPoints}</TableCell>
      {!compact && <TableCell className="text-right">{entry.matchesBet}</TableCell>}
    </TableRow>
  );
};
