import React from "react";

interface DashboardHeaderProps {
  lastUpdated?: Date;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({ lastUpdated }) => {
  const formatLastUpdated = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }).format(date);
  };

  return (
    <header className="mb-8">
      <h1 className="text-3xl font-bold text-foreground mb-2">Champions League Dashboard</h1>
      {lastUpdated && <p className="text-sm text-muted-foreground">Last updated: {formatLastUpdated(lastUpdated)}</p>}
    </header>
  );
};
