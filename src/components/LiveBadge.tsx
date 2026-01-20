import React from "react";
import { Badge } from "./ui/badge";

export const LiveBadge: React.FC = () => {
  return (
    <Badge variant="destructive" className="animate-pulse">
      <span className="w-2 h-2 bg-current rounded-full mr-2 animate-ping" />
      LIVE
    </Badge>
  );
};
