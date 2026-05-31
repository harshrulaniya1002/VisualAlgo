import StepRecorder from '../../engine/StepRecorder';

export const meta = {
  name: 'Power of Two Check',
  slug: 'power-of-two-check',
  category: 'bit-manipulation',
  timeComplexity: { best: 'O(1)', average: 'O(1)', worst: 'O(1)' },
  spaceComplexity: 'O(1)',
  description:
    'Checks whether a number is a power of two using the bit trick n & (n - 1) == 0. A power of two has exactly one set bit, so subtracting 1 flips all lower bits. ANDing gives zero only for powers of two.',
  rendererType: 'bar',
  pseudocode: [
    'function isPowerOfTwo(n):',
    '  if n <= 0: return false',
    '  return (n & (n - 1)) == 0',
    'for each number in input:',
    '  check isPowerOfTwo(number)',
  ],
  inputSchema: {
    type: 'array',
    constraints: { minLength: 1, maxLength: 50, minValue: 0, maxValue: 999 },
  },
};

export const defaultInput = [16, 15, 32, 24];

/**
 * Convert a number to its binary string representation.
 */
function toBin(n) {
  return n.toString(2);
}

/**
 * Generate step-by-step visualization for power-of-two checking.
 *
 * @param {number[]} input - Array of numbers to check.
 * @returns {Array} Recorded steps.
 */
export function generateSteps(input) {
  const recorder = new StepRecorder();
  const nums = [...input];

  recorder.add(
    'message', [], -1,
    `Checking ${nums.length} numbers to see if each is a power of two using n & (n - 1) == 0`,
    [...nums]
  );

  for (let i = 0; i < nums.length; i++) {
    const n = nums[i];

    recorder.add(
      'visit', [i], 0,
      `Checking n = ${n} (${toBin(n)} in binary)`,
      [...nums],
      { n, binary: toBin(n) }
    );

    if (n <= 0) {
      recorder.add(
        'compare', [i], 1,
        `n = ${n} <= 0, so it is NOT a power of two`,
        [...nums],
        { n, isPowerOfTwo: false }
      );
      continue;
    }

    const nMinus1 = n - 1;
    const andResult = n & nMinus1;

    recorder.add(
      'compute', [i], 2,
      `n - 1 = ${nMinus1} (${toBin(nMinus1)}). n & (n-1) = ${toBin(n)} & ${toBin(nMinus1)} = ${toBin(andResult)} = ${andResult}`,
      [...nums],
      { n, nMinus1, andResult, binary_n: toBin(n), binary_nMinus1: toBin(nMinus1) }
    );

    if (andResult === 0) {
      recorder.add(
        'found', [i], 4,
        `${n} & ${nMinus1} = 0, so ${n} IS a power of two (${n} = 2^${Math.log2(n)})`,
        [...nums],
        { n, isPowerOfTwo: true, exponent: Math.log2(n) }
      );
    } else {
      recorder.add(
        'compare', [i], 4,
        `${n} & ${nMinus1} = ${andResult} != 0, so ${n} is NOT a power of two`,
        [...nums],
        { n, isPowerOfTwo: false, andResult }
      );
    }
  }

  recorder.add(
    'sorted', [], -1,
    `Check complete. Powers of two: ${nums.filter(n => n > 0 && (n & (n - 1)) === 0).join(', ') || 'none'}`,
    [...nums]
  );

  return recorder.getSteps();
}
