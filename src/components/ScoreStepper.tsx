import React from "react";
import { Button } from "./ui/button";
import { Minus, Plus } from "lucide-react";

interface ScoreStepperProps {
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
  label?: string;
}

export const ScoreStepper: React.FC<ScoreStepperProps> = ({ value, onChange, disabled = false, label }) => {
  const handleDecrement = () => {
    if (disabled) return;
    const newValue = Math.max(0, value - 1);
    onChange(newValue);
  };

  const handleIncrement = () => {
    if (disabled) return;
    onChange(value + 1);
  };

  return (
    <div className="flex flex-col items-center space-y-1">
      {label && <span className="text-xs text-muted-foreground">{label}</span>}
      <div className="flex items-center space-x-1">
        <Button
          variant="outline"
          size="sm"
          onClick={handleDecrement}
          disabled={disabled || value <= 0}
          className="h-8 w-8 p-0"
        >
          <Minus className="h-3 w-3" />
        </Button>

        <div className="flex items-center justify-center w-12 h-8 bg-muted rounded border">
          <span className="text-lg font-semibold">{value}</span>
        </div>

        <Button variant="outline" size="sm" onClick={handleIncrement} disabled={disabled} className="h-8 w-8 p-0">
          <Plus className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
};
