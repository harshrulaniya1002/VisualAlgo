import StepRecorder from '../../engine/StepRecorder';

export const meta = {
  name: 'Chinese Remainder Theorem',
  slug: 'chinese-remainder-theorem',
  category: 'number-theory',
  timeComplexity: {
    best: 'O(n log M)',
    average: 'O(n log M)',
    worst: 'O(n log M)',
  },
  spaceComplexity: 'O(n)',
  description:
    'The Chinese Remainder Theorem (CRT) solves a system of simultaneous congruences x = r_i (mod m_i) when the moduli are pairwise coprime. It computes the unique solution modulo M = product of all moduli by finding partial products, modular inverses, and combining them.',
  rendererType: 'bar',
  pseudocode: [
    'compute M = product of all moduli',
    'for each equation x = r_i (mod m_i):',
    '  compute M_i = M / m_i',
    '  compute y_i = modular inverse of M_i mod m_i',
    '  accumulate x += r_i * M_i * y_i',
    'return x mod M',
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

// Input format: [numEquations, r1, m1, r2, m2, ..., rn, mn]
// x = 2 (mod 3), x = 3 (mod 5), x = 2 (mod 7) -> x = 23
export const defaultInput = [3, 2, 3, 3, 5, 2, 7];

// Helper: Extended GCD (iterative)
function extGcd(a, b) {
  let oldR = a, r = b;
  let oldX = 1, x = 0;
  while (r !== 0) {
    const q = Math.floor(oldR / r);
    [oldR, r] = [r, oldR - q * r];
    [oldX, x] = [x, oldX - q * x];
  }
  return { gcd: oldR, x: oldX };
}

export function generateSteps(input) {
  const recorder = new StepRecorder();
  const numEq = input[0];
  const remainders = [];
  const moduli = [];

  for (let i = 0; i < numEq; i++) {
    remainders.push(input[1 + 2 * i]);
    moduli.push(input[2 + 2 * i]);
  }

  recorder.add(
    'message',
    [],
    -1,
    `Chinese Remainder Theorem: solve ${numEq} congruences.`,
    [...remainders, ...moduli],
    {}
  );

  // Display the system of congruences
  for (let i = 0; i < numEq; i++) {
    recorder.add(
      'message',
      [],
      -1,
      `Equation ${i + 1}: x = ${remainders[i]} (mod ${moduli[i]})`,
      [...remainders, ...moduli],
      {}
    );
  }

  // Step 1: Compute M = product of all moduli
  let M = 1;
  for (const mi of moduli) {
    M *= mi;
  }

  recorder.add(
    'compute',
    [],
    0,
    `M = product of all moduli = ${moduli.join(' * ')} = ${M}.`,
    [M],
    { M }
  );

  // Step 2: For each equation, compute Mi, yi, and accumulate
  let result = 0;
  const partialProducts = [];
  const inverses = [];
  const terms = [];

  for (let i = 0; i < numEq; i++) {
    const mi = moduli[i];
    const ri = remainders[i];
    const Mi = M / mi;

    recorder.add(
      'compute',
      [i],
      2,
      `Equation ${i + 1}: M_${i + 1} = M / m_${i + 1} = ${M} / ${mi} = ${Mi}.`,
      [Mi, mi],
      { Mi }
    );

    partialProducts.push(Mi);

    // Compute modular inverse of Mi mod mi using extended GCD
    const { gcd, x } = extGcd(Mi % mi, mi);

    if (gcd !== 1) {
      recorder.add(
        'message',
        [],
        3,
        `Error: gcd(M_${i + 1}, m_${i + 1}) = ${gcd} != 1. Moduli are not pairwise coprime.`,
        [],
        {}
      );
      return recorder.getSteps();
    }

    const yi = ((x % mi) + mi) % mi;
    inverses.push(yi);

    recorder.add(
      'compute',
      [i],
      3,
      `y_${i + 1} = inverse of ${Mi} mod ${mi} = ${yi}. Verify: (${Mi} * ${yi}) mod ${mi} = ${(Mi * yi) % mi}.`,
      [yi],
      { yi }
    );

    // Compute term: ri * Mi * yi
    const term = ri * Mi * yi;
    terms.push(term);

    recorder.add(
      'compute',
      [i],
      4,
      `Term ${i + 1}: r_${i + 1} * M_${i + 1} * y_${i + 1} = ${ri} * ${Mi} * ${yi} = ${term}.`,
      [term],
      { term }
    );

    result += term;
  }

  recorder.add(
    'compute',
    [],
    4,
    `Sum of all terms: ${terms.join(' + ')} = ${result}.`,
    [result],
    {}
  );

  // Step 3: Take result mod M
  const finalResult = ((result % M) + M) % M;

  recorder.add(
    'compute',
    [],
    5,
    `x = ${result} mod ${M} = ${finalResult}.`,
    [finalResult],
    {}
  );

  // Verify each congruence
  for (let i = 0; i < numEq; i++) {
    const check = finalResult % moduli[i];
    recorder.add(
      'found',
      [i],
      5,
      `Verify: ${finalResult} mod ${moduli[i]} = ${check} (expected ${remainders[i]}). ${check === remainders[i] ? 'Correct!' : 'Error!'}`,
      [finalResult],
      { verified: check === remainders[i] }
    );
  }

  recorder.add(
    'message',
    [],
    5,
    `CRT complete. x = ${finalResult} (mod ${M}).`,
    [finalResult],
    { result: finalResult, M }
  );

  return recorder.getSteps();
}
