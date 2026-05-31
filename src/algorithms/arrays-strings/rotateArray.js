import StepRecorder from '../../engine/StepRecorder';

export const meta = {
  name: 'Rotate Array',
  slug: 'rotate-array',
  category: 'arrays-strings',
  timeComplexity: { best: 'O(n)', average: 'O(n)', worst: 'O(n)' },
  spaceComplexity: 'O(1)',
  description:
    'Rotates an array to the right by k positions using the reversal algorithm: reverse the entire array, reverse the first k elements, then reverse the remaining elements.',
  rendererType: 'bar',
  pseudocode: [
    'k = k % n',
    'reverse(arr, 0, n - 1)',
    'reverse(arr, 0, k - 1)',
    'reverse(arr, k, n - 1)',
  ],
  inputSchema: {
    type: 'array',
    hasTarget: true,
    constraints: { minLength: 2, maxLength: 50, minValue: 0, maxValue: 999 },
  },
};

export const defaultInput = {
  array: [1, 2, 3, 4, 5, 6, 7],
  target: 3,
};

export function generateSteps(input) {
  const { array, target: k } = input;
  const recorder = new StepRecorder();
  const arr = [...array];
  const n = arr.length;
  const effectiveK = k % n;

  recorder.add('message', [], 0,
    `Rotating array right by k = ${k} positions (effective k = ${effectiveK})`,
    [...arr], { k: effectiveK });

  if (effectiveK === 0) {
    recorder.add('message', [], 0,
      'k is 0 (or multiple of n), array unchanged.',
      [...arr], {});
    return recorder.getSteps();
  }

  // Helper to reverse in-place with visualization
  function reverseSection(left, right, stepLabel, codeLine) {
    recorder.add('message', [], codeLine,
      `${stepLabel}: reverse arr[${left}..${right}]`,
      [...arr], { left, right });

    while (left < right) {
      [arr[left], arr[right]] = [arr[right], arr[left]];
      recorder.add('swap', [left, right], codeLine,
        `Swap arr[${left}] = ${arr[left]} and arr[${right}] = ${arr[right]}`,
        [...arr], { left, right });
      left++;
      right--;
    }
  }

  // Step 1: Reverse entire array
  reverseSection(0, n - 1, 'Step 1', 1);

  // Step 2: Reverse first k elements
  reverseSection(0, effectiveK - 1, 'Step 2', 2);

  // Step 3: Reverse remaining elements
  reverseSection(effectiveK, n - 1, 'Step 3', 3);

  recorder.add('sorted', Array.from({ length: n }, (_, i) => i), 0,
    `Rotation complete! Result: [${arr.join(', ')}]`,
    [...arr], {});

  return recorder.getSteps();
}
