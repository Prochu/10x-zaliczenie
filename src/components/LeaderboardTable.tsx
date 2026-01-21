import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { LeaderboardRow } from "./LeaderboardRow";
import type { LeaderboardEntryDto } from "../types";

interface LeaderboardTableProps {
  entries: LeaderboardEntryDto[];
  currentUserId: string;
}

export const LeaderboardTable: React.FC<LeaderboardTableProps> = ({
  entries,
  currentUserId,
}) => {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-16">Rank</TableHead>
            <TableHead>Player</TableHead>
            <TableHead className="text-right">Total Points</TableHead>
            <TableHead className="text-right">Matches Bet</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {entries.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                No rankings available. Place your first bet to join the competition!
              </TableCell>
            </TableRow>
          ) : (
            entries.map((entry) => (
              <LeaderboardRow
                key={entry.userId}
                entry={entry}
                isCurrentUser={entry.userId === currentUserId}
              />
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};
