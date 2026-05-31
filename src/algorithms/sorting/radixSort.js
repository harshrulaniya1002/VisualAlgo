import StepRecorder from '../../engine/StepRecorder';

export const meta = {
  name: 'Radix Sort',
  slug: 'radix-sort',
  category: 'sorting',
  timeComplexity: {
    best: 'O(nk)',
    average: 'O(nk)',
    worst: 'O(nk)',
  },
  spaceComplexity: 'O(n + k)',
  stable: true,
  description:
    'Radix Sort is a non-comparison integer sorting algorithm that sorts numbers digit by digit, starting from the least significant digit to the most significant. It uses a stable sub-sort (counting sort) for each digit position.',
  rendererType: 'bar',
  pseudocode: [
    'find max value to determine number of digits',
    'for each digit position (1s, 10s, 100s, ...)',
    '  create 10 buckets (0-9)',
    '  for each element in arr',
    '    place element in bucket based on current digit',
    '  collect elements from buckets back into arr',
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

export const defaultInput = [170, 45, 75, 90, 802, 24, 2, 66];

export function generateSteps(input) {
  const recorder = new StepRecorder();
  const arr = [...input];
  const n = arr.length;

  recorder.add(
    'message',
    [],
    0,
    `Starting Radix Sort on array of ${n} elements`,
    [...arr],
    {}
  );

  const max = Math.max(...arr);
  const maxDigits = max.toString().length;

  recorder.add(
    'message',
    [],
    0,
    `Maximum value: ${max}, number of digit passes: ${maxDigits}`,
    [...arr],
    {}
  );

  let exp = 1; // Current digit place: 1, 10, 100, ...

  for (let d = 0; d < maxDigits; d++) {
    const digitName = exp === 1 ? 'ones' : exp === 10 ? 'tens' : exp === 100 ? 'hundreds' : `${exp}s`;

    recorder.add(
      'message',
      [],
      1,
      `Pass ${d + 1}: Sort by ${digitName} digit (position ${d})`,
      [...arr],
      { digitPosition: d, exp }
    );

    // Counting sort by current digit
    const output = new Array(n);
    const count = new Array(10).fill(0);

    // Count occurrences of each digit
    for (let i = 0; i < n; i++) {
      const digit = Math.floor(arr[i] / exp) % 10;

      recorder.add(
        'highlight',
        [i],
        3,
        `arr[${i}] = ${arr[i]}, ${digitName} digit = ${digit}`,
        [...arr],
        { digit }
      );

      count[digit]++;
    }

    recorder.add(
      'message',
      [],
      4,
      `Digit counts: [${count.join(', ')}]`,
      [...arr],
      { count: [...count] }
    );

    // Compute prefix sums
    for (let i = 1; i < 10; i++) {
      count[i] += count[i - 1];
    }

    // Build output array (iterate right to left for stability)
    for (let i = n - 1; i >= 0; i--) {
      const digit = Math.floor(arr[i] / exp) % 10;
      const pos = count[digit] - 1;
      output[pos] = arr[i];
      count[digit]--;

      recorder.add(
        'highlight',
        [i],
        4,
        `Place ${arr[i]} (digit ${digit}) at output position ${pos}`,
        [...arr],
        { digit, pos }
      );
    }

    // Copy output back to arr
    for (let i = 0; i < n; i++) {
      arr[i] = output[i];
    }

    recorder.add(
      'message',
      [],
      5,
      `After ${digitName} digit pass: [${arr.join(', ')}]`,
      [...arr],
      {}
    );

    exp *= 10;
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

  recorder.add('message', [], 0, 'Radix Sort complete!', [...arr], {});

  return recorder.getSteps();
}
