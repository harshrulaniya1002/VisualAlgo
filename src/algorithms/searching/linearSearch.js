import StepRecorder from '../../engine/StepRecorder';

export const meta = {
  name: 'Linear Search',
  slug: 'linear-search',
  category: 'searching',
  timeComplexity: { best: 'O(1)', average: 'O(n)', worst: 'O(n)' },
  spaceComplexity: 'O(1)',
  description:
    'Linear search sequentially checks each element in the array until the target is found or the end is reached. It works on both sorted and unsorted arrays.',
  rendererType: 'bar',
  pseudocode: [
    'function linearSearch(arr, target):',
    '  for i = 0 to arr.length - 1:',
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
  array: [10, 23, 45, 70, 11, 15],
  target: 70,
};

/**
 * Generate step-by-step visualization for linear search.
 *
 * @param {{ array: number[], target: number }} input
 * @returns {Array} Recorded steps.
 */
export function generateSteps(input) {
  const { array, target } = input;
  const arr = [...array];
  const recorder = new StepRecorder();

  // Initial state
  recorder.add(
    'compare',
    [],
    0,
    `Starting linear search for target ${target} in array of ${arr.length} elements.`,
    arr,
    { target }
  );

  for (let i = 0; i < arr.length; i++) {
    // Comparing current element
    recorder.add(
      'compare',
      [i],
      2,
      `Comparing arr[${i}] = ${arr[i]} with target ${target}.`,
      arr,
      { target, currentIndex: i }
    );

    if (arr[i] === target) {
      recorder.add(
        'found',
        [i],
        3,
        `Target ${target} found at index ${i}.`,
        arr,
        { target, foundIndex: i }
      );
      return recorder.getSteps();
    }
  }

  // Target not found
  recorder.add(
    'not-found',
    [],
    4,
    `Target ${target} not found in the array.`,
    arr,
    { target }
  );

  return recorder.getSteps();
}
