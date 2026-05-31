import StepRecorder from '../../engine/StepRecorder';

export const meta = {
  name: 'Insertion Sort',
  slug: 'insertion-sort',
  category: 'sorting',
  timeComplexity: {
    best: 'O(n)',
    average: 'O(n^2)',
    worst: 'O(n^2)',
  },
  spaceComplexity: 'O(1)',
  stable: true,
  description:
    'Insertion Sort builds the sorted array one element at a time by repeatedly picking the next element and inserting it into the correct position among the previously sorted elements. It is efficient for small or nearly sorted datasets.',
  rendererType: 'bar',
  pseudocode: [
    'for i = 1 to n - 1',
    '  key = arr[i]',
    '  j = i - 1',
    '  while j >= 0 and arr[j] > key',
    '    arr[j + 1] = arr[j]',
    '    j--',
    '  arr[j + 1] = key',
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

export const defaultInput = [12, 11, 13, 5, 6];

export function generateSteps(input) {
  const recorder = new StepRecorder();
  const arr = [...input];
  const n = arr.length;

  recorder.add(
    'message',
    [],
    0,
    `Starting Insertion Sort on array of ${n} elements`,
    [...arr],
    {}
  );

  // First element is trivially sorted
  recorder.add(
    'sorted',
    [0],
    0,
    `Element arr[0] = ${arr[0]} is trivially sorted`,
    [...arr],
    {}
  );

  for (let i = 1; i < n; i++) {
    const key = arr[i];

    recorder.add(
      'highlight',
      [i],
      1,
      `Pick key = arr[${i}] = ${key} to insert into sorted portion`,
      [...arr],
      {}
    );

    let j = i - 1;

    recorder.add(
      'message',
      [i],
      2,
      `Start comparing key = ${key} with sorted elements from index ${j}`,
      [...arr],
      {}
    );

    while (j >= 0 && arr[j] > key) {
      // Compare key with element at j
      recorder.add(
        'compare',
        [j, i],
        3,
        `arr[${j}] = ${arr[j]} > key = ${key}, shift arr[${j}] right`,
        [...arr],
        {}
      );

      // Shift element right
      arr[j + 1] = arr[j];

      recorder.add(
        'swap',
        [j, j + 1],
        4,
        `Shift arr[${j}] = ${arr[j]} to position ${j + 1}`,
        [...arr],
        {}
      );

      j--;
    }

    if (j >= 0) {
      recorder.add(
        'compare',
        [j, j + 1],
        3,
        `arr[${j}] = ${arr[j]} <= key = ${key}, stop shifting`,
        [...arr],
        {}
      );
    }

    // Place key at correct position
    arr[j + 1] = key;

    recorder.add(
      'highlight',
      [j + 1],
      6,
      `Place key = ${key} at position ${j + 1}`,
      [...arr],
      {}
    );

    recorder.add(
      'sorted',
      [j + 1],
      6,
      `Element ${key} is inserted into the sorted portion`,
      [...arr],
      {}
    );
  }

  recorder.add('message', [], 0, 'Insertion Sort complete!', [...arr], {});

  return recorder.getSteps();
}
