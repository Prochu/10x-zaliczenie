import React from "react";
import { Card, CardContent, CardHeader } from "./ui/card";

interface MatchHistorySkeletonProps {
  count?: number;
}

export const MatchHistorySkeleton: React.FC<MatchHistorySkeletonProps> = ({ count = 5 }) => {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, index) => (
        <Card key={index} className="overflow-hidden animate-pulse">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex-1 space-y-3">
                {/* Date skeleton */}
                <div className="h-4 bg-muted rounded w-32"></div>

                {/* Teams skeleton */}
                <div className="flex items-center justify-between">
                  {/* Home team */}
                  <div className="flex items-center space-x-3 flex-1">
                    <div className="w-6 h-6 bg-muted rounded"></div>
                    <div className="h-4 bg-muted rounded w-24"></div>
                  </div>

                  {/* Score */}
                  <div className="flex items-center space-x-2 px-3">
                    <div className="h-6 bg-muted rounded w-6"></div>
                    <div className="h-4 bg-muted rounded w-3"></div>
                    <div className="h-6 bg-muted rounded w-6"></div>
                  </div>

                  {/* Away team */}
                  <div className="flex items-center space-x-3 flex-1 justify-end">
                    <div className="h-4 bg-muted rounded w-24"></div>
                    <div className="w-6 h-6 bg-muted rounded"></div>
                  </div>
                </div>
              </div>

              {/* Points badge skeleton */}
              <div className="ml-4">
                <div className="h-6 bg-muted rounded w-20"></div>
              </div>
            </div>
          </CardHeader>

          {/* Desktop prediction details skeleton */}
          <div className="hidden md:block">
            <CardContent className="pt-0">
              <div className="space-y-2">
                <div className="h-3 bg-muted rounded w-24"></div>
                <div className="rounded-lg border p-3 bg-muted/30">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3 flex-1">
                      <div className="w-5 h-5 bg-muted rounded"></div>
                      <div className="h-3 bg-muted rounded w-20"></div>
                    </div>
                    <div className="flex items-center space-x-2 px-3">
                      <div className="h-4 bg-muted rounded w-4"></div>
                      <div className="h-3 bg-muted rounded w-2"></div>
                      <div className="h-4 bg-muted rounded w-4"></div>
                    </div>
                    <div className="flex items-center space-x-3 flex-1 justify-end">
                      <div className="h-3 bg-muted rounded w-20"></div>
                      <div className="w-5 h-5 bg-muted rounded"></div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </div>
        </Card>
      ))}
    </div>
  );
};
