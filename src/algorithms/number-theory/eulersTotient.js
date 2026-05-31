import StepRecorder from '../../engine/StepRecorder';

export const meta = {
  name: "Euler's Totient Function",
  slug: 'eulers-totient',
  category: 'number-theory',
  timeComplexity: {
    best: 'O(sqrt(n))',
    average: 'O(sqrt(n))',
    worst: 'O(sqrt(n))',
  },
  spaceComplexity: 'O(1)',
  description:
    "Euler's Totient function phi(n) counts the number of integers from 1 to n that are coprime with n. It is computed by finding all prime factors of n and applying the product formula: phi(n) = n * product of (1 - 1/p) for each distinct prime factor p of n.",
  rendererType: 'bar',
  pseudocode: [
    'result = n',
    'for p = 2 to sqrt(n):',
    '  if p divides n:',
    '    while p divides n: n = n / p',
    '    result = result - result / p',
    'if n > 1: result = result - result / n',
    'return result',
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

export const defaultInput = [36];

export function generateSteps(input) {
  const recorder = new StepRecorder();
  const origN = input[0];
  let n = origN;

  recorder.add(
    'message',
    [],
    -1,
    `Compute Euler's Totient phi(${origN}).`,
    [origN],
    {}
  );

  if (n <= 0) {
    recorder.add('found', [], -1, `phi(${origN}) is not defined for n <= 0.`, [0], {});
    return recorder.getSteps();
  }

  if (n === 1) {
    recorder.add('found', [], -1, `phi(1) = 1.`, [1], { totient: 1 });
    return recorder.getSteps();
  }

  let result = origN;
  const primeFactors = [];

  recorder.add(
    'compute',
    [],
    0,
    `Initialize result = ${result}. Now find prime factors.`,
    [result, n],
    {}
  );

  // Factor out 2 first
  if (n % 2 === 0) {
    recorder.add(
      'visit',
      [],
      1,
      `Check p = 2: ${n} is divisible by 2.`,
      [result, n],
      {}
    );

    primeFactors.push(2);
    while (n % 2 === 0) {
      n = Math.floor(n / 2);
      recorder.add(
        'compute',
        [],
        3,
        `Divide out 2: n = ${n}.`,
        [result, n],
        {}
      );
    }

    result -= Math.floor(result / 2);
    recorder.add(
      'compute',
      [],
      4,
      `Apply formula: result = result - result/2 = ${result}.`,
      [result, n],
      { factor: 2 }
    );
  }

  // Check odd factors from 3 to sqrt(n)
  for (let p = 3; p * p <= n; p += 2) {
    if (n % p === 0) {
      recorder.add(
        'visit',
        [],
        1,
        `Check p = ${p}: ${n} is divisible by ${p}.`,
        [result, n],
        {}
      );

      primeFactors.push(p);
      while (n % p === 0) {
        n = Math.floor(n / p);
        recorder.add(
          'compute',
          [],
          3,
          `Divide out ${p}: n = ${n}.`,
          [result, n],
          {}
        );
      }

      result -= Math.floor(result / p);
      recorder.add(
        'compute',
        [],
        4,
        `Apply formula: result = result - result/${p} = ${result}.`,
        [result, n],
        { factor: p }
      );
    }
  }

  // If n > 1 then it is a remaining prime factor
  if (n > 1) {
    recorder.add(
      'visit',
      [],
      5,
      `Remaining n = ${n} > 1, so ${n} is a prime factor.`,
      [result, n],
      {}
    );

    primeFactors.push(n);
    result -= Math.floor(result / n);

    recorder.add(
      'compute',
      [],
      5,
      `Apply formula: result = result - result/${n} = ${result}.`,
      [result, n],
      { factor: n }
    );
  }

  recorder.add(
    'found',
    [],
    6,
    `phi(${origN}) = ${result}. Prime factors: [${primeFactors.join(', ')}].`,
    [result],
    { totient: result, primeFactors }
  );

  recorder.add(
    'message',
    [],
    6,
    `Euler's Totient complete. phi(${origN}) = ${result}. There are ${result} integers in [1, ${origN}] coprime with ${origN}.`,
    [result],
    { totient: result }
  );

  return recorder.getSteps();
}
