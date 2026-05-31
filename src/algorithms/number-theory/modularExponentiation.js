import StepRecorder from '../../engine/StepRecorder';

export const meta = {
  name: 'Modular Exponentiation',
  slug: 'modular-exponentiation',
  category: 'number-theory',
  timeComplexity: {
    best: 'O(log n)',
    average: 'O(log n)',
    worst: 'O(log n)',
  },
  spaceComplexity: 'O(1)',
  description:
    'Modular Exponentiation (binary exponentiation) computes (base^exp) mod m efficiently by repeatedly squaring the base and multiplying when the corresponding bit of the exponent is set. This reduces the number of multiplications from O(n) to O(log n).',
  rendererType: 'bar',
  pseudocode: [
    'result = 1, base = base mod m',
    'while exp > 0:',
    '  if exp is odd:',
    '    result = (result * base) mod m',
    '  exp = exp >> 1',
    '  base = (base * base) mod m',
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

export const defaultInput = [2, 10, 1000000007];

export function generateSteps(input) {
  const recorder = new StepRecorder();
  const origBase = input[0];
  const origExp = input[1];
  const m = input[2];

  recorder.add(
    'message',
    [],
    -1,
    `Compute (${origBase}^${origExp}) mod ${m} using binary exponentiation.`,
    [origBase, origExp, m],
    {}
  );

  // Show binary representation of exponent
  const expBinary = origExp.toString(2);
  recorder.add(
    'message',
    [],
    -1,
    `Binary representation of exponent ${origExp} = ${expBinary}.`,
    [origBase, origExp, m],
    { binary: expBinary }
  );

  let result = 1;
  let base = origBase % m;
  let exp = origExp;

  recorder.add(
    'compute',
    [],
    0,
    `Initialize: result = 1, base = ${origBase} mod ${m} = ${base}.`,
    [result, base, exp],
    {}
  );

  let step = 0;
  while (exp > 0) {
    recorder.add(
      'compare',
      [2],
      1,
      `Step ${step + 1}: exp = ${exp} > 0, continue. Binary: ${exp.toString(2)}.`,
      [result, base, exp],
      {}
    );

    if (exp % 2 === 1) {
      const oldResult = result;
      // Use BigInt for large multiplications to avoid overflow
      result = Number((BigInt(result) * BigInt(base)) % BigInt(m));
      recorder.add(
        'compute',
        [0],
        3,
        `exp is odd: result = (${oldResult} * ${base}) mod ${m} = ${result}.`,
        [result, base, exp],
        {}
      );
    } else {
      recorder.add(
        'message',
        [],
        2,
        `exp is even: skip multiplication.`,
        [result, base, exp],
        {}
      );
    }

    exp = Math.floor(exp / 2);
    recorder.add(
      'compute',
      [2],
      4,
      `Shift exponent right: exp = ${exp}.`,
      [result, base, exp],
      {}
    );

    if (exp > 0) {
      const oldBase = base;
      base = Number((BigInt(base) * BigInt(base)) % BigInt(m));
      recorder.add(
        'compute',
        [1],
        5,
        `Square base: base = (${oldBase} * ${oldBase}) mod ${m} = ${base}.`,
        [result, base, exp],
        {}
      );
    }

    step++;
  }

  recorder.add(
    'found',
    [0],
    6,
    `Result: (${origBase}^${origExp}) mod ${m} = ${result}.`,
    [result],
    { result }
  );

  recorder.add(
    'message',
    [],
    6,
    `Modular exponentiation complete. Answer = ${result}.`,
    [result],
    { result }
  );

  return recorder.getSteps();
}
