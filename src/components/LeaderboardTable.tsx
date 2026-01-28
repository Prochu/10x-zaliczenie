import React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { LeaderboardRow } from "./LeaderboardRow";
import type { LeaderboardEntryDto } from "../types";

interface LeaderboardTableProps {
  entries: LeaderboardEntryDto[];
  currentUserId: string;
  compact?: boolean;
}

export const LeaderboardTable: React.FC<LeaderboardTableProps> = ({ entries, currentUserId, compact = false }) => {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className={compact ? "w-12 px-2" : "w-16"}>Rank</TableHead>
            <TableHead className={compact ? "px-2" : ""}>Player</TableHead>
            <TableHead className={`text-right ${compact ? "px-2" : ""}`}>Points</TableHead>
            {!compact && <TableHead className="text-right">Matches Bet</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {entries.length === 0 ? (
            <TableRow>
              <TableCell colSpan={compact ? 3 : 4} className="text-center py-8 text-muted-foreground">
                No rankings available. Place your first bet to join the competition!
              </TableCell>
            </TableRow>
          ) : (
            entries.map((entry) => (
              <LeaderboardRow
                key={entry.userId}
                entry={entry}
                isCurrentUser={entry.userId === currentUserId}
                compact={compact}
              />
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};
