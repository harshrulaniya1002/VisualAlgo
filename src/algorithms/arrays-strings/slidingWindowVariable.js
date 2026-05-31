import StepRecorder from '../../engine/StepRecorder';

export const meta = {
  name: 'Sliding Window (Variable Size)',
  slug: 'sliding-window-variable',
  category: 'arrays-strings',
  timeComplexity: { best: 'O(n)', average: 'O(n)', worst: 'O(n)' },
  spaceComplexity: 'O(1)',
  description:
    'Finds the smallest contiguous subarray whose sum is greater than or equal to a target value. Expands the window by moving the right pointer, then shrinks from the left when the sum meets the target.',
  rendererType: 'bar',
  pseudocode: [
    'left = 0, windowSum = 0, minLen = Infinity',
    'for right = 0 to n - 1:',
    '  windowSum += arr[right]',
    '  while windowSum >= target:',
    '    minLen = min(minLen, right-left+1)',
    '    windowSum -= arr[left]; left++',
  ],
  inputSchema: {
    type: 'array',
    hasTarget: true,
    constraints: { minLength: 2, maxLength: 50, minValue: 1, maxValue: 999 },
  },
};

export const defaultInput = {
  array: [2, 3, 1, 2, 4, 3],
  target: 7,
};

export function generateSteps(input) {
  const { array, target } = input;
  const recorder = new StepRecorder();
  const arr = [...array];
  const n = arr.length;

  recorder.add('message', [], 0,
    `Finding smallest subarray with sum >= ${target}`,
    [...arr], { target });

  let left = 0;
  let windowSum = 0;
  let minLen = Infinity;
  let bestLeft = -1, bestRight = -1;

  for (let right = 0; right < n; right++) {
    windowSum += arr[right];

    recorder.add('visit', [right], 2,
      `Expand: add arr[${right}] = ${arr[right]}, windowSum = ${windowSum}`,
      [...arr], { left, right, windowSum, minLen, target });

    while (windowSum >= target) {
      const windowIndices = [];
      for (let k = left; k <= right; k++) windowIndices.push(k);
      const len = right - left + 1;

      if (len < minLen) {
        minLen = len;
        bestLeft = left;
        bestRight = right;
        recorder.add('found', windowIndices, 4,
          `Sum ${windowSum} >= ${target}. New min length = ${minLen} at [${left}..${right}]`,
          [...arr], { left, right, windowSum, minLen });
      } else {
        recorder.add('compare', windowIndices, 4,
          `Sum ${windowSum} >= ${target}. Length ${len} >= minLen ${minLen}, no update`,
          [...arr], { left, right, windowSum, minLen });
      }

      recorder.add('eliminate', [left], 5,
        `Shrink: remove arr[${left}] = ${arr[left]}, windowSum = ${windowSum - arr[left]}`,
        [...arr], { left, right, windowSum: windowSum - arr[left] });

      windowSum -= arr[left];
      left++;
    }
  }

  if (bestLeft >= 0) {
    const finalIndices = [];
    for (let k = bestLeft; k <= bestRight; k++) finalIndices.push(k);
    recorder.add('sorted', finalIndices, 0,
      `Complete! Smallest subarray with sum >= ${target} has length ${minLen} at [${bestLeft}..${bestRight}]`,
      [...arr], { minLen, bestLeft, bestRight });
  } else {
    recorder.add('message', [], 0,
      `No subarray found with sum >= ${target}`,
      [...arr], {});
  }

  return recorder.getSteps();
}
