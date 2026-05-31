import StepRecorder from '../../engine/StepRecorder';

export const meta = {
  name: 'Jump Search',
  slug: 'jump-search',
  category: 'searching',
  timeComplexity: { best: 'O(1)', average: 'O(√n)', worst: 'O(√n)' },
  spaceComplexity: 'O(1)',
  description:
    'Jump search works on sorted arrays by jumping ahead by a fixed block size (sqrt(n)) and then performing a linear search within the identified block.',
  rendererType: 'bar',
  pseudocode: [
    'function jumpSearch(arr, target):',
    '  n = arr.length',
    '  step = floor(sqrt(n))',
    '  prev = 0',
    '  while arr[min(step, n) - 1] < target:',
    '    prev = step',
    '    step += floor(sqrt(n))',
    '    if prev >= n:',
    '      return -1',
    '  for i = prev to min(step, n) - 1:',
    '    if arr[i] == target:',
    '      return i',
    '  return -1',
  ],
  inputSchema: {
    type: 'array',
    hasTarget: true,
  },
};

export const defaultInput = {
  array: [3, 7, 11, 14, 19, 22, 28, 33, 40, 55, 62, 71, 80, 95],
  target: 33,
};

/**
 * Generate step-by-step visualization for jump search.
 *
 * @param {{ array: number[], target: number }} input
 * @returns {Array} Recorded steps.
 */
export function generateSteps(input) {
  const { array, target } = input;
  const arr = [...array];
  const n = arr.length;
  const recorder = new StepRecorder();
  const step = Math.floor(Math.sqrt(n));

  recorder.add(
    'compare',
    [],
    2,
    `Starting jump search for target ${target}. Block size = ${step}.`,
    arr,
    { target, blockSize: step }
  );

  let prev = 0;
  let current = step;

  // Jump phase
  while (current < n && arr[Math.min(current, n) - 1] < target) {
    recorder.add(
      'compare',
      [Math.min(current, n) - 1],
      4,
      `Jumping: arr[${Math.min(current, n) - 1}] = ${arr[Math.min(current, n) - 1]} < ${target}. Jump ahead.`,
      arr,
      { target, prev, current, blockSize: step }
    );

    prev = current;
    current += step;

    if (prev >= n) {
      recorder.add(
        'not-found',
        [],
        8,
        `Jumped past the end of the array. Target ${target} not found.`,
        arr,
        { target }
      );
      return recorder.getSteps();
    }
  }

  // Check the boundary element of the jump
  if (current < n) {
    recorder.add(
      'compare',
      [Math.min(current, n) - 1],
      4,
      `arr[${Math.min(current, n) - 1}] = ${arr[Math.min(current, n) - 1]} >= ${target}. Block found between indices ${prev} and ${Math.min(current, n) - 1}.`,
      arr,
      { target, prev, current: Math.min(current, n) - 1 }
    );
  }

  // Linear search within the block
  const end = Math.min(current, n);
  for (let i = prev; i < end; i++) {
    recorder.add(
      'compare',
      [i],
      10,
      `Linear scan: comparing arr[${i}] = ${arr[i]} with target ${target}.`,
      arr,
      { target, currentIndex: i, blockStart: prev, blockEnd: end - 1 }
    );

    if (arr[i] === target) {
      recorder.add(
        'found',
        [i],
        11,
        `Target ${target} found at index ${i}.`,
        arr,
        { target, foundIndex: i }
      );
      return recorder.getSteps();
    }
  }

  recorder.add(
    'not-found',
    [],
    12,
    `Target ${target} not found in the array.`,
    arr,
    { target }
  );

  return recorder.getSteps();
}
