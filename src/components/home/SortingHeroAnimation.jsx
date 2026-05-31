import { useState, useEffect, useRef, useCallback } from 'react';

const BAR_COUNT = 14;
const STEP_DELAY = 120;
const PAUSE_AFTER_SORT = 2000;

function generateRandomArray(n) {
  const arr = [];
  for (let i = 0; i < n; i++) {
    arr.push(Math.floor(Math.random() * 80) + 20);
  }
  return arr;
}

export default function SortingHeroAnimation() {
  const [bars, setBars] = useState(() => generateRandomArray(BAR_COUNT));
  const [activeIndices, setActiveIndices] = useState([]);
  const [sortedIndices, setSortedIndices] = useState(new Set());
  const [swappingIndices, setSwappingIndices] = useState([]);
  const animating = useRef(false);
  const cancelled = useRef(false);

  const sleep = useCallback((ms) => {
    return new Promise((resolve, reject) => {
      const id = setTimeout(() => {
        if (cancelled.current) reject(new Error('cancelled'));
        else resolve();
      }, ms);
    });
  }, []);

  const runSort = useCallback(async () => {
    if (animating.current) return;
    animating.current = true;
    cancelled.current = false;

    try {
      const arr = generateRandomArray(BAR_COUNT);
      setBars([...arr]);
      setSortedIndices(new Set());
      setActiveIndices([]);
      setSwappingIndices([]);
      await sleep(400);

      const n = arr.length;
      for (let i = 0; i < n - 1; i++) {
        for (let j = 0; j < n - i - 1; j++) {
          setActiveIndices([j, j + 1]);
          setSwappingIndices([]);
          await sleep(STEP_DELAY);

          if (arr[j] > arr[j + 1]) {
            setSwappingIndices([j, j + 1]);
            [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
            setBars([...arr]);
            await sleep(STEP_DELAY);
            setSwappingIndices([]);
          }
        }
        setSortedIndices(prev => new Set([...prev, n - 1 - i]));
      }

      setSortedIndices(new Set(arr.map((_, i) => i)));
      setActiveIndices([]);
      setSwappingIndices([]);
      await sleep(PAUSE_AFTER_SORT);
    } catch {
      // cancelled
    }

    animating.current = false;
  }, [sleep]);

  useEffect(() => {
    runSort();
    const interval = setInterval(runSort, (BAR_COUNT * BAR_COUNT * STEP_DELAY) + PAUSE_AFTER_SORT + 2000);
    return () => {
      cancelled.current = true;
      clearInterval(interval);
    };
  }, [runSort]);

  const maxVal = Math.max(...bars, 100);

  return (
    <div className="relative w-48 h-32 flex items-end justify-center gap-[3px]">
      {bars.map((val, i) => {
        const heightPct = (val / maxVal) * 100;
        const isSorted = sortedIndices.has(i);
        const isActive = activeIndices.includes(i);
        const isSwapping = swappingIndices.includes(i);

        let color = '#94a3b8';
        if (isSorted) color = '#22c55e';
        else if (isSwapping) color = '#ef4444';
        else if (isActive) color = '#facc15';

        return (
          <div
            key={i}
            className="rounded-t-sm transition-all duration-100"
            style={{
              width: `${100 / BAR_COUNT - 2}%`,
              height: `${heightPct}%`,
              backgroundColor: color,
              boxShadow: isActive || isSwapping ? `0 0 8px ${color}40` : 'none',
            }}
          />
        );
      })}
    </div>
  );
}
