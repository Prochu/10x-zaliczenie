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
    <TableRow className={isCurrentUser ? "bg-primary/20 hover:bg-primary/30" : "hover:bg-white/5"}>
      <TableCell className={`font-bold ${compact ? "px-2" : ""} ${isCurrentUser ? "text-primary-foreground" : "text-foreground/80"}`}>
        {entry.rank}
      </TableCell>
      <TableCell className={`${compact ? "px-2" : ""} ${isCurrentUser ? "font-bold text-primary-foreground" : "text-foreground"}`}>
        {entry.nickname}
      </TableCell>
      <TableCell className={`text-right font-black ${compact ? "px-2" : ""} ${isCurrentUser ? "text-primary-foreground" : "text-primary"}`}>
        {entry.totalPoints}
      </TableCell>
      {!compact && (
        <TableCell className="text-right text-foreground/70 font-medium">
          {entry.matchesBet}
        </TableCell>
      )}
    </TableRow>
  );
};
