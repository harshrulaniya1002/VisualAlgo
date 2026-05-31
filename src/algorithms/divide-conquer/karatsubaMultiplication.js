import StepRecorder from '../../engine/StepRecorder';

export const meta = {
  name: 'Karatsuba Multiplication',
  slug: 'karatsuba-multiplication',
  category: 'divide-conquer',
  timeComplexity: {
    best: 'O(n^1.585)',
    average: 'O(n^1.585)',
    worst: 'O(n^1.585)',
  },
  spaceComplexity: 'O(n)',
  description:
    'Karatsuba multiplication reduces large number multiplication from O(n^2) to O(n^1.585) by splitting each number into high and low halves and computing only 3 recursive multiplications instead of 4. The key identity is: x*y = z2*B^2 + z1*B + z0, where z2=xH*yH, z0=xL*yL, z1=(xH+xL)*(yH+yL)-z2-z0.',
  rendererType: 'bar',
  pseudocode: [
    'karatsuba(x, y)',
    '  if x < 10 or y < 10: return x * y',
    '  m = max(digits(x), digits(y)) / 2',
    '  xH, xL = split x at m digits',
    '  yH, yL = split y at m digits',
    '  z0 = karatsuba(xL, yL)',
    '  z2 = karatsuba(xH, yH)',
    '  z1 = karatsuba(xH+xL, yH+yL) - z2 - z0',
    '  return z2 * 10^(2m) + z1 * 10^m + z0',
  ],
  inputSchema: {
    type: 'array',
    constraints: {
      minLength: 2,
      maxLength: 50,
      minValue: 0,
      maxValue: 999,
    },
  },
};

export const defaultInput = [12, 34, 56, 78];

export function generateSteps(input) {
  const recorder = new StepRecorder();
  const raw = [...input];

  // Interpret input as two numbers: first half and second half concatenated as digits
  // For [12, 34, 56, 78]: x = 1234, y = 5678
  const half = Math.floor(raw.length / 2);
  const xStr = raw.slice(0, half).join('');
  const yStr = raw.slice(half).join('');
  const x = parseInt(xStr, 10) || 0;
  const y = parseInt(yStr, 10) || 0;

  // Bar visualization: track intermediate computation values
  let stepValues = [x, y];

  recorder.add(
    'message',
    [],
    -1,
    `Karatsuba Multiplication: compute ${x} * ${y}`,
    [...stepValues],
    { x, y }
  );

  let stepCounter = 0;

  function numDigits(n) {
    if (n === 0) return 1;
    return Math.floor(Math.log10(Math.abs(n))) + 1;
  }

  function karatsuba(a, b, depth) {
    stepCounter++;

    // Base case
    if (a < 10 || b < 10) {
      const result = a * b;
      recorder.add(
        'compute',
        [],
        1,
        `Base case: ${a} * ${b} = ${result}`,
        [...stepValues, result],
        { a, b, result, depth }
      );
      return result;
    }

    const m = Math.floor(Math.max(numDigits(a), numDigits(b)) / 2);
    const base = Math.pow(10, m);

    const aH = Math.floor(a / base);
    const aL = a % base;
    const bH = Math.floor(b / base);
    const bL = b % base;

    // DIVIDE
    recorder.add(
      'divide',
      [],
      3,
      `DIVIDE: Split ${a} into high=${aH}, low=${aL} (m=${m}). Split ${b} into high=${bH}, low=${bL}`,
      [...stepValues],
      { a, b, aH, aL, bH, bL, m, depth, phase: 'divide' }
    );

    // CONQUER: 3 recursive multiplications
    recorder.add(
      'message',
      [],
      5,
      `CONQUER: Compute z0 = ${aL} * ${bL} (low * low)`,
      [...stepValues],
      { depth: depth + 1, phase: 'conquer' }
    );
    const z0 = karatsuba(aL, bL, depth + 1);

    recorder.add(
      'message',
      [],
      6,
      `CONQUER: Compute z2 = ${aH} * ${bH} (high * high)`,
      [...stepValues],
      { depth: depth + 1, phase: 'conquer' }
    );
    const z2 = karatsuba(aH, bH, depth + 1);

    const sumA = aH + aL;
    const sumB = bH + bL;
    recorder.add(
      'message',
      [],
      7,
      `CONQUER: Compute (${aH}+${aL}) * (${bH}+${bL}) = ${sumA} * ${sumB} for z1`,
      [...stepValues],
      { depth: depth + 1, phase: 'conquer' }
    );
    const z1Full = karatsuba(sumA, sumB, depth + 1);
    const z1 = z1Full - z2 - z0;

    recorder.add(
      'compute',
      [],
      7,
      `z1 = ${z1Full} - z2(${z2}) - z0(${z0}) = ${z1}`,
      [...stepValues],
      { z0, z1, z2, z1Full, depth }
    );

    // COMBINE
    const result = z2 * Math.pow(10, 2 * m) + z1 * Math.pow(10, m) + z0;

    stepValues = [...stepValues, result];

    recorder.add(
      'merge',
      [],
      8,
      `COMBINE: ${a} * ${b} = z2*10^${2 * m} + z1*10^${m} + z0 = ${z2}*${Math.pow(10, 2 * m)} + ${z1}*${Math.pow(10, m)} + ${z0} = ${result}`,
      [...stepValues],
      { z0, z1, z2, m, result, depth, phase: 'combine' }
    );

    return result;
  }

  const result = karatsuba(x, y, 0);

  recorder.add(
    'sorted',
    [],
    -1,
    `Karatsuba complete! ${x} * ${y} = ${result}`,
    [x, y, result],
    { result }
  );

  // Verify
  recorder.add(
    'message',
    [],
    -1,
    `Verification: ${x} * ${y} = ${x * y} — matches: ${result === x * y}`,
    [x, y, result],
    {}
  );

  return recorder.getSteps();
}
