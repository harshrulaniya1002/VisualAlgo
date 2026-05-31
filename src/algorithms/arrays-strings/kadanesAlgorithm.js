import StepRecorder from '../../engine/StepRecorder';

export const meta = {
  name: "Kadane's Algorithm",
  slug: 'kadanes-algorithm',
  category: 'arrays-strings',
  timeComplexity: { best: 'O(n)', average: 'O(n)', worst: 'O(n)' },
  spaceComplexity: 'O(1)',
  description:
    "Kadane's Algorithm finds the contiguous subarray with the maximum sum in linear time. It keeps a running current sum and resets it when it drops below zero, while tracking the global maximum.",
  rendererType: 'bar',
  pseudocode: [
    'maxSum = arr[0], currentSum = 0',
    'for i = 0 to n - 1:',
    '  currentSum += arr[i]',
    '  maxSum = max(maxSum, currentSum)',
    '  if currentSum < 0: currentSum = 0',
  ],
  inputSchema: {
    type: 'array',
    constraints: { minLength: 2, maxLength: 50, minValue: -999, maxValue: 999 },
  },
};

export const defaultInput = [-2, 1, -3, 4, -1, 2, 1, -5, 4];

export function generateSteps(input) {
  const recorder = new StepRecorder();
  const arr = [...input];
  const n = arr.length;

  let maxSum = arr[0];
  let currentSum = 0;
  let bestStart = 0, bestEnd = 0, tempStart = 0;

  recorder.add('message', [], 0,
    `Starting Kadane's Algorithm on array of ${n} elements`,
    [...arr], { currentSum: 0, maxSum: arr[0] });

  for (let i = 0; i < n; i++) {
    currentSum += arr[i];

    recorder.add('visit', [i], 2,
      `Add arr[${i}] = ${arr[i]} to currentSum -> currentSum = ${currentSum}`,
      [...arr], { currentSum, maxSum, subarray: [tempStart, i] });

    if (currentSum > maxSum) {
      maxSum = currentSum;
      bestStart = tempStart;
      bestEnd = i;
      const highlightIndices = [];
      for (let k = bestStart; k <= bestEnd; k++) highlightIndices.push(k);
      recorder.add('found', highlightIndices, 3,
        `New maxSum = ${maxSum} (subarray [${bestStart}..${bestEnd}])`,
        [...arr], { currentSum, maxSum, bestStart, bestEnd });
    } else {
      recorder.add('compare', [i], 3,
        `currentSum (${currentSum}) <= maxSum (${maxSum}), no update`,
        [...arr], { currentSum, maxSum });
    }

    if (currentSum < 0) {
      recorder.add('eliminate', [i], 4,
        `currentSum (${currentSum}) < 0, reset to 0. Start new subarray from index ${i + 1}`,
        [...arr], { currentSum: 0, maxSum });
      currentSum = 0;
      tempStart = i + 1;
    }
  }

  const finalIndices = [];
  for (let k = bestStart; k <= bestEnd; k++) finalIndices.push(k);
  recorder.add('sorted', finalIndices, 0,
    `Kadane's complete! Maximum subarray sum = ${maxSum} (indices ${bestStart} to ${bestEnd})`,
    [...arr], { maxSum, bestStart, bestEnd });

  return recorder.getSteps();
}
