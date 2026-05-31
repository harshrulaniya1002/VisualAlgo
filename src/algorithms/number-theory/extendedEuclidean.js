import StepRecorder from '../../engine/StepRecorder';

export const meta = {
  name: 'Extended Euclidean Algorithm',
  slug: 'extended-euclidean',
  category: 'number-theory',
  timeComplexity: {
    best: 'O(1)',
    average: 'O(log(min(a,b)))',
    worst: 'O(log(min(a,b)))',
  },
  spaceComplexity: 'O(log(min(a,b)))',
  description:
    'The Extended Euclidean Algorithm finds integers x and y such that ax + by = gcd(a, b). It extends the standard Euclidean algorithm by performing a forward pass to compute remainders and a backward pass to compute the Bezout coefficients x and y.',
  rendererType: 'bar',
  pseudocode: [
    'function extGcd(a, b):',
    '  if b == 0: return (a, 1, 0)',
    '  (g, x1, y1) = extGcd(b, a mod b)',
    '  x = y1',
    '  y = x1 - floor(a/b) * y1',
    '  return (g, x, y)',
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

export const defaultInput = [252, 105];

export function generateSteps(input) {
  const recorder = new StepRecorder();
  const origA = input[0];
  const origB = input[1];

  recorder.add(
    'message',
    [],
    0,
    `Extended Euclidean: find x, y such that ${origA}*x + ${origB}*y = gcd(${origA}, ${origB}).`,
    [origA, origB],
    {}
  );

  // Forward pass: collect all (a, b, q, r) tuples
  const steps = [];
  let a = origA;
  let b = origB;

  recorder.add(
    'message',
    [],
    -1,
    'Forward pass: compute remainders using Euclidean algorithm.',
    [a, b],
    {}
  );

  while (b !== 0) {
    const q = Math.floor(a / b);
    const r = a % b;

    recorder.add(
      'compute',
      [0, 1],
      2,
      `${a} = ${q} * ${b} + ${r}`,
      [a, b, r],
      { quotient: q, remainder: r }
    );

    steps.push({ a, b, q, r });
    a = b;
    b = r;
  }

  const gcd = a;
  recorder.add(
    'found',
    [0],
    1,
    `Remainder is 0. GCD = ${gcd}.`,
    [a, 0],
    { gcd }
  );

  // Backward pass: compute x and y coefficients
  recorder.add(
    'message',
    [],
    -1,
    'Backward pass: compute Bezout coefficients x, y.',
    [gcd],
    {}
  );

  // Base case: gcd = a*1 + 0*0
  let x = 1;
  let y = 0;

  recorder.add(
    'compute',
    [],
    1,
    `Base case: ${gcd} = ${gcd} * 1 + 0 * 0, so x = 1, y = 0.`,
    [x, y],
    { x, y }
  );

  // Work backwards through the steps
  for (let i = steps.length - 1; i >= 0; i--) {
    const { a: ai, b: bi, q } = steps[i];
    const newX = y;
    const newY = x - q * y;

    recorder.add(
      'compute',
      [],
      3,
      `From ${ai} = ${q} * ${bi} + ${ai % bi}: x = ${y}, y = ${x} - ${q} * ${y} = ${newY}.`,
      [newX, newY],
      { x: newX, y: newY, step: i }
    );

    x = newX;
    y = newY;
  }

  // Verify: origA * x + origB * y = gcd
  const verification = origA * x + origB * y;
  recorder.add(
    'found',
    [],
    5,
    `Result: ${origA} * (${x}) + ${origB} * (${y}) = ${verification} = gcd.`,
    [x, y, gcd],
    { x, y, gcd, verified: verification === gcd }
  );

  recorder.add(
    'message',
    [],
    5,
    `Extended Euclidean complete. x = ${x}, y = ${y}, gcd = ${gcd}.`,
    [x, y, gcd],
    { x, y, gcd }
  );

  return recorder.getSteps();
}
