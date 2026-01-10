import { useState, useEffect, useRef } from 'react';

export const usePollTimer = (initialTime, isActive = true) => {
  const [time, setTime] = useState(initialTime || 0);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (isActive && time > 0) {
      intervalRef.current = setInterval(() => {
        setTime((prevTime) => {
          if (prevTime <= 1) {
            clearInterval(intervalRef.current);
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isActive, time]);

  const resetTimer = (newTime) => {
    setTime(newTime);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  return { time, formatTime, resetTimer };
};




