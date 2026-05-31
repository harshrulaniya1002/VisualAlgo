import StepRecorder from '../../engine/StepRecorder';

export const meta = {
  name: 'Count Set Bits',
  slug: 'count-set-bits',
  category: 'bit-manipulation',
  timeComplexity: { best: 'O(1)', average: 'O(log n)', worst: 'O(log n)' },
  spaceComplexity: 'O(1)',
  description:
    "Brian Kernighan's algorithm counts the number of set bits (1-bits) in a number by repeatedly clearing the lowest set bit using n & (n - 1). Each iteration removes exactly one set bit, so the loop runs as many times as there are 1-bits.",
  rendererType: 'bar',
  pseudocode: [
    'function countSetBits(n):',
    '  count = 0',
    '  while n > 0:',
    '    n = n & (n - 1)',
    '    count += 1',
    '  return count',
  ],
  inputSchema: {
    type: 'array',
    constraints: { minLength: 1, maxLength: 50, minValue: 0, maxValue: 999 },
  },
};

export const defaultInput = [29];

/**
 * Convert a number to its binary string representation.
 */
function toBin(n) {
  return n.toString(2);
}

/**
 * Generate step-by-step visualization for counting set bits (Brian Kernighan's algorithm).
 *
 * @param {number[]} input - Array containing the number to count bits of.
 * @returns {Array} Recorded steps.
 */
export function generateSteps(input) {
  const recorder = new StepRecorder();
  let n = input[0] !== undefined ? input[0] : 29;
  const original = n;

  // Visual array: shows intermediate values of n as bits are cleared
  const snapshots = [original];

  recorder.add(
    'message', [], 0,
    `Count set bits of ${original} = ${toBin(original)} in binary (${toBin(original).split('').filter(c => c === '1').length} set bits)`,
    [...snapshots],
    { n: original, binary: toBin(original) }
  );

  let count = 0;
  recorder.add(
    'compute', [0], 1,
    `Initialize count = 0, n = ${n} (${toBin(n)})`,
    [...snapshots],
    { n, count }
  );

  while (n > 0) {
    const prev = n;
    const nMinus1 = n - 1;

    recorder.add(
      'compare', [snapshots.length - 1], 2,
      `n = ${prev} (${toBin(prev)}) > 0, continue loop`,
      [...snapshots],
      { n: prev, binary: toBin(prev) }
    );

    recorder.add(
      'compute', [snapshots.length - 1], 3,
      `n & (n-1) = ${toBin(prev)} & ${toBin(nMinus1)} = ${prev} & ${nMinus1}`,
      [...snapshots],
      { n: prev, nMinus1, binary_n: toBin(prev), binary_nMinus1: toBin(nMinus1) }
    );

    n = n & (n - 1);
    count++;
    snapshots.push(n);

    recorder.add(
      'highlight', [snapshots.length - 1], 4,
      `Lowest set bit cleared: ${prev} (${toBin(prev)}) -> ${n} (${toBin(n)}). count = ${count}`,
      [...snapshots],
      { prevN: prev, newN: n, count }
    );
  }

  recorder.add(
    'compare', [snapshots.length - 1], 2,
    `n = 0, loop ends`,
    [...snapshots],
    { n: 0 }
  );

  recorder.add(
    'sorted', [], 5,
    `Result: ${original} (${toBin(original)}) has ${count} set bits`,
    [...snapshots],
    { original, count }
  );

  return recorder.getSteps();
}
