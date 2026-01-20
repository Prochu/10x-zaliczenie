import { useState, useEffect, useCallback } from "react";

interface UseCountdownReturn {
  timeLeft: number;
  isExpired: boolean;
  formattedTime: string;
}

export const useCountdown = (deadline: string): UseCountdownReturn => {
  const [timeLeft, setTimeLeft] = useState<number>(() => {
    const deadlineTime = new Date(deadline).getTime();
    const now = Date.now();
    return Math.max(0, Math.floor((deadlineTime - now) / 1000));
  });

  const [isExpired, setIsExpired] = useState(timeLeft <= 0);

  const formatTime = useCallback((seconds: number): string => {
    if (seconds <= 0) return "00:00:00";

    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }, []);

  useEffect(() => {
    if (isExpired) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        const newTime = Math.max(0, prev - 1);
        if (newTime === 0) {
          setIsExpired(true);
        }
        return newTime;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isExpired]);

  // Recalculate when deadline changes
  useEffect(() => {
    const deadlineTime = new Date(deadline).getTime();
    const now = Date.now();
    const newTimeLeft = Math.max(0, Math.floor((deadlineTime - now) / 1000));
    setTimeLeft(newTimeLeft);
    setIsExpired(newTimeLeft <= 0);
  }, [deadline]);

  return {
    timeLeft,
    isExpired,
    formattedTime: formatTime(timeLeft),
  };
};
