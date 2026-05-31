import StepRecorder from '../../engine/StepRecorder';

export const meta = {
  name: 'Exponential Search',
  slug: 'exponential-search',
  category: 'searching',
  timeComplexity: { best: 'O(1)', average: 'O(log n)', worst: 'O(log n)' },
  spaceComplexity: 'O(1)',
  description:
    'Exponential search finds the range where the target may lie by repeatedly doubling the index, then performs a binary search within that range. It is especially useful for unbounded or infinite arrays.',
  rendererType: 'bar',
  pseudocode: [
    'function exponentialSearch(arr, target):',
    '  if arr[0] == target:',
    '    return 0',
    '  i = 1',
    '  while i < n and arr[i] <= target:',
    '    i = i * 2',
    '  // Binary search in range [i/2, min(i, n-1)]',
    '  low = floor(i / 2), high = min(i, n - 1)',
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
  array: [3, 6, 9, 12, 18, 24, 30, 42, 55, 67, 78, 90, 100],
  target: 42,
};

/**
 * Generate step-by-step visualization for exponential search.
 *
 * @param {{ array: number[], target: number }} input
 * @returns {Array} Recorded steps.
 */
export function generateSteps(input) {
  const { array, target } = input;
  const arr = [...array];
  const n = arr.length;
  const recorder = new StepRecorder();

  recorder.add(
    'compare',
    [],
    0,
    `Starting exponential search for target ${target} in array of ${n} elements.`,
    arr,
    { target }
  );

  // Check first element
  if (arr[0] === target) {
    recorder.add(
      'found',
      [0],
      2,
      `Target ${target} found at index 0.`,
      arr,
      { target, foundIndex: 0 }
    );
    return recorder.getSteps();
  }

  recorder.add(
    'compare',
    [0],
    1,
    `arr[0] = ${arr[0]} != ${target}. Starting exponential expansion.`,
    arr,
    { target, currentIndex: 0 }
  );

  // Find range by doubling i
  let i = 1;
  while (i < n && arr[i] <= target) {
    recorder.add(
      'compare',
      [i],
      4,
      `Exponential jump: arr[${i}] = ${arr[i]} <= ${target}. Doubling bound.`,
      arr,
      { target, currentBound: i }
    );
    i = i * 2;
  }

  if (i < n) {
    recorder.add(
      'compare',
      [i],
      4,
      `arr[${i}] = ${arr[i]} > ${target}. Range found: [${Math.floor(i / 2)}, ${Math.min(i, n - 1)}].`,
      arr,
      { target, rangeStart: Math.floor(i / 2), rangeEnd: Math.min(i, n - 1) }
    );
  } else {
    recorder.add(
      'compare',
      [],
      4,
      `Bound ${i} exceeds array length. Range: [${Math.floor(i / 2)}, ${n - 1}].`,
      arr,
      { target, rangeStart: Math.floor(i / 2), rangeEnd: n - 1 }
    );
  }

  // Binary search within the identified range
  let low = Math.floor(i / 2);
  let high = Math.min(i, n - 1);

  recorder.add(
    'compare',
    [low, high],
    7,
    `Binary search phase: low = ${low}, high = ${high}.`,
    arr,
    { target, low, high }
  );

  while (low <= high) {
    const mid = Math.floor((low + high) / 2);

    recorder.add(
      'compare',
      [low, mid, high],
      9,
      `Binary search: low = ${low}, mid = ${mid}, high = ${high}. Checking arr[${mid}] = ${arr[mid]}.`,
      arr,
      { target, low, mid, high }
    );

    if (arr[mid] === target) {
      recorder.add(
        'found',
        [mid],
        11,
        `Target ${target} found at index ${mid}.`,
        arr,
        { target, foundIndex: mid }
      );
      return recorder.getSteps();
    } else if (arr[mid] < target) {
      low = mid + 1;
      recorder.add(
        'eliminate',
        Array.from({ length: mid - Math.floor(i / 2) + 1 }, (_, k) => Math.floor(i / 2) + k).filter(idx => idx <= mid),
        13,
        `arr[${mid}] = ${arr[mid]} < ${target}. Moving low to ${low}.`,
        arr,
        { target, low, high }
      );
    } else {
      high = mid - 1;
      recorder.add(
        'eliminate',
        Array.from({ length: Math.min(i, n - 1) - mid + 1 }, (_, k) => mid + k).filter(idx => idx >= mid),
        15,
        `arr[${mid}] = ${arr[mid]} > ${target}. Moving high to ${high}.`,
        arr,
        { target, low, high }
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
