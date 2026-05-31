import StepRecorder from '../../engine/StepRecorder';

export const meta = {
  name: 'Prefix Sum',
  slug: 'prefix-sum',
  category: 'arrays-strings',
  timeComplexity: { best: 'O(n)', average: 'O(n)', worst: 'O(n)' },
  spaceComplexity: 'O(n)',
  description:
    'Prefix Sum precomputes a cumulative sum array so that any range sum query can be answered in O(1) time. prefix[i] stores the sum of elements from index 0 to i.',
  rendererType: 'bar',
  pseudocode: [
    'prefix[0] = arr[0]',
    'for i = 1 to n - 1:',
    '  prefix[i] = prefix[i-1] + arr[i]',
    'rangeSum(l, r) =',
    '  prefix[r] - (l > 0 ? prefix[l-1] : 0)',
  ],
  inputSchema: {
    type: 'array',
    constraints: { minLength: 2, maxLength: 50, minValue: 0, maxValue: 999 },
  },
};

export const defaultInput = [3, 1, 4, 1, 5, 9, 2, 6];

export function generateSteps(input) {
  const recorder = new StepRecorder();
  const arr = [...input];
  const n = arr.length;
  const prefix = new Array(n);

  recorder.add('message', [], 0,
    `Building prefix sum array for ${n} elements`,
    [...arr], {});

  // Build prefix sum
  prefix[0] = arr[0];
  recorder.add('compute', [0], 0,
    `prefix[0] = arr[0] = ${arr[0]}`,
    [...prefix], { prefix: [...prefix] });

  for (let i = 1; i < n; i++) {
    prefix[i] = prefix[i - 1] + arr[i];
    recorder.add('compute', [i - 1, i], 2,
      `prefix[${i}] = prefix[${i - 1}] + arr[${i}] = ${prefix[i - 1]} + ${arr[i]} = ${prefix[i]}`,
      [...prefix], { prefix: [...prefix] });
  }

  recorder.add('sorted', Array.from({ length: n }, (_, i) => i), 0,
    `Prefix sum array built: [${prefix.join(', ')}]`,
    [...prefix], { prefix: [...prefix] });

  // Demonstrate a few range sum queries
  const queries = [];
  if (n >= 4) queries.push([1, 3]);
  if (n >= 6) queries.push([2, 5]);
  if (n >= 2) queries.push([0, n - 1]);

  for (const [l, r] of queries) {
    const rangeSum = prefix[r] - (l > 0 ? prefix[l - 1] : 0);
    const rangeIndices = [];
    for (let k = l; k <= r; k++) rangeIndices.push(k);

    recorder.add('highlight', [l, r], 4,
      `Query rangeSum(${l}, ${r}) = prefix[${r}]${l > 0 ? ` - prefix[${l - 1}]` : ''} = ${prefix[r]}${l > 0 ? ` - ${prefix[l - 1]}` : ''} = ${rangeSum}`,
      [...arr], { l, r, rangeSum, prefix: [...prefix] });

    recorder.add('found', rangeIndices, 4,
      `Sum of arr[${l}..${r}] = ${rangeSum}`,
      [...arr], { l, r, rangeSum });
  }

  recorder.add('message', [], 0,
    'Prefix Sum complete! Range queries can now be answered in O(1).',
    [...arr], { prefix: [...prefix] });

  return recorder.getSteps();
}
