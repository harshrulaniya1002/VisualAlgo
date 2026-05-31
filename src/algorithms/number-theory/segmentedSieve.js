import StepRecorder from '../../engine/StepRecorder';

export const meta = {
  name: 'Segmented Sieve',
  slug: 'segmented-sieve',
  category: 'number-theory',
  timeComplexity: {
    best: 'O(n log log n)',
    average: 'O(n log log n)',
    worst: 'O(n log log n)',
  },
  spaceComplexity: 'O(sqrt(n))',
  description:
    'The Segmented Sieve finds all primes in a range [L, R] using only O(sqrt(R)) space. It first finds small primes up to sqrt(R) using a basic sieve, then uses those primes to mark composites within the target segment [L, R].',
  rendererType: 'bar',
  pseudocode: [
    'find small primes up to sqrt(R) using basic sieve',
    'create segment array for range [L, R]',
    'for each small prime p:',
    '  find first multiple of p >= L',
    '  mark all multiples of p in segment as composite',
    'collect unmarked entries as primes in [L, R]',
  ],
  inputSchema: {
    type: 'array',
    constraints: {
      minLength: 1,
      maxLength: 50,
      minValue: 0,
      maxValue: 999999999,
    },
  },
};

export const defaultInput = [50, 100];

export function generateSteps(input) {
  const recorder = new StepRecorder();
  const L = Math.max(2, input[0]);
  const R = input[1];
  const segSize = R - L + 1;

  recorder.add(
    'message',
    [],
    -1,
    `Segmented Sieve: find all primes in range [${L}, ${R}].`,
    new Array(segSize).fill(1),
    {}
  );

  // Step 1: Basic sieve up to sqrt(R)
  const sqrtR = Math.floor(Math.sqrt(R));
  const smallSieve = new Array(sqrtR + 1).fill(1);
  smallSieve[0] = 0;
  if (sqrtR >= 1) smallSieve[1] = 0;

  recorder.add(
    'message',
    [],
    0,
    `Step 1: Find small primes up to sqrt(${R}) = ${sqrtR} using basic sieve.`,
    [...smallSieve],
    {}
  );

  for (let i = 2; i * i <= sqrtR; i++) {
    if (smallSieve[i] === 1) {
      for (let j = i * i; j <= sqrtR; j += i) {
        smallSieve[j] = 0;
      }
    }
  }

  const smallPrimes = [];
  for (let i = 2; i <= sqrtR; i++) {
    if (smallSieve[i] === 1) {
      smallPrimes.push(i);
    }
  }

  recorder.add(
    'compute',
    [],
    0,
    `Small primes found: [${smallPrimes.join(', ')}].`,
    [...smallSieve],
    { smallPrimes }
  );

  // Step 2: Create segment array
  const segment = new Array(segSize).fill(1);
  // Handle L = 0 or L = 1
  if (L === 0) segment[0] = 0;
  if (L <= 1 && 1 <= R) segment[1 - L] = 0;

  recorder.add(
    'message',
    [],
    1,
    `Step 2: Create segment array of size ${segSize} for range [${L}, ${R}]. All entries start as prime candidates (1).`,
    [...segment],
    {}
  );

  // Step 3: Mark composites using small primes
  for (const p of smallPrimes) {
    // Find first multiple of p >= L
    let start = Math.ceil(L / p) * p;
    if (start === p) start += p; // skip the prime itself

    recorder.add(
      'visit',
      [],
      2,
      `Using prime ${p}: first multiple >= ${L} is ${start}.`,
      [...segment],
      {}
    );

    for (let j = start; j <= R; j += p) {
      const idx = j - L;
      if (segment[idx] === 1) {
        segment[idx] = 0;
        recorder.add(
          'compute',
          [idx],
          4,
          `Mark ${j} (index ${idx}) as composite (multiple of ${p}).`,
          [...segment],
          {}
        );
      }
    }
  }

  // Step 4: Collect primes
  const primes = [];
  for (let i = 0; i < segSize; i++) {
    if (segment[i] === 1) {
      const num = L + i;
      primes.push(num);
      recorder.add(
        'found',
        [i],
        5,
        `${num} is prime.`,
        [...segment],
        {}
      );
    }
  }

  recorder.add(
    'message',
    [],
    5,
    `Segmented Sieve complete. Found ${primes.length} primes in [${L}, ${R}]: [${primes.join(', ')}].`,
    [...segment],
    { primes }
  );

  return recorder.getSteps();
}
