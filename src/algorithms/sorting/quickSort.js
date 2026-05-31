import StepRecorder from '../../engine/StepRecorder';

export const meta = {
  name: 'Quick Sort',
  slug: 'quick-sort',
  category: 'sorting',
  timeComplexity: {
    best: 'O(n log n)',
    average: 'O(n log n)',
    worst: 'O(n^2)',
  },
  spaceComplexity: 'O(log n)',
  stable: false,
  description:
    'Quick Sort is a divide-and-conquer algorithm that selects a pivot element and partitions the array around it, placing smaller elements before the pivot and larger elements after it. It then recursively sorts the sub-arrays.',
  rendererType: 'bar',
  pseudocode: [
    'quickSort(arr, low, high)',
    '  if low < high',
    '    pi = partition(arr, low, high)',
    '    quickSort(arr, low, pi - 1)',
    '    quickSort(arr, pi + 1, high)',
    'partition(arr, low, high):',
    '  pivot = arr[high]',
    '  i = low - 1',
    '  for j = low to high - 1',
    '    if arr[j] < pivot',
    '      i++',
    '      swap(arr[i], arr[j])',
    '  swap(arr[i + 1], arr[high])',
    '  return i + 1',
  ],
  inputSchema: {
    type: 'array',
    constraints: {
      minLength: 2,
      maxLength: 50,
      minValue: 0,
      maxValue: 999,
    },
  },
};

export const defaultInput = [10, 80, 30, 90, 40, 50, 70];

export function generateSteps(input) {
  const recorder = new StepRecorder();
  const arr = [...input];
  const n = arr.length;

  recorder.add(
    'message',
    [],
    0,
    `Starting Quick Sort on array of ${n} elements`,
    [...arr],
    {}
  );

  function partition(low, high) {
    const pivot = arr[high];

    recorder.add(
      'partition',
      [high],
      6,
      `Choose pivot = arr[${high}] = ${pivot}`,
      [...arr],
      { pivot, low, high }
    );

    let i = low - 1;

    recorder.add(
      'message',
      [],
      7,
      `Initialize i = ${i} (boundary for elements smaller than pivot)`,
      [...arr],
      {}
    );

    for (let j = low; j < high; j++) {
      recorder.add(
        'compare',
        [j, high],
        9,
        `Compare arr[${j}] = ${arr[j]} with pivot = ${pivot}`,
        [...arr],
        {}
      );

      if (arr[j] < pivot) {
        i++;

        if (i !== j) {
          [arr[i], arr[j]] = [arr[j], arr[i]];

          recorder.add(
            'swap',
            [i, j],
            11,
            `arr[${j}] = ${arr[j]} < pivot, swap arr[${i}] and arr[${j}]`,
            [...arr],
            {}
          );
        } else {
          recorder.add(
            'highlight',
            [i],
            10,
            `arr[${j}] = ${arr[j]} < pivot, already in place (i == j)`,
            [...arr],
            {}
          );
        }
      }
    }

    // Place pivot in correct position
    [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];

    recorder.add(
      'swap',
      [i + 1, high],
      12,
      `Place pivot ${pivot} at its correct position ${i + 1}`,
      [...arr],
      {}
    );

    recorder.add(
      'sorted',
      [i + 1],
      13,
      `Pivot ${pivot} is now in its final sorted position at index ${i + 1}`,
      [...arr],
      {}
    );

    return i + 1;
  }

  function quickSort(low, high) {
    if (low < high) {
      recorder.add(
        'message',
        Array.from({ length: high - low + 1 }, (_, k) => low + k),
        1,
        `QuickSort subarray [${low}..${high}]`,
        [...arr],
        { low, high }
      );

      const pi = partition(low, high);

      quickSort(low, pi - 1);
      quickSort(pi + 1, high);
    } else if (low === high) {
      recorder.add(
        'sorted',
        [low],
        0,
        `Single element arr[${low}] = ${arr[low]} is in its sorted position`,
        [...arr],
        {}
      );
    }
  }

  quickSort(0, n - 1);

  recorder.add('message', [], 0, 'Quick Sort complete!', [...arr], {});

  return recorder.getSteps();
}
