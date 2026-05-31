import StepRecorder from '../../engine/StepRecorder';

export const meta = {
  name: 'Sieve of Eratosthenes',
  slug: 'sieve-of-eratosthenes',
  category: 'number-theory',
  timeComplexity: {
    best: 'O(n log log n)',
    average: 'O(n log log n)',
    worst: 'O(n log log n)',
  },
  spaceComplexity: 'O(n)',
  description:
    'The Sieve of Eratosthenes is an ancient algorithm for finding all prime numbers up to a given limit. It iteratively marks the multiples of each prime starting from 2, so that only prime numbers remain unmarked. It is one of the most efficient ways to find all small primes.',
  rendererType: 'bar',
  pseudocode: [
    'create boolean array of size n+1',
    'for i = 2 to sqrt(n):',
    '  if i is prime:',
    '    mark all multiples of i as composite',
    'collect unmarked numbers as primes',
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

export const defaultInput = [50];

export function generateSteps(input) {
  const recorder = new StepRecorder();
  const n = input[0];

  // Create sieve array: 1 = prime candidate, 0 = composite
  const sieve = new Array(n + 1).fill(1);
  sieve[0] = 0;
  sieve[1] = 0;

  // Snapshot is the sieve array itself (values 0 or 1)
  recorder.add(
    'message',
    [],
    0,
    `Initialize sieve array of size ${n + 1}. All entries 2..${n} marked as prime candidates (1).`,
    [...sieve],
    {}
  );

  recorder.add(
    'compute',
    [0, 1],
    0,
    'Mark 0 and 1 as non-prime.',
    [...sieve],
    {}
  );

  const sqrtN = Math.floor(Math.sqrt(n));

  for (let i = 2; i <= sqrtN; i++) {
    recorder.add(
      'visit',
      [i],
      1,
      `Check i = ${i}: is sieve[${i}] still marked as prime?`,
      [...sieve],
      {}
    );

    if (sieve[i] === 1) {
      recorder.add(
        'highlight',
        [i],
        2,
        `${i} is prime. Now mark all multiples of ${i} as composite.`,
        [...sieve],
        {}
      );

      for (let j = i * i; j <= n; j += i) {
        sieve[j] = 0;
        recorder.add(
          'compute',
          [j],
          3,
          `Mark sieve[${j}] = 0 (${j} is a multiple of ${i}).`,
          [...sieve],
          {}
        );
      }
    } else {
      recorder.add(
        'message',
        [i],
        2,
        `${i} is already marked composite. Skip.`,
        [...sieve],
        {}
      );
    }
  }

  // Collect primes
  const primes = [];
  for (let i = 2; i <= n; i++) {
    if (sieve[i] === 1) {
      primes.push(i);
      recorder.add(
        'found',
        [i],
        4,
        `${i} is prime.`,
        [...sieve],
        {}
      );
    }
  }

  recorder.add(
    'message',
    [],
    4,
    `Sieve complete. Found ${primes.length} primes up to ${n}: [${primes.join(', ')}].`,
    [...sieve],
    { primes }
  );

  return recorder.getSteps();
}
