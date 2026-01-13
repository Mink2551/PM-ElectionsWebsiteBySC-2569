import { useEffect, useState, useCallback } from "react";

export function useCountdown(targetDate: Date) {
  const getTimeLeft = useCallback(() => {
    const now = new Date().getTime();
    const target = targetDate.getTime();
    const diff = target - now;

    if (diff <= 0) {
      return {
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
      };
    }

    return {
      days: Math.floor(diff / (1000 * 60 * 60 * 24)),
      hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((diff / (1000 * 60)) % 60),
      seconds: Math.floor((diff / 1000) % 60),
    };
  }, [targetDate]);

  const [timeLeft, setTimeLeft] = useState(getTimeLeft());

  useEffect(() => {
    // Update immediately when targetDate changes
    setTimeLeft(getTimeLeft());

    const timer = setInterval(() => {
      setTimeLeft(getTimeLeft());
    }, 1000); // Update every second for smooth countdown

    return () => clearInterval(timer);
  }, [getTimeLeft]);

  return timeLeft;
}
