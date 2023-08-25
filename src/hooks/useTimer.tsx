import { useState, useEffect, useRef } from "react";

const useTimer = (limit?: number) => {
  const [time, setTime] = useState<number>(0);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const interval = useRef<NodeJS.Timer | null>(null);

  useEffect(() => {
    if (isRunning) {
      interval.current = setInterval(() => {
        setTime((prevTime) => {
          if (limit && prevTime < limit / 100) {
            return prevTime + 1;
          } else {
            setIsRunning(false);
            interval.current && clearInterval(interval.current);
            return prevTime;
          }
        });
      }, 100);
    } else {
      if (interval.current) clearInterval(interval.current);
    }

    return () => {
      if (interval.current) clearInterval(interval.current);
    };
  }, [isRunning, limit]);

  const onStart = () => {
    if (!isRunning && time * 100 === limit) {
      setTime(0); 
    }
    setIsRunning(true);
  };

  const onStop = () => {
    setIsRunning(false);
    if (interval.current) clearInterval(interval.current);
    setTime(0);
  };

  const onResume = () => {
    if (!isRunning && time * 100 === limit) {
      setTime(0); 
    }
    setIsRunning(true);
  };

  const onPauseOrResume = () => {
    if (!isRunning && time * 100 === limit) {
      setTime(0); 
    }
    setIsRunning(!isRunning);
  };

  return {
    time,
    isRunning,
    onStart,
    onStop,
    onResume,
    onPauseOrResume,
  };
};

export default useTimer;

export function useInterval(callback: () => void, delay: number | null) {
  const savedCallback = useRef(callback);

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    if (delay !== null) {
      let id = setInterval(() => savedCallback.current(), delay);
      return () => clearInterval(id);
    }
  }, [delay]);
}

// useTimeout hook
export function useTimeout(callback: () => void, delay: number | null) {
  const savedCallback = useRef(callback);

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    if (delay !== null) {
      let id = setTimeout(() => savedCallback.current(), delay);
      return () => clearTimeout(id);
    }
  }, [delay]);
}