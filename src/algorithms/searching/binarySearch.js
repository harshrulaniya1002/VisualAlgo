import StepRecorder from '../../engine/StepRecorder';

export const meta = {
  name: 'Binary Search',
  slug: 'binary-search',
  category: 'searching',
  timeComplexity: { best: 'O(1)', average: 'O(log n)', worst: 'O(log n)' },
  spaceComplexity: 'O(1)',
  description:
    'Binary search repeatedly divides a sorted array in half, comparing the target with the middle element to eliminate half of the remaining elements each step.',
  rendererType: 'bar',
  pseudocode: [
    'function binarySearch(arr, target):',
    '  low = 0, high = arr.length - 1',
    '  while low <= high:',
    '    mid = floor((low + high) / 2)',
    '    if arr[mid] == target:',
    '      return mid',
    '    else if arr[mid] < target:',
    '      low = mid + 1',
    '    else:',
    '      high = mid - 1',
    '  return -1',
  ],
  inputSchema: {
    type: 'array',
    hasTarget: true,
  },
};

export const defaultInput = {
  array: [2, 5, 8, 12, 16, 23, 38, 56, 72, 91],
  target: 23,
};

/**
 * Generate step-by-step visualization for binary search.
 *
 * @param {{ array: number[], target: number }} input
 * @returns {Array} Recorded steps.
 */
export function generateSteps(input) {
  const { array, target } = input;
  const arr = [...array];
  const recorder = new StepRecorder();

  let low = 0;
  let high = arr.length - 1;

  // Initial state
  recorder.add(
    'compare',
    [],
    1,
    `Starting binary search for target ${target}. low = ${low}, high = ${high}.`,
    arr,
    { target, low, high }
  );

  while (low <= high) {
    const mid = Math.floor((low + high) / 2);

    // Show current pointers
    recorder.add(
      'compare',
      [low, mid, high],
      3,
      `low = ${low}, mid = ${mid}, high = ${high}. Checking arr[${mid}] = ${arr[mid]}.`,
      arr,
      { target, low, mid, high }
    );

    if (arr[mid] === target) {
      recorder.add(
        'found',
        [mid],
        5,
        `Target ${target} found at index ${mid}.`,
        arr,
        { target, foundIndex: mid, low, mid, high }
      );
      return recorder.getSteps();
    } else if (arr[mid] < target) {
      // Eliminate left half
      const oldLow = low;
      low = mid + 1;
      recorder.add(
        'eliminate',
        Array.from({ length: mid - oldLow + 1 }, (_, k) => oldLow + k),
        7,
        `arr[${mid}] = ${arr[mid]} < ${target}. Eliminating left half. New low = ${low}.`,
        arr,
        { target, low, high, eliminatedRange: [oldLow, mid] }
      );
    } else {
      // Eliminate right half
      const oldHigh = high;
      high = mid - 1;
      recorder.add(
        'eliminate',
        Array.from({ length: oldHigh - mid + 1 }, (_, k) => mid + k),
        9,
        `arr[${mid}] = ${arr[mid]} > ${target}. Eliminating right half. New high = ${high}.`,
        arr,
        { target, low, high, eliminatedRange: [mid, oldHigh] }
      );
    }
  }

  // Target not found
  recorder.add(
    'not-found',
    [],
    10,
    `Target ${target} not found in the array.`,
    arr,
    { target }
  );

  return recorder.getSteps();
}
