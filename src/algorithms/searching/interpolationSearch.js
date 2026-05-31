import StepRecorder from '../../engine/StepRecorder';

export const meta = {
  name: 'Interpolation Search',
  slug: 'interpolation-search',
  category: 'searching',
  timeComplexity: { best: 'O(1)', average: 'O(log log n)', worst: 'O(n)' },
  spaceComplexity: 'O(1)',
  description:
    'Interpolation search improves on binary search for uniformly distributed sorted arrays by estimating the position of the target using linear interpolation between the boundary values.',
  rendererType: 'bar',
  pseudocode: [
    'function interpolationSearch(arr, target):',
    '  low = 0, high = arr.length - 1',
    '  while low <= high and target >= arr[low] and target <= arr[high]:',
    '    if low == high:',
    '      if arr[low] == target: return low',
    '      else: return -1',
    '    pos = low + floor(((target - arr[low]) * (high - low)) / (arr[high] - arr[low]))',
    '    if arr[pos] == target:',
    '      return pos',
    '    if arr[pos] < target:',
    '      low = pos + 1',
    '    else:',
    '      high = pos - 1',
    '  return -1',
  ],
  inputSchema: {
    type: 'array',
    hasTarget: true,
  },
};

export const defaultInput = {
  array: [10, 20, 30, 40, 50, 60, 70, 80, 90, 100],
  target: 70,
};

/**
 * Generate step-by-step visualization for interpolation search.
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
    `Starting interpolation search for target ${target}. low = ${low}, high = ${high}.`,
    arr,
    { target, low, high }
  );

  while (low <= high && target >= arr[low] && target <= arr[high]) {
    if (low === high) {
      recorder.add(
        'compare',
        [low],
        3,
        `low == high == ${low}. Checking arr[${low}] = ${arr[low]}.`,
        arr,
        { target, low, high }
      );

      if (arr[low] === target) {
        recorder.add(
          'found',
          [low],
          4,
          `Target ${target} found at index ${low}.`,
          arr,
          { target, foundIndex: low }
        );
        return recorder.getSteps();
      } else {
        recorder.add(
          'not-found',
          [],
          5,
          `arr[${low}] = ${arr[low]} != ${target}. Target not found.`,
          arr,
          { target }
        );
        return recorder.getSteps();
      }
    }

    // Calculate the probe position using interpolation formula
    const pos = low + Math.floor(
      ((target - arr[low]) * (high - low)) / (arr[high] - arr[low])
    );

    recorder.add(
      'compare',
      [low, pos, high],
      6,
      `Interpolated position: pos = ${pos} (low = ${low}, high = ${high}). Checking arr[${pos}] = ${arr[pos]}.`,
      arr,
      { target, low, high, pos }
    );

    if (arr[pos] === target) {
      recorder.add(
        'found',
        [pos],
        8,
        `Target ${target} found at index ${pos}.`,
        arr,
        { target, foundIndex: pos }
      );
      return recorder.getSteps();
    }

    if (arr[pos] < target) {
      const oldLow = low;
      low = pos + 1;
      recorder.add(
        'eliminate',
        Array.from({ length: pos - oldLow + 1 }, (_, k) => oldLow + k),
        10,
        `arr[${pos}] = ${arr[pos]} < ${target}. Moving low to ${low}.`,
        arr,
        { target, low, high, eliminatedRange: [oldLow, pos] }
      );
    } else {
      const oldHigh = high;
      high = pos - 1;
      recorder.add(
        'eliminate',
        Array.from({ length: oldHigh - pos + 1 }, (_, k) => pos + k),
        12,
        `arr[${pos}] = ${arr[pos]} > ${target}. Moving high to ${high}.`,
        arr,
        { target, low, high, eliminatedRange: [pos, oldHigh] }
      );
    }
  }

  recorder.add(
    'not-found',
    [],
    13,
    `Target ${target} is outside the range [${arr[low]}, ${arr[high]}]. Not found.`,
    arr,
    { target }
  );

  return recorder.getSteps();
}
