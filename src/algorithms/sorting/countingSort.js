import StepRecorder from '../../engine/StepRecorder';

export const meta = {
  name: 'Counting Sort',
  slug: 'counting-sort',
  category: 'sorting',
  timeComplexity: {
    best: 'O(n + k)',
    average: 'O(n + k)',
    worst: 'O(n + k)',
  },
  spaceComplexity: 'O(n + k)',
  stable: true,
  description:
    'Counting Sort is a non-comparison integer sorting algorithm. It counts the number of occurrences of each distinct value, computes prefix sums, and uses them to place each element in its correct sorted position. It is efficient when the range of input values (k) is not significantly larger than the number of elements (n).',
  rendererType: 'bar',
  pseudocode: [
    'find max value in arr',
    'create count array of size max + 1',
    'for each element in arr',
    '  count[element]++',
    'for i = 1 to max',
    '  count[i] += count[i - 1]',
    'for i = n - 1 down to 0',
    '  output[count[arr[i]] - 1] = arr[i]',
    '  count[arr[i]]--',
    'copy output to arr',
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

export const defaultInput = [4, 2, 2, 8, 3, 3, 1];

export function generateSteps(input) {
  const recorder = new StepRecorder();
  const arr = [...input];
  const n = arr.length;

  recorder.add(
    'message',
    [],
    0,
    `Starting Counting Sort on array of ${n} elements`,
    [...arr],
    {}
  );

  // Find max value
  const max = Math.max(...arr);

  recorder.add(
    'message',
    [],
    0,
    `Maximum value found: ${max}. Creating count array of size ${max + 1}`,
    [...arr],
    {}
  );

  // Count occurrences
  const count = new Array(max + 1).fill(0);

  for (let i = 0; i < n; i++) {
    recorder.add(
      'highlight',
      [i],
      2,
      `Count element arr[${i}] = ${arr[i]}`,
      [...arr],
      { count: [...count] }
    );

    count[arr[i]]++;

    recorder.add(
      'message',
      [i],
      3,
      `count[${arr[i]}] = ${count[arr[i]]}`,
      [...arr],
      { count: [...count] }
    );
  }

  recorder.add(
    'message',
    [],
    4,
    `Count array: [${count.join(', ')}]. Computing prefix sums.`,
    [...arr],
    { count: [...count] }
  );

  // Compute prefix sums
  for (let i = 1; i <= max; i++) {
    count[i] += count[i - 1];

    recorder.add(
      'message',
      [],
      5,
      `Prefix sum: count[${i}] = ${count[i]}`,
      [...arr],
      { count: [...count] }
    );
  }

  // Build output array
  const output = new Array(n);

  recorder.add(
    'message',
    [],
    6,
    'Building sorted output array by scanning input right to left',
    [...arr],
    {}
  );

  for (let i = n - 1; i >= 0; i--) {
    const val = arr[i];
    const pos = count[val] - 1;
    output[pos] = val;
    count[val]--;

    recorder.add(
      'highlight',
      [i],
      7,
      `Place arr[${i}] = ${val} at output position ${pos}`,
      [...arr],
      { output: [...output], count: [...count] }
    );
  }

  // Copy output back to arr
  for (let i = 0; i < n; i++) {
    arr[i] = output[i];
  }

  recorder.add(
    'message',
    [],
    9,
    'Copy output array back to original array',
    [...arr],
    {}
  );

  // Mark all as sorted
  for (let i = 0; i < n; i++) {
    recorder.add(
      'sorted',
      [i],
      9,
      `Element ${arr[i]} is in its sorted position`,
      [...arr],
      {}
    );
  }

  recorder.add('message', [], 0, 'Counting Sort complete!', [...arr], {});

  return recorder.getSteps();
}
