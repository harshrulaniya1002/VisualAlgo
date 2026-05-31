import StepRecorder from '../../engine/StepRecorder';

export const meta = {
  name: 'Next Permutation',
  slug: 'next-permutation',
  category: 'arrays-strings',
  timeComplexity: { best: 'O(n)', average: 'O(n)', worst: 'O(n)' },
  spaceComplexity: 'O(1)',
  description:
    'Finds the next lexicographically greater permutation of an array in-place. Finds the rightmost ascent, swaps with the smallest larger element to its right, then reverses the suffix.',
  rendererType: 'bar',
  pseudocode: [
    'Find largest i where arr[i] < arr[i+1]',
    'Find largest j where arr[j] > arr[i]',
    'swap(arr[i], arr[j])',
    'Reverse arr[i+1..n-1]',
  ],
  inputSchema: {
    type: 'array',
    constraints: { minLength: 2, maxLength: 50, minValue: 0, maxValue: 999 },
  },
};

export const defaultInput = [1, 2, 3, 6, 5, 4];

export function generateSteps(input) {
  const recorder = new StepRecorder();
  const arr = [...input];
  const n = arr.length;

  recorder.add('message', [], 0,
    `Finding next permutation of [${arr.join(', ')}]`,
    [...arr], {});

  // Step 1: Find the largest index i such that arr[i] < arr[i + 1]
  let i = n - 2;
  while (i >= 0 && arr[i] >= arr[i + 1]) {
    recorder.add('compare', [i, i + 1], 0,
      `arr[${i}] = ${arr[i]} >= arr[${i + 1}] = ${arr[i + 1]}, move left`,
      [...arr], { i });
    i--;
  }

  if (i < 0) {
    // Array is the last permutation, reverse to get first
    recorder.add('message', [], 0,
      'Array is in descending order (last permutation). Reversing to get first permutation.',
      [...arr], {});
    arr.reverse();
    recorder.add('sorted', Array.from({ length: n }, (_, k) => k), 3,
      `Reversed entire array: [${arr.join(', ')}]`,
      [...arr], {});
    return recorder.getSteps();
  }

  recorder.add('found', [i], 0,
    `Found pivot: arr[${i}] = ${arr[i]} < arr[${i + 1}] = ${arr[i + 1]}`,
    [...arr], { pivot: i });

  // Step 2: Find largest j such that arr[j] > arr[i]
  let j = n - 1;
  while (arr[j] <= arr[i]) {
    recorder.add('compare', [j, i], 1,
      `arr[${j}] = ${arr[j]} <= arr[${i}] = ${arr[i]}, move left`,
      [...arr], { i, j });
    j--;
  }

  recorder.add('found', [j], 1,
    `Found swap target: arr[${j}] = ${arr[j]} > arr[${i}] = ${arr[i]}`,
    [...arr], { pivot: i, swapTarget: j });

  // Step 3: Swap arr[i] and arr[j]
  [arr[i], arr[j]] = [arr[j], arr[i]];
  recorder.add('swap', [i, j], 2,
    `Swap arr[${i}] and arr[${j}] -> [${arr.join(', ')}]`,
    [...arr], { i, j });

  // Step 4: Reverse the suffix arr[i+1..n-1]
  let left = i + 1, right = n - 1;
  while (left < right) {
    [arr[left], arr[right]] = [arr[right], arr[left]];
    recorder.add('swap', [left, right], 3,
      `Reverse suffix: swap arr[${left}] and arr[${right}]`,
      [...arr], { left, right });
    left++;
    right--;
  }

  recorder.add('sorted', Array.from({ length: n }, (_, k) => k), 3,
    `Next permutation: [${arr.join(', ')}]`,
    [...arr], {});

  return recorder.getSteps();
}
