import StepRecorder from '../../engine/StepRecorder';

export const meta = {
  name: 'Bitwise Sieve',
  slug: 'bitwise-sieve',
  category: 'bit-manipulation',
  timeComplexity: { best: 'O(n log log n)', average: 'O(n log log n)', worst: 'O(n log log n)' },
  spaceComplexity: 'O(n/32)',
  description:
    'A memory-efficient Sieve of Eratosthenes that uses a bit array instead of a boolean array. Each 32-bit integer stores 32 flags, reducing memory usage by a factor of 32. Composite numbers are marked by setting bits using bitwise OR.',
  rendererType: 'bar',
  pseudocode: [
    'sieve = array of ceil(n/32) integers, all 0',
    'for p = 2 to sqrt(n):',
    '  if bit p not set (p is prime):',
    '    for j = p*p to n step p:',
    '      set bit j (mark composite)',
    'collect all i where bit i is not set',
  ],
  inputSchema: {
    type: 'array',
    constraints: { minLength: 1, maxLength: 50, minValue: 0, maxValue: 999 },
  },
};

export const defaultInput = [50];

/**
 * Check if a bit is set in the sieve array.
 */
function isSet(sieve, i) {
  return (sieve[i >> 5] & (1 << (i & 31))) !== 0;
}

/**
 * Set a bit in the sieve array.
 */
function setBit(sieve, i) {
  sieve[i >> 5] |= (1 << (i & 31));
}

/**
 * Generate step-by-step visualization for the bitwise sieve of Eratosthenes.
 *
 * @param {number[]} input - Array containing the upper limit.
 * @returns {Array} Recorded steps.
 */
export function generateSteps(input) {
  const recorder = new StepRecorder();
  const limit = input[0] !== undefined ? input[0] : 50;
  const n = Math.min(limit, 200); // Cap for visualization

  // Visual snapshot: array of 0/1 indicating prime (0) or composite (1) for numbers 0..n
  const visual = new Array(n + 1).fill(0);
  // Mark 0 and 1 as non-prime
  visual[0] = 1;
  visual[1] = 1;

  // Actual bit sieve
  const sieveSize = (n >> 5) + 1;
  const sieve = new Array(sieveSize).fill(0);
  setBit(sieve, 0);
  setBit(sieve, 1);

  recorder.add(
    'message', [], 0,
    `Bitwise Sieve of Eratosthenes: find all primes up to ${n}. Using ${sieveSize} integers (${sieveSize * 32} bits) instead of ${n + 1} booleans`,
    [...visual],
    { n, sieveSize }
  );

  const sqrtN = Math.floor(Math.sqrt(n));

  for (let p = 2; p <= sqrtN; p++) {
    if (!isSet(sieve, p)) {
      // p is prime
      recorder.add(
        'found', [p], 2,
        `${p} is prime (bit ${p} is not set). Mark multiples starting from ${p}*${p} = ${p * p}`,
        [...visual],
        { prime: p }
      );

      // Mark multiples
      const markedIndices = [];
      for (let j = p * p; j <= n; j += p) {
        if (!isSet(sieve, j)) {
          setBit(sieve, j);
          visual[j] = 1;
          markedIndices.push(j);
        }
      }

      if (markedIndices.length > 0) {
        recorder.add(
          'compute', markedIndices, 4,
          `Marked ${markedIndices.length} composite(s) as multiples of ${p}: ${markedIndices.join(', ')}`,
          [...visual],
          { prime: p, composites: markedIndices }
        );
      }
    } else {
      recorder.add(
        'compare', [p], 2,
        `${p} is composite (bit ${p} is set), skip`,
        [...visual],
        { composite: p }
      );
    }
  }

  // Collect primes
  const primes = [];
  const primeIndices = [];
  for (let i = 2; i <= n; i++) {
    if (!isSet(sieve, i)) {
      primes.push(i);
      primeIndices.push(i);
    }
  }

  recorder.add(
    'sorted', primeIndices, 5,
    `Sieve complete. Found ${primes.length} primes up to ${n}: ${primes.join(', ')}`,
    [...visual],
    { primes, count: primes.length }
  );

  return recorder.getSteps();
}
