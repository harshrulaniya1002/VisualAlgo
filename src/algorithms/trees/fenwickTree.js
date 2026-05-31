import StepRecorder from '../../engine/StepRecorder';

export const meta = {
  name: 'Fenwick Tree (Binary Indexed Tree)',
  slug: 'fenwick-tree',
  category: 'trees',
  timeComplexity: { best: 'O(log n)', average: 'O(log n)', worst: 'O(log n)' },
  spaceComplexity: 'O(n)',
  description:
    'A compact tree structure for efficient prefix sum queries and point updates using bit manipulation. Uses the lowest set bit to determine ranges each index is responsible for.',
  rendererType: 'bar',
  pseudocode: [
    'function update(i, delta):',
    '  while i <= n: BIT[i] += delta, i += i & (-i)',
    'function query(i):',
    '  sum = 0',
    '  while i > 0: sum += BIT[i], i -= i & (-i)',
    '  return sum',
  ],
  inputSchema: {
    type: 'array',
    constraints: { minLength: 2, maxLength: 16, minValue: 1, maxValue: 50 },
  },
};

export const defaultInput = [3, 2, -1, 6, 5, 4, -3, 3];

export function generateSteps(input) {
  const recorder = new StepRecorder();
  const n = input.length;
  const bit = new Array(n + 1).fill(0);

  recorder.add('message', [], 0, `Building Fenwick Tree (BIT) for array [${input.join(', ')}]`, [...bit], {});

  function update(i, delta) {
    const origI = i;
    while (i <= n) {
      recorder.add('compare', [i], 1, `BIT[${i}] += ${delta} (was ${bit[i]}, now ${bit[i] + delta})`, [...bit], {});
      bit[i] += delta;
      recorder.add('swap', [i], 1, `BIT[${i}] = ${bit[i]}. Next: i += i & (-i) = ${i} + ${i & (-i)} = ${i + (i & (-i))}`, [...bit], {});
      i += i & (-i);
    }
    recorder.add('visit', [origI], 1, `Update complete for index ${origI}`, [...bit], {});
  }

  // Build BIT by updating each element
  for (let i = 0; i < n; i++) {
    recorder.add('message', [], 0, `Inserting arr[${i}] = ${input[i]} into BIT`, [...bit], {});
    update(i + 1, input[i]);
  }

  recorder.add('sorted', [], 0, `BIT construction complete: [${bit.join(', ')}]`, [...bit], {});

  // Demonstrate prefix sum query
  function query(i) {
    let sum = 0;
    recorder.add('message', [], 2, `Querying prefix sum up to index ${i}`, [...bit], {});
    while (i > 0) {
      recorder.add('compare', [i], 3, `sum += BIT[${i}] = ${bit[i]} (running sum = ${sum + bit[i]})`, [...bit], {});
      sum += bit[i];
      recorder.add('visit', [i], 4, `Next: i -= i & (-i) = ${i} - ${i & (-i)} = ${i - (i & (-i))}`, [...bit], {});
      i -= i & (-i);
    }
    return sum;
  }

  const qIdx = Math.min(5, n);
  const result = query(qIdx);
  recorder.add('message', [], 4, `Prefix sum [1..${qIdx}] = ${result}`, [...bit], {});

  // Range query
  const l = 2, r = Math.min(5, n);
  const rangeSum = query(r) - query(l - 1);
  recorder.add('message', [], 4, `Range sum [${l}..${r}] = prefixSum(${r}) - prefixSum(${l - 1}) = ${rangeSum}`, [...bit], {});

  return recorder.getSteps();
}
