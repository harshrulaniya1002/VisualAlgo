import StepRecorder from '../../engine/StepRecorder';

export const meta = {
  name: 'Merge Intervals',
  slug: 'merge-intervals',
  category: 'arrays-strings',
  timeComplexity: { best: 'O(n log n)', average: 'O(n log n)', worst: 'O(n log n)' },
  spaceComplexity: 'O(n)',
  description:
    'Merges all overlapping intervals. First sorts intervals by start time, then iterates through, merging each interval with the previous one if they overlap.',
  rendererType: 'bar',
  pseudocode: [
    'Sort intervals by start time',
    'merged = [intervals[0]]',
    'for each interval in intervals[1..]:',
    '  if interval.start <= merged.last.end:',
    '    merged.last.end = max(ends)',
    '  else: merged.push(interval)',
  ],
  inputSchema: {
    type: 'array',
    constraints: { minLength: 2, maxLength: 50, minValue: 0, maxValue: 999 },
  },
};

// Flat array representation: [start1, end1, start2, end2, ...]
// Each pair represents an interval
export const defaultInput = [1, 3, 2, 6, 8, 10, 15, 18, 9, 12];

export function generateSteps(input) {
  const recorder = new StepRecorder();
  const arr = [...input];

  // Parse intervals from flat array
  const intervals = [];
  for (let i = 0; i < arr.length; i += 2) {
    if (i + 1 < arr.length) {
      intervals.push([arr[i], arr[i + 1]]);
    }
  }

  // Build a display array showing interval endpoints
  const displayArr = intervals.map(iv => iv[0]);

  recorder.add('message', [], 0,
    `Merging ${intervals.length} intervals: ${intervals.map(iv => `[${iv[0]},${iv[1]}]`).join(', ')}`,
    [...arr], { intervals: intervals.map(iv => [...iv]) });

  // Sort by start time
  intervals.sort((a, b) => a[0] - b[0]);
  const sortedFlat = intervals.flat();

  recorder.add('compute', Array.from({ length: sortedFlat.length }, (_, i) => i), 0,
    `Sorted by start: ${intervals.map(iv => `[${iv[0]},${iv[1]}]`).join(', ')}`,
    [...sortedFlat], { intervals: intervals.map(iv => [...iv]) });

  // Merge
  const merged = [[...intervals[0]]];
  recorder.add('visit', [0, 1], 1,
    `Start with first interval [${intervals[0][0]}, ${intervals[0][1]}]`,
    [...sortedFlat], { merged: merged.map(iv => [...iv]) });

  for (let i = 1; i < intervals.length; i++) {
    const current = intervals[i];
    const last = merged[merged.length - 1];
    const flatIdx = i * 2;

    recorder.add('compare', [flatIdx, flatIdx + 1], 3,
      `Check [${current[0]}, ${current[1]}]: does ${current[0]} <= ${last[1]}?`,
      [...sortedFlat], { current: [...current], last: [...last] });

    if (current[0] <= last[1]) {
      const oldEnd = last[1];
      last[1] = Math.max(last[1], current[1]);
      recorder.add('merge', [flatIdx, flatIdx + 1], 4,
        `Overlap! Merge: [${last[0]}, ${oldEnd}] + [${current[0]}, ${current[1]}] -> [${last[0]}, ${last[1]}]`,
        [...sortedFlat], { merged: merged.map(iv => [...iv]) });
    } else {
      merged.push([...current]);
      recorder.add('insert', [flatIdx, flatIdx + 1], 5,
        `No overlap. Add [${current[0]}, ${current[1]}] as new interval`,
        [...sortedFlat], { merged: merged.map(iv => [...iv]) });
    }
  }

  // Build final display
  const mergedFlat = merged.flat();
  recorder.add('sorted', Array.from({ length: mergedFlat.length }, (_, i) => i), 0,
    `Merge complete! Result: ${merged.map(iv => `[${iv[0]},${iv[1]}]`).join(', ')}`,
    [...mergedFlat], { merged: merged.map(iv => [...iv]) });

  return recorder.getSteps();
}
