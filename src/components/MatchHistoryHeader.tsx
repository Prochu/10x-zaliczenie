import React, { useState } from "react";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import type { MatchHistoryFiltersViewModel } from "./hooks/useMatchHistory";

interface MatchHistoryHeaderProps {
  filters: MatchHistoryFiltersViewModel;
  onFiltersChange: (filters: MatchHistoryFiltersViewModel) => void;
}

const MatchHistoryHeader: React.FC<MatchHistoryHeaderProps> = ({ filters, onFiltersChange }) => {
  const [localFilters, setLocalFilters] = useState<MatchHistoryFiltersViewModel>(filters);
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleDateChange = (field: "from" | "to", value: string) => {
    const date = value ? new Date(value) : undefined;

    setLocalFilters((prev) => ({
      ...prev,
      [field]: date,
    }));

    // Clear validation error when user starts typing
    if (validationError) {
      setValidationError(null);
    }
  };

  const handleSortOrderChange = (sortOrder: "asc" | "desc") => {
    setLocalFilters((prev) => ({
      ...prev,
      sortOrder,
    }));
  };

  const validateAndApplyFilters = () => {
    const { from, to } = localFilters;

    // Validate date range
    if (from && to && from > to) {
      setValidationError("'From' date must be before or equal to 'To' date");
      return;
    }

    // Clear any previous validation error
    setValidationError(null);

    // Apply filters
    onFiltersChange(localFilters);
  };

  const formatDateForInput = (date?: Date): string => {
    if (!date) return "";
    return date.toISOString().split("T")[0]; // YYYY-MM-DD format for date input
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1">
            <label htmlFor="from-date" className="block text-sm font-medium mb-2">
              From Date
            </label>
            <input
              id="from-date"
              type="date"
              value={formatDateForInput(localFilters.from)}
              onChange={(e) => handleDateChange("from", e.target.value)}
              className="w-full px-3 py-2 border border-input bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div className="flex-1">
            <label htmlFor="to-date" className="block text-sm font-medium mb-2">
              To Date
            </label>
            <input
              id="to-date"
              type="date"
              value={formatDateForInput(localFilters.to)}
              onChange={(e) => handleDateChange("to", e.target.value)}
              className="w-full px-3 py-2 border border-input bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div className="flex-1">
            <label htmlFor="sort-order" className="block text-sm font-medium mb-2">
              Sort Order
            </label>
            <select
              id="sort-order"
              value={localFilters.sortOrder}
              onChange={(e) => handleSortOrderChange(e.target.value as "asc" | "desc")}
              className="w-full px-3 py-2 border border-input bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="desc">Newest First</option>
              <option value="asc">Oldest First</option>
            </select>
          </div>

          <div className="flex-shrink-0">
            <Button onClick={validateAndApplyFilters} className="w-full md:w-auto">
              Apply Filters
            </Button>
          </div>
        </div>

        {validationError && <div className="mt-4 text-sm text-destructive">{validationError}</div>}
      </CardContent>
    </Card>
  );
};

export default MatchHistoryHeader;
