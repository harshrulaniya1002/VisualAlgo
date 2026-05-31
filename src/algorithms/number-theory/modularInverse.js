import StepRecorder from '../../engine/StepRecorder';

export const meta = {
  name: 'Modular Inverse',
  slug: 'modular-inverse',
  category: 'number-theory',
  timeComplexity: {
    best: 'O(log m)',
    average: 'O(log m)',
    worst: 'O(log m)',
  },
  spaceComplexity: 'O(1)',
  description:
    'The Modular Multiplicative Inverse of a number a modulo m is a number x such that (a * x) mod m = 1. It exists if and only if gcd(a, m) = 1. This implementation uses the Extended Euclidean Algorithm to find the inverse.',
  rendererType: 'bar',
  pseudocode: [
    'function modInverse(a, m):',
    '  (g, x, _) = extGcd(a, m)',
    '  if g != 1: no inverse exists',
    '  return (x mod m + m) mod m',
    'function extGcd(a, b):',
    '  if b == 0: return (a, 1, 0)',
    '  (g, x1, y1) = extGcd(b, a mod b)',
    '  return (g, y1, x1 - floor(a/b)*y1)',
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

export const defaultInput = [3, 11];

export function generateSteps(input) {
  const recorder = new StepRecorder();
  const a = input[0];
  const m = input[1];

  recorder.add(
    'message',
    [],
    0,
    `Find modular inverse of ${a} modulo ${m}: find x such that (${a} * x) mod ${m} = 1.`,
    [a, m],
    {}
  );

  // Extended Euclidean Algorithm (iterative)
  recorder.add(
    'message',
    [],
    -1,
    'Use Extended Euclidean Algorithm to find x.',
    [a, m],
    {}
  );

  // Forward pass: collect division steps
  const divSteps = [];
  let r0 = a;
  let r1 = m;

  while (r1 !== 0) {
    const q = Math.floor(r0 / r1);
    const r = r0 % r1;

    recorder.add(
      'compute',
      [0, 1],
      4,
      `${r0} = ${q} * ${r1} + ${r}`,
      [r0, r1, r],
      { quotient: q, remainder: r }
    );

    divSteps.push({ a: r0, b: r1, q, r });
    r0 = r1;
    r1 = r;
  }

  const gcd = r0;
  recorder.add(
    'compute',
    [0],
    1,
    `GCD(${a}, ${m}) = ${gcd}.`,
    [gcd],
    { gcd }
  );

  if (gcd !== 1) {
    recorder.add(
      'message',
      [],
      2,
      `GCD(${a}, ${m}) = ${gcd} != 1. Modular inverse does not exist.`,
      [gcd],
      { exists: false }
    );
    return recorder.getSteps();
  }

  recorder.add(
    'message',
    [],
    -1,
    'GCD = 1, inverse exists. Backward pass: compute Bezout coefficient x.',
    [gcd],
    {}
  );

  // Backward pass
  let x = 1;
  let y = 0;

  recorder.add(
    'compute',
    [],
    5,
    `Base case: ${gcd} = ${gcd} * 1 + 0 * 0. x = 1, y = 0.`,
    [x, y],
    {}
  );

  for (let i = divSteps.length - 1; i >= 0; i--) {
    const { q } = divSteps[i];
    const newX = y;
    const newY = x - q * y;

    recorder.add(
      'compute',
      [],
      7,
      `Back-substitute: x = ${y}, y = ${x} - ${q} * ${y} = ${newY}.`,
      [newX, newY],
      { x: newX, y: newY }
    );

    x = newX;
    y = newY;
  }

  // x is the coefficient for a, normalize it
  const inverse = ((x % m) + m) % m;

  recorder.add(
    'compute',
    [],
    3,
    `Normalize: x = ((${x}) mod ${m} + ${m}) mod ${m} = ${inverse}.`,
    [inverse],
    {}
  );

  // Verify
  const verification = (a * inverse) % m;
  recorder.add(
    'found',
    [0],
    3,
    `Verification: (${a} * ${inverse}) mod ${m} = ${verification}.`,
    [inverse],
    { inverse, verified: verification === 1 }
  );

  recorder.add(
    'message',
    [],
    3,
    `Modular inverse of ${a} mod ${m} is ${inverse}.`,
    [inverse],
    { inverse }
  );

  return recorder.getSteps();
}
