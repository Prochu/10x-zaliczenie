import React from "react";
import { ScoreStepper } from "./ScoreStepper";
import { Button } from "./ui/button";

interface BettingFormProps {
  homeScore: number;
  awayScore: number;
  isDirty: boolean;
  isSaving: boolean;
  isDisabled: boolean;
  onChange: (homeScore: number, awayScore: number) => void;
  onSave: () => void;
}

export const BettingForm: React.FC<BettingFormProps> = ({
  homeScore,
  awayScore,
  isDirty,
  isSaving,
  isDisabled,
  onChange,
  onSave,
}) => {
  const handleHomeScoreChange = (newScore: number) => {
    onChange(newScore, awayScore);
  };

  const handleAwayScoreChange = (newScore: number) => {
    onChange(homeScore, newScore);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <ScoreStepper
            value={homeScore}
            onChange={handleHomeScoreChange}
            disabled={isDisabled || isSaving}
            label="Home"
          />
          <span className="text-muted-foreground">-</span>
          <ScoreStepper
            value={awayScore}
            onChange={handleAwayScoreChange}
            disabled={isDisabled || isSaving}
            label="Away"
          />
        </div>

        <Button
          onClick={onSave}
          disabled={!isDirty || isSaving || isDisabled}
          size="sm"
        >
          {isSaving ? "Saving..." : "Save"}
        </Button>
      </div>
    </div>
  );
};
