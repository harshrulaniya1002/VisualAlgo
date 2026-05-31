import StepRecorder from '../../engine/StepRecorder';

export const meta = {
  name: 'GCD (Euclidean Algorithm)',
  slug: 'gcd-euclidean',
  category: 'number-theory',
  timeComplexity: {
    best: 'O(1)',
    average: 'O(log(min(a,b)))',
    worst: 'O(log(min(a,b)))',
  },
  spaceComplexity: 'O(1)',
  description:
    'The Euclidean Algorithm computes the greatest common divisor (GCD) of two integers by repeatedly replacing the larger number with the remainder of dividing the larger by the smaller, until the remainder is zero. The last non-zero remainder is the GCD.',
  rendererType: 'bar',
  pseudocode: [
    'function gcd(a, b):',
    '  while b != 0:',
    '    r = a mod b',
    '    a = b',
    '    b = r',
    '  return a',
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
  let a = input[0];
  let b = input[1];

  recorder.add(
    'message',
    [],
    0,
    `Compute GCD(${a}, ${b}) using the Euclidean Algorithm.`,
    [a, b],
    {}
  );

  if (b === 0) {
    recorder.add(
      'found',
      [0],
      5,
      `b = 0, so GCD = a = ${a}.`,
      [a, b],
      {}
    );
    return recorder.getSteps();
  }

  if (a === 0) {
    recorder.add(
      'found',
      [1],
      5,
      `a = 0, so GCD = b = ${b}.`,
      [a, b],
      {}
    );
    return recorder.getSteps();
  }

  let step = 1;
  while (b !== 0) {
    recorder.add(
      'compare',
      [0, 1],
      1,
      `Step ${step}: b = ${b} != 0, continue loop.`,
      [a, b],
      {}
    );

    const r = a % b;
    recorder.add(
      'compute',
      [0, 1],
      2,
      `Compute r = ${a} mod ${b} = ${r}.`,
      [a, b, r],
      { remainder: r }
    );

    a = b;
    b = r;

    recorder.add(
      'swap',
      [0, 1],
      3,
      `Set a = ${a}, b = ${b}.`,
      [a, b],
      {}
    );

    step++;
  }

  recorder.add(
    'found',
    [0],
    5,
    `b = 0. GCD = ${a}.`,
    [a, b],
    { gcd: a }
  );

  recorder.add(
    'message',
    [],
    5,
    `Euclidean Algorithm complete. GCD = ${a}.`,
    [a],
    { gcd: a }
  );

  return recorder.getSteps();
}
