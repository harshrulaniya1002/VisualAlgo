import StepRecorder from '../../engine/StepRecorder';

export const meta = {
  name: "Strassen's Matrix Multiplication",
  slug: 'strassens-multiplication',
  category: 'divide-conquer',
  timeComplexity: {
    best: 'O(n^2.81)',
    average: 'O(n^2.81)',
    worst: 'O(n^2.81)',
  },
  spaceComplexity: 'O(n^2)',
  description:
    "Strassen's algorithm multiplies two matrices faster than the naive O(n^3) approach by splitting each matrix into 4 sub-matrices and computing only 7 recursive multiplications (M1-M7) instead of 8, then combining the results with additions and subtractions.",
  rendererType: 'bar',
  pseudocode: [
    'Split A into A11, A12, A21, A22',
    'Split B into B11, B12, B21, B22',
    'M1 = (A11 + A22) * (B11 + B22)',
    'M2 = (A21 + A22) * B11',
    'M3 = A11 * (B12 - B22)',
    'M4 = A22 * (B21 - B11)',
    'M5 = (A11 + A12) * B22',
    'M6 = (A21 - A11) * (B11 + B12)',
    'M7 = (A12 - A22) * (B21 + B22)',
    'C11 = M1 + M4 - M5 + M7',
    'C12 = M3 + M5',
    'C21 = M2 + M4',
    'C22 = M1 - M2 + M3 + M6',
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

// Format: [n, a11, a12, a21, a22, b11, b12, b21, b22] for 2x2 matrices
export const defaultInput = [2, 1, 3, 7, 5, 6, 8, 4, 2];

export function generateSteps(input) {
  const recorder = new StepRecorder();
  const raw = [...input];
  const n = raw[0];

  // Parse the two matrices from flat input
  // For a 2x2: input = [n, a11, a12, a21, a22, b11, b12, b21, b22]
  const total = n * n;
  const aFlat = raw.slice(1, 1 + total);
  const bFlat = raw.slice(1 + total, 1 + 2 * total);

  // Build 2D matrices
  const A = [];
  const B = [];
  for (let i = 0; i < n; i++) {
    A.push([]);
    B.push([]);
    for (let j = 0; j < n; j++) {
      A[i].push(aFlat[i * n + j] || 0);
      B[i].push(bFlat[i * n + j] || 0);
    }
  }

  function matStr(mat) {
    return '[' + mat.map((row) => '[' + row.join(',') + ']').join(', ') + ']';
  }

  // Use bar renderer: visualize the intermediate values as bar heights
  // We track all the M products and final result values
  const barValues = [...aFlat, ...bFlat];

  recorder.add(
    'message',
    [],
    -1,
    `Strassen's Multiplication: A = ${matStr(A)}, B = ${matStr(B)}`,
    [...barValues],
    { A, B, n }
  );

  if (n !== 2) {
    recorder.add(
      'message',
      [],
      -1,
      `Demonstrating Strassen's method for ${n}x${n} matrices. The algorithm recursively applies to sub-matrices.`,
      [...barValues],
      {}
    );
  }

  // For visualization, we demonstrate with 2x2 matrices (the base case of Strassen's)
  const a11 = A[0][0], a12 = A[0][1], a21 = A[1] ? A[1][0] : 0, a22 = A[1] ? A[1][1] : 0;
  const b11 = B[0][0], b12 = B[0][1], b21 = B[1] ? B[1][0] : 0, b22 = B[1] ? B[1][1] : 0;

  // DIVIDE: Split matrices
  recorder.add(
    'divide',
    [0, 1, 2, 3],
    0,
    `DIVIDE: Split A into A11=${a11}, A12=${a12}, A21=${a21}, A22=${a22}`,
    [...barValues],
    { a11, a12, a21, a22, phase: 'divide' }
  );

  recorder.add(
    'divide',
    [4, 5, 6, 7],
    1,
    `DIVIDE: Split B into B11=${b11}, B12=${b12}, B21=${b21}, B22=${b22}`,
    [...barValues],
    { b11, b12, b21, b22, phase: 'divide' }
  );

  // CONQUER: Compute the 7 Strassen products
  const m1 = (a11 + a22) * (b11 + b22);
  recorder.add(
    'compute',
    [0, 3, 4, 7],
    2,
    `M1 = (A11 + A22) * (B11 + B22) = (${a11} + ${a22}) * (${b11} + ${b22}) = ${a11 + a22} * ${b11 + b22} = ${m1}`,
    [...barValues, m1],
    { product: 'M1', value: m1, phase: 'conquer' }
  );

  const m2 = (a21 + a22) * b11;
  recorder.add(
    'compute',
    [2, 3, 4],
    3,
    `M2 = (A21 + A22) * B11 = (${a21} + ${a22}) * ${b11} = ${a21 + a22} * ${b11} = ${m2}`,
    [...barValues, m1, m2],
    { product: 'M2', value: m2, phase: 'conquer' }
  );

  const m3 = a11 * (b12 - b22);
  recorder.add(
    'compute',
    [0, 5, 7],
    4,
    `M3 = A11 * (B12 - B22) = ${a11} * (${b12} - ${b22}) = ${a11} * ${b12 - b22} = ${m3}`,
    [...barValues, m1, m2, m3],
    { product: 'M3', value: m3, phase: 'conquer' }
  );

  const m4 = a22 * (b21 - b11);
  recorder.add(
    'compute',
    [3, 6, 4],
    5,
    `M4 = A22 * (B21 - B11) = ${a22} * (${b21} - ${b11}) = ${a22} * ${b21 - b11} = ${m4}`,
    [...barValues, m1, m2, m3, m4],
    { product: 'M4', value: m4, phase: 'conquer' }
  );

  const m5 = (a11 + a12) * b22;
  recorder.add(
    'compute',
    [0, 1, 7],
    6,
    `M5 = (A11 + A12) * B22 = (${a11} + ${a12}) * ${b22} = ${a11 + a12} * ${b22} = ${m5}`,
    [...barValues, m1, m2, m3, m4, m5],
    { product: 'M5', value: m5, phase: 'conquer' }
  );

  const m6 = (a21 - a11) * (b11 + b12);
  recorder.add(
    'compute',
    [2, 0, 4, 5],
    7,
    `M6 = (A21 - A11) * (B11 + B12) = (${a21} - ${a11}) * (${b11} + ${b12}) = ${a21 - a11} * ${b11 + b12} = ${m6}`,
    [...barValues, m1, m2, m3, m4, m5, m6],
    { product: 'M6', value: m6, phase: 'conquer' }
  );

  const m7 = (a12 - a22) * (b21 + b22);
  recorder.add(
    'compute',
    [1, 3, 6, 7],
    8,
    `M7 = (A12 - A22) * (B21 + B22) = (${a12} - ${a22}) * (${b21} + ${b22}) = ${a12 - a22} * ${b21 + b22} = ${m7}`,
    [...barValues, m1, m2, m3, m4, m5, m6, m7],
    { product: 'M7', value: m7, phase: 'conquer' }
  );

  // COMBINE: Compute result matrix entries
  const c11 = m1 + m4 - m5 + m7;
  recorder.add(
    'merge',
    [],
    9,
    `COMBINE: C11 = M1 + M4 - M5 + M7 = ${m1} + ${m4} - ${m5} + ${m7} = ${c11}`,
    [c11],
    { entry: 'C11', value: c11, phase: 'combine' }
  );

  const c12 = m3 + m5;
  recorder.add(
    'merge',
    [],
    10,
    `COMBINE: C12 = M3 + M5 = ${m3} + ${m5} = ${c12}`,
    [c11, c12],
    { entry: 'C12', value: c12, phase: 'combine' }
  );

  const c21 = m2 + m4;
  recorder.add(
    'merge',
    [],
    11,
    `COMBINE: C21 = M2 + M4 = ${m2} + ${m4} = ${c21}`,
    [c11, c12, c21],
    { entry: 'C21', value: c21, phase: 'combine' }
  );

  const c22 = m1 - m2 + m3 + m6;
  recorder.add(
    'merge',
    [],
    12,
    `COMBINE: C22 = M1 - M2 + M3 + M6 = ${m1} - ${m2} + ${m3} + ${m6} = ${c22}`,
    [c11, c12, c21, c22],
    { entry: 'C22', value: c22, phase: 'combine' }
  );

  const resultMat = [[c11, c12], [c21, c22]];
  recorder.add(
    'sorted',
    [0, 1, 2, 3],
    -1,
    `Strassen's complete! Result C = ${matStr(resultMat)}`,
    [c11, c12, c21, c22],
    { result: resultMat }
  );

  // Verify against naive multiplication
  const naive00 = a11 * b11 + a12 * b21;
  const naive01 = a11 * b12 + a12 * b22;
  const naive10 = a21 * b11 + a22 * b21;
  const naive11 = a21 * b12 + a22 * b22;

  recorder.add(
    'message',
    [],
    -1,
    `Verification (naive): C = [[${naive00},${naive01}],[${naive10},${naive11}]] — matches Strassen's result: ${c11 === naive00 && c12 === naive01 && c21 === naive10 && c22 === naive11}`,
    [c11, c12, c21, c22],
    {}
  );

  return recorder.getSteps();
}
