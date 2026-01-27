import React from "react";
import { TableRow, TableCell } from "./ui/table";
import type { LeaderboardEntryDto } from "../types";

interface LeaderboardRowProps {
  entry: LeaderboardEntryDto;
  isCurrentUser: boolean;
}

export const LeaderboardRow: React.FC<LeaderboardRowProps> = ({ entry, isCurrentUser }) => {
  return (
    <TableRow className={isCurrentUser ? "bg-blue-50 dark:bg-blue-950" : ""}>
      <TableCell className="font-medium">{entry.rank}</TableCell>
      <TableCell>{entry.nickname}</TableCell>
      <TableCell className="text-right font-semibold">{entry.totalPoints}</TableCell>
      <TableCell className="text-right">{entry.matchesBet}</TableCell>
    </TableRow>
  );
};
