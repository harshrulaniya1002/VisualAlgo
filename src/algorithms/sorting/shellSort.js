import StepRecorder from '../../engine/StepRecorder';

export const meta = {
  name: 'Shell Sort',
  slug: 'shell-sort',
  category: 'sorting',
  timeComplexity: {
    best: 'O(n log n)',
    average: 'O(n^(3/2))',
    worst: 'O(n^2)',
  },
  spaceComplexity: 'O(1)',
  stable: false,
  description:
    'Shell Sort is a generalization of insertion sort that allows the exchange of items that are far apart. It starts by sorting pairs of elements far apart from each other, then progressively reduces the gap between elements to be compared. The gap sequence used here is the classic Shell sequence (n/2, n/4, ..., 1).',
  rendererType: 'bar',
  pseudocode: [
    'gap = floor(n / 2)',
    'while gap > 0',
    '  for i = gap to n - 1',
    '    temp = arr[i]',
    '    j = i',
    '    while j >= gap and arr[j - gap] > temp',
    '      arr[j] = arr[j - gap]',
    '      j -= gap',
    '    arr[j] = temp',
    '  gap = floor(gap / 2)',
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

export const defaultInput = [35, 33, 42, 10, 14, 19, 27, 44];

export function generateSteps(input) {
  const recorder = new StepRecorder();
  const arr = [...input];
  const n = arr.length;

  recorder.add(
    'message',
    [],
    0,
    `Starting Shell Sort on array of ${n} elements`,
    [...arr],
    {}
  );

  let gap = Math.floor(n / 2);

  while (gap > 0) {
    recorder.add(
      'message',
      [],
      0,
      `Current gap = ${gap}. Performing gapped insertion sort.`,
      [...arr],
      { gap }
    );

    for (let i = gap; i < n; i++) {
      const temp = arr[i];
      let j = i;

      recorder.add(
        'highlight',
        [i],
        3,
        `Pick element arr[${i}] = ${temp}, compare with elements ${gap} positions apart`,
        [...arr],
        { gap }
      );

      while (j >= gap && arr[j - gap] > temp) {
        recorder.add(
          'compare',
          [j - gap, j],
          5,
          `arr[${j - gap}] = ${arr[j - gap]} > temp = ${temp}, shift right`,
          [...arr],
          { gap }
        );

        arr[j] = arr[j - gap];

        recorder.add(
          'swap',
          [j - gap, j],
          6,
          `Shift arr[${j - gap}] = ${arr[j]} to position ${j}`,
          [...arr],
          { gap }
        );

        j -= gap;
      }

      if (j >= gap) {
        recorder.add(
          'compare',
          [j - gap, j],
          5,
          `arr[${j - gap}] = ${arr[j - gap]} <= temp = ${temp}, stop`,
          [...arr],
          { gap }
        );
      }

      arr[j] = temp;

      recorder.add(
        'highlight',
        [j],
        8,
        `Place temp = ${temp} at position ${j}`,
        [...arr],
        { gap }
      );
    }

    recorder.add(
      'message',
      [],
      9,
      `Gap ${gap} pass complete. Array: [${arr.join(', ')}]`,
      [...arr],
      { gap }
    );

    gap = Math.floor(gap / 2);
  }

  // Mark all as sorted
  for (let i = 0; i < n; i++) {
    recorder.add(
      'sorted',
      [i],
      0,
      `Element ${arr[i]} is in its sorted position`,
      [...arr],
      {}
    );
  }

  recorder.add('message', [], 0, 'Shell Sort complete!', [...arr], {});

  return recorder.getSteps();
}
