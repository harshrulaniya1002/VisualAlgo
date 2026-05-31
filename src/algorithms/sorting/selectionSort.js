import StepRecorder from '../../engine/StepRecorder';

export const meta = {
  name: 'Selection Sort',
  slug: 'selection-sort',
  category: 'sorting',
  timeComplexity: {
    best: 'O(n^2)',
    average: 'O(n^2)',
    worst: 'O(n^2)',
  },
  spaceComplexity: 'O(1)',
  stable: false,
  description:
    'Selection Sort divides the input into a sorted and an unsorted region. It repeatedly selects the smallest element from the unsorted region and moves it to the end of the sorted region.',
  rendererType: 'bar',
  pseudocode: [
    'for i = 0 to n - 1',
    '  minIdx = i',
    '  for j = i + 1 to n - 1',
    '    if arr[j] < arr[minIdx]',
    '      minIdx = j',
    '  swap(arr[i], arr[minIdx])',
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

export const defaultInput = [64, 25, 12, 22, 11];

export function generateSteps(input) {
  const recorder = new StepRecorder();
  const arr = [...input];
  const n = arr.length;

  recorder.add(
    'message',
    [],
    0,
    `Starting Selection Sort on array of ${n} elements`,
    [...arr],
    {}
  );

  for (let i = 0; i < n - 1; i++) {
    let minIdx = i;

    recorder.add(
      'highlight',
      [i],
      1,
      `Set minIdx = ${i}, current minimum value = ${arr[i]}`,
      [...arr],
      {}
    );

    for (let j = i + 1; j < n; j++) {
      // Compare current element with current minimum
      recorder.add(
        'compare',
        [j, minIdx],
        3,
        `Compare arr[${j}] = ${arr[j]} with current min arr[${minIdx}] = ${arr[minIdx]}`,
        [...arr],
        {}
      );

      if (arr[j] < arr[minIdx]) {
        minIdx = j;

        recorder.add(
          'highlight',
          [minIdx],
          4,
          `New minimum found: arr[${minIdx}] = ${arr[minIdx]}`,
          [...arr],
          {}
        );
      }
    }

    if (minIdx !== i) {
      // Swap the found minimum with the first unsorted element
      [arr[i], arr[minIdx]] = [arr[minIdx], arr[i]];

      recorder.add(
        'swap',
        [i, minIdx],
        5,
        `Swap arr[${i}] and arr[${minIdx}] -> placed ${arr[i]} at position ${i}`,
        [...arr],
        {}
      );
    } else {
      recorder.add(
        'message',
        [i],
        5,
        `Element ${arr[i]} is already in the correct position`,
        [...arr],
        {}
      );
    }

    // Mark element as sorted
    recorder.add(
      'sorted',
      [i],
      0,
      `Element ${arr[i]} is now in its sorted position at index ${i}`,
      [...arr],
      {}
    );
  }

  // Mark last element as sorted
  recorder.add(
    'sorted',
    [n - 1],
    0,
    `Element ${arr[n - 1]} is in its sorted position`,
    [...arr],
    {}
  );

  recorder.add('message', [], 0, 'Selection Sort complete!', [...arr], {});

  return recorder.getSteps();
}
