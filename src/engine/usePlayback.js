import { useState, useRef, useEffect, useCallback, useMemo } from 'react';

export default function usePlayback(steps) {
  const [currentStep, setCurrentStep] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const intervalRef = useRef(null);
  const stepsRef = useRef(steps);

  stepsRef.current = steps;

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  useEffect(() => {
    if (!isPlaying) return;

    if (intervalRef.current) clearInterval(intervalRef.current);
    const delay = 500 / speed;

    intervalRef.current = setInterval(() => {
      setCurrentStep(prev => {
        const next = prev + 1;
        if (next >= stepsRef.current.length) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
          setIsPlaying(false);
          return stepsRef.current.length - 1;
        }
        return next;
      });
    }, delay);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isPlaying, speed]);

  const play = useCallback(() => {
    if (!stepsRef.current || stepsRef.current.length === 0) return;
    setCurrentStep(prev => {
      if (prev >= stepsRef.current.length - 1) return 0;
      return prev < 0 ? 0 : prev;
    });
    setIsPlaying(true);
  }, []);

  const pause = useCallback(() => {
    setIsPlaying(false);
  }, []);

  const stepForward = useCallback(() => {
    setIsPlaying(false);
    setCurrentStep(prev => {
      if (!stepsRef.current || stepsRef.current.length === 0) return prev;
      const next = prev + 1;
      return next < stepsRef.current.length ? next : prev;
    });
  }, []);

  const stepBack = useCallback(() => {
    setIsPlaying(false);
    setCurrentStep(prev => (prev > 0 ? prev - 1 : 0));
  }, []);

  const reset = useCallback(() => {
    setIsPlaying(false);
    setCurrentStep(-1);
  }, []);

  const jumpTo = useCallback((n) => {
    setIsPlaying(false);
    if (!stepsRef.current || stepsRef.current.length === 0) return;
    setCurrentStep(Math.max(0, Math.min(n, stepsRef.current.length - 1)));
  }, []);

  const changeSpeed = useCallback((s) => {
    setSpeed(Math.max(0.25, Math.min(4, s)));
  }, []);

  return useMemo(() => ({
    currentStep,
    isPlaying,
    speed,
    play,
    pause,
    stepForward,
    stepBack,
    reset,
    jumpTo,
    setSpeed: changeSpeed,
  }), [currentStep, isPlaying, speed, play, pause, stepForward, stepBack, reset, jumpTo, changeSpeed]);
}
