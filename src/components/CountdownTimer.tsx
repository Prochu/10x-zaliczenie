import React from "react";
import { useCountdown } from "./hooks/useCountdown";

interface CountdownTimerProps {
  deadline: string;
}

export const CountdownTimer: React.FC<CountdownTimerProps> = ({ deadline }) => {
  const { formattedTime, isExpired } = useCountdown(deadline);

  if (isExpired) {
    return (
      <span className="text-sm font-medium text-destructive">
        Locked
      </span>
    );
  }

  return (
    <span className="text-sm font-medium text-foreground">
      {formattedTime}
    </span>
  );
};
