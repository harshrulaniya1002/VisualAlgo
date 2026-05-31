import StepRecorder from '../../engine/StepRecorder';

export const meta = {
  name: 'Sliding Window (Fixed Size)',
  slug: 'sliding-window-fixed',
  category: 'arrays-strings',
  timeComplexity: { best: 'O(n)', average: 'O(n)', worst: 'O(n)' },
  spaceComplexity: 'O(1)',
  description:
    'Maintains a window of fixed size k that slides over the array. Computes the initial window sum, then slides by adding the next element and removing the first element of the previous window.',
  rendererType: 'bar',
  pseudocode: [
    'windowSum = sum of first k elements',
    'maxSum = windowSum',
    'for i = k to n - 1:',
    '  windowSum += arr[i] - arr[i - k]',
    '  maxSum = max(maxSum, windowSum)',
  ],
  inputSchema: {
    type: 'array',
    hasTarget: true,
    constraints: { minLength: 2, maxLength: 50, minValue: 0, maxValue: 999 },
  },
};

export const defaultInput = {
  array: [2, 1, 5, 1, 3, 2, 8, 4, 3],
  target: 3,
};

export function generateSteps(input) {
  const { array, target: k } = input;
  const recorder = new StepRecorder();
  const arr = [...array];
  const n = arr.length;

  recorder.add('message', [], 0,
    `Finding maximum sum subarray of size k = ${k}`,
    [...arr], { k });

  // Build initial window
  let windowSum = 0;
  const initIndices = [];
  for (let i = 0; i < k && i < n; i++) {
    windowSum += arr[i];
    initIndices.push(i);
  }

  recorder.add('highlight', initIndices, 0,
    `Initial window [0..${k - 1}]: sum = ${windowSum}`,
    [...arr], { windowSum, maxSum: windowSum, windowStart: 0, windowEnd: k - 1 });

  let maxSum = windowSum;
  let bestStart = 0;

  // Slide the window
  for (let i = k; i < n; i++) {
    const removed = arr[i - k];
    const added = arr[i];
    windowSum = windowSum + added - removed;

    recorder.add('swap', [i - k], 3,
      `Remove arr[${i - k}] = ${removed} from window`,
      [...arr], { windowSum, maxSum, removed });

    const windowIndices = [];
    for (let j = i - k + 1; j <= i; j++) windowIndices.push(j);
    recorder.add('highlight', windowIndices, 3,
      `Add arr[${i}] = ${added}. Window [${i - k + 1}..${i}]: sum = ${windowSum}`,
      [...arr], { windowSum, maxSum, windowStart: i - k + 1, windowEnd: i });

    if (windowSum > maxSum) {
      maxSum = windowSum;
      bestStart = i - k + 1;
      recorder.add('found', windowIndices, 4,
        `New maxSum = ${maxSum} at window [${bestStart}..${i}]`,
        [...arr], { windowSum, maxSum, bestStart });
    } else {
      recorder.add('compare', windowIndices, 4,
        `windowSum (${windowSum}) <= maxSum (${maxSum})`,
        [...arr], { windowSum, maxSum });
    }
  }

  const finalIndices = [];
  for (let j = bestStart; j < bestStart + k; j++) finalIndices.push(j);
  recorder.add('sorted', finalIndices, 0,
    `Complete! Maximum sum = ${maxSum} at window [${bestStart}..${bestStart + k - 1}]`,
    [...arr], { maxSum, bestStart });

  return recorder.getSteps();
}
