import StepRecorder from '../../engine/StepRecorder';

export const meta = {
  name: "Pollard's Rho Factorization",
  slug: 'pollards-rho',
  category: 'number-theory',
  timeComplexity: {
    best: 'O(n^(1/4))',
    average: 'O(n^(1/4))',
    worst: 'O(n^(1/4))',
  },
  spaceComplexity: 'O(1)',
  description:
    "Pollard's Rho algorithm is a probabilistic factorization algorithm that finds a non-trivial factor of a composite number. It uses Floyd's cycle detection on the sequence x_{i+1} = (x_i^2 + c) mod n, computing gcd(|x - y|, n) at each step to find a factor.",
  rendererType: 'bar',
  pseudocode: [
    'choose random x, c',
    'y = x',
    'repeat:',
    '  x = (x^2 + c) mod n',
    '  y = (y^2 + c) mod n; y = (y^2 + c) mod n',
    '  d = gcd(|x - y|, n)',
    '  if 1 < d < n: return d',
    'if d == n: retry with different c',
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

export const defaultInput = [8051];

function gcd(a, b) {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b !== 0) {
    [a, b] = [b, a % b];
  }
  return a;
}

export function generateSteps(input) {
  const recorder = new StepRecorder();
  const n = input[0];

  recorder.add(
    'message',
    [],
    -1,
    `Pollard's Rho: factorize n = ${n}.`,
    [n],
    {}
  );

  // Handle trivial cases
  if (n <= 1) {
    recorder.add('message', [], -1, `${n} <= 1, nothing to factor.`, [n], {});
    return recorder.getSteps();
  }

  if (n % 2 === 0) {
    recorder.add(
      'found',
      [],
      -1,
      `${n} is even. Factors: 2 and ${n / 2}.`,
      [2, n / 2],
      { factor1: 2, factor2: n / 2 }
    );
    return recorder.getSteps();
  }

  // Check if n is a perfect square or prime (simple trial division for small factors)
  const sqrtN = Math.floor(Math.sqrt(n));
  if (sqrtN * sqrtN === n) {
    recorder.add(
      'found',
      [],
      -1,
      `${n} = ${sqrtN}^2 is a perfect square. Factor: ${sqrtN}.`,
      [sqrtN, sqrtN],
      { factor1: sqrtN, factor2: sqrtN }
    );
    return recorder.getSteps();
  }

  // Pollard's Rho with Floyd's cycle detection
  // Try different values of c if needed
  const cValues = [1, 2, 3, 5, 7, 11];
  let factorFound = false;

  for (const c of cValues) {
    let x = 2;
    let y = 2;
    let d = 1;

    recorder.add(
      'compute',
      [],
      0,
      `Try c = ${c}. Initialize x = 2, y = 2.`,
      [x, y, d],
      { c }
    );

    let step = 0;
    const maxSteps = 1000; // Safety limit

    while (d === 1 && step < maxSteps) {
      // Tortoise: one step
      x = (x * x + c) % n;

      recorder.add(
        'compute',
        [0],
        3,
        `Tortoise step: x = (${step === 0 ? '2' : 'x'}^2 + ${c}) mod ${n} = ${x}.`,
        [x, y],
        {}
      );

      // Hare: two steps
      y = (y * y + c) % n;
      y = (y * y + c) % n;

      recorder.add(
        'compute',
        [1],
        4,
        `Hare step (2x): y = ${y}.`,
        [x, y],
        {}
      );

      d = gcd(Math.abs(x - y), n);

      recorder.add(
        'compute',
        [],
        5,
        `gcd(|${x} - ${y}|, ${n}) = gcd(${Math.abs(x - y)}, ${n}) = ${d}.`,
        [x, y, d],
        { gcd: d }
      );

      if (d !== 1 && d !== n) {
        const otherFactor = n / d;
        recorder.add(
          'found',
          [],
          6,
          `Non-trivial factor found: d = ${d}. ${n} = ${d} * ${otherFactor}.`,
          [d, otherFactor],
          { factor1: d, factor2: otherFactor }
        );
        factorFound = true;
        break;
      }

      if (d === n) {
        recorder.add(
          'message',
          [],
          7,
          `d = n = ${n}. Cycle detected without finding factor. Retry with different c.`,
          [x, y, d],
          {}
        );
        break;
      }

      step++;
    }

    if (factorFound) break;

    if (step >= maxSteps) {
      recorder.add(
        'message',
        [],
        7,
        `Reached step limit with c = ${c}. Trying next c.`,
        [x, y],
        {}
      );
    }
  }

  if (!factorFound) {
    recorder.add(
      'message',
      [],
      -1,
      `Could not find a non-trivial factor. ${n} may be prime.`,
      [n],
      {}
    );
  }

  recorder.add(
    'message',
    [],
    -1,
    `Pollard's Rho complete for n = ${n}.`,
    [n],
    {}
  );

  return recorder.getSteps();
}
