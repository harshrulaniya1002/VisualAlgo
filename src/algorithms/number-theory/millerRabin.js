import StepRecorder from '../../engine/StepRecorder';

export const meta = {
  name: 'Miller-Rabin Primality Test',
  slug: 'miller-rabin',
  category: 'number-theory',
  timeComplexity: {
    best: 'O(k * log^2 n)',
    average: 'O(k * log^2 n)',
    worst: 'O(k * log^2 n)',
  },
  spaceComplexity: 'O(1)',
  description:
    'The Miller-Rabin primality test is a probabilistic algorithm that determines whether a number is probably prime or definitely composite. It works by writing n-1 as 2^s * d, then testing witnesses a to check if a^d = 1 (mod n) or a^(2^r * d) = -1 (mod n) for some r. Deterministic for n < 3,215,031,751 using witnesses {2, 3, 5, 7}.',
  rendererType: 'bar',
  pseudocode: [
    'write n-1 = 2^s * d (d odd)',
    'for each witness a:',
    '  x = a^d mod n',
    '  if x == 1 or x == n-1: next witness',
    '  repeat s-1 times: x = x^2 mod n',
    '    if x == n-1: next witness',
    '  return composite',
    'return probably prime',
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

export const defaultInput = [561];

// Modular exponentiation using BigInt for correctness
function modPow(base, exp, mod) {
  let result = 1n;
  base = ((base % mod) + mod) % mod;
  while (exp > 0n) {
    if (exp % 2n === 1n) {
      result = (result * base) % mod;
    }
    exp = exp / 2n;
    base = (base * base) % mod;
  }
  return result;
}

export function generateSteps(input) {
  const recorder = new StepRecorder();
  const n = input[0];

  recorder.add(
    'message',
    [],
    -1,
    `Miller-Rabin primality test for n = ${n}.`,
    [n],
    {}
  );

  // Handle small cases
  if (n < 2) {
    recorder.add('found', [], -1, `${n} < 2, not prime.`, [n], { isPrime: false });
    return recorder.getSteps();
  }
  if (n === 2 || n === 3) {
    recorder.add('found', [], -1, `${n} is prime (small prime).`, [n], { isPrime: true });
    return recorder.getSteps();
  }
  if (n % 2 === 0) {
    recorder.add('found', [], -1, `${n} is even, composite.`, [n], { isPrime: false });
    return recorder.getSteps();
  }

  // Write n-1 = 2^s * d
  let s = 0;
  let d = n - 1;
  while (d % 2 === 0) {
    d = Math.floor(d / 2);
    s++;
  }

  recorder.add(
    'compute',
    [],
    0,
    `n - 1 = ${n - 1} = 2^${s} * ${d}.`,
    [n, s, d],
    { s, d }
  );

  // Use deterministic witnesses for n < 3,215,031,751
  const witnesses = [2, 3, 5, 7].filter(a => a < n);

  recorder.add(
    'message',
    [],
    1,
    `Testing with witnesses: [${witnesses.join(', ')}].`,
    [n],
    { witnesses }
  );

  const nBig = BigInt(n);
  const dBig = BigInt(d);
  let isPrime = true;

  for (const a of witnesses) {
    recorder.add(
      'visit',
      [],
      1,
      `Test witness a = ${a}.`,
      [a, n],
      {}
    );

    // x = a^d mod n
    let x = modPow(BigInt(a), dBig, nBig);

    recorder.add(
      'compute',
      [],
      2,
      `x = ${a}^${d} mod ${n} = ${x}.`,
      [Number(x), n],
      {}
    );

    if (x === 1n || x === nBig - 1n) {
      recorder.add(
        'highlight',
        [],
        3,
        `x = ${x} (which is ${x === 1n ? '1' : 'n-1'}). Witness ${a} passes. Try next witness.`,
        [Number(x), n],
        {}
      );
      continue;
    }

    let witnessComposite = true;

    for (let r = 1; r < s; r++) {
      x = (x * x) % nBig;

      recorder.add(
        'compute',
        [],
        4,
        `r = ${r}: x = x^2 mod ${n} = ${x}.`,
        [Number(x), n],
        { r }
      );

      if (x === nBig - 1n) {
        recorder.add(
          'highlight',
          [],
          5,
          `x = n - 1 = ${n - 1}. Witness ${a} passes at r = ${r}.`,
          [Number(x), n],
          {}
        );
        witnessComposite = false;
        break;
      }

      if (x === 1n) {
        recorder.add(
          'compute',
          [],
          4,
          `x = 1 but never hit n-1. Non-trivial square root of 1 found. ${n} is composite.`,
          [Number(x), n],
          {}
        );
        break;
      }
    }

    if (witnessComposite) {
      recorder.add(
        'found',
        [],
        6,
        `Witness ${a} proves ${n} is composite.`,
        [n],
        { isPrime: false, witness: a }
      );
      isPrime = false;
      break;
    }
  }

  if (isPrime) {
    recorder.add(
      'found',
      [],
      7,
      `All witnesses passed. ${n} is prime.`,
      [n],
      { isPrime: true }
    );
  }

  recorder.add(
    'message',
    [],
    7,
    `Miller-Rabin test complete. ${n} is ${isPrime ? 'prime' : 'composite'}.`,
    [n],
    { isPrime }
  );

  return recorder.getSteps();
}
