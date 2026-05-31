import StepRecorder from '../../engine/StepRecorder';

export const meta = {
  name: 'Ternary Search',
  slug: 'ternary-search',
  category: 'searching',
  timeComplexity: { best: 'O(1)', average: 'O(log n)', worst: 'O(log n)' },
  spaceComplexity: 'O(1)',
  description:
    'Ternary search divides a sorted array into three parts and determines which part the target lies in, eliminating two-thirds of the remaining elements each step.',
  rendererType: 'bar',
  pseudocode: [
    'function ternarySearch(arr, target):',
    '  low = 0, high = arr.length - 1',
    '  while low <= high:',
    '    mid1 = low + floor((high - low) / 3)',
    '    mid2 = high - floor((high - low) / 3)',
    '    if arr[mid1] == target:',
    '      return mid1',
    '    if arr[mid2] == target:',
    '      return mid2',
    '    if target < arr[mid1]:',
    '      high = mid1 - 1',
    '    else if target > arr[mid2]:',
    '      low = mid2 + 1',
    '    else:',
    '      low = mid1 + 1',
    '      high = mid2 - 1',
    '  return -1',
  ],
  inputSchema: {
    type: 'array',
    hasTarget: true,
  },
};

export const defaultInput = {
  array: [1, 4, 7, 10, 14, 19, 22, 28, 33, 41, 55, 68],
  target: 22,
};

/**
 * Generate step-by-step visualization for ternary search.
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

  recorder.add(
    'compare',
    [],
    1,
    `Starting ternary search for target ${target}. low = ${low}, high = ${high}.`,
    arr,
    { target, low, high }
  );

  while (low <= high) {
    const mid1 = low + Math.floor((high - low) / 3);
    const mid2 = high - Math.floor((high - low) / 3);

    // Show the two mid pointers
    recorder.add(
      'compare',
      [low, mid1, mid2, high],
      3,
      `low = ${low}, mid1 = ${mid1}, mid2 = ${mid2}, high = ${high}. Checking arr[${mid1}] = ${arr[mid1]} and arr[${mid2}] = ${arr[mid2]}.`,
      arr,
      { target, low, mid1, mid2, high }
    );

    if (arr[mid1] === target) {
      recorder.add(
        'found',
        [mid1],
        6,
        `Target ${target} found at index ${mid1}.`,
        arr,
        { target, foundIndex: mid1 }
      );
      return recorder.getSteps();
    }

    if (arr[mid2] === target) {
      recorder.add(
        'found',
        [mid2],
        8,
        `Target ${target} found at index ${mid2}.`,
        arr,
        { target, foundIndex: mid2 }
      );
      return recorder.getSteps();
    }

    if (target < arr[mid1]) {
      const oldHigh = high;
      high = mid1 - 1;
      recorder.add(
        'eliminate',
        Array.from({ length: oldHigh - mid1 + 1 }, (_, k) => mid1 + k),
        10,
        `${target} < arr[${mid1}] = ${arr[mid1]}. Searching left third. New high = ${high}.`,
        arr,
        { target, low, high, eliminatedRange: [mid1, oldHigh] }
      );
    } else if (target > arr[mid2]) {
      const oldLow = low;
      low = mid2 + 1;
      recorder.add(
        'eliminate',
        Array.from({ length: mid2 - oldLow + 1 }, (_, k) => oldLow + k),
        12,
        `${target} > arr[${mid2}] = ${arr[mid2]}. Searching right third. New low = ${low}.`,
        arr,
        { target, low, high, eliminatedRange: [oldLow, mid2] }
      );
    } else {
      const oldLow = low;
      const oldHigh = high;
      low = mid1 + 1;
      high = mid2 - 1;
      const eliminatedLeft = Array.from({ length: mid1 - oldLow + 1 }, (_, k) => oldLow + k);
      const eliminatedRight = Array.from({ length: oldHigh - mid2 + 1 }, (_, k) => mid2 + k);
      recorder.add(
        'eliminate',
        [...eliminatedLeft, ...eliminatedRight],
        14,
        `Target is between arr[${mid1}] and arr[${mid2}]. Searching middle third. low = ${low}, high = ${high}.`,
        arr,
        { target, low, high, eliminatedRange: [[oldLow, mid1], [mid2, oldHigh]] }
      );
    }
  }

  recorder.add(
    'not-found',
    [],
    16,
    `Target ${target} not found in the array.`,
    arr,
    { target }
  );

  return recorder.getSteps();
}
