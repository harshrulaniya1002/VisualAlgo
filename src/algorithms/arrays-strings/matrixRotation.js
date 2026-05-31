import StepRecorder from '../../engine/StepRecorder';

export const meta = {
  name: 'Matrix Rotation',
  slug: 'matrix-rotation',
  category: 'arrays-strings',
  timeComplexity: { best: 'O(n^2)', average: 'O(n^2)', worst: 'O(n^2)' },
  spaceComplexity: 'O(1)',
  description:
    'Rotates an n x n matrix 90 degrees clockwise in-place. First transposes the matrix (swap rows and columns), then reverses each row.',
  rendererType: 'grid',
  pseudocode: [
    'Transpose: swap matrix[i][j] with matrix[j][i]',
    'for i = 0 to n-1:',
    '  for j = i+1 to n-1:',
    '    swap(matrix[i][j], matrix[j][i])',
    'Reverse each row:',
    '  reverse(matrix[i])',
  ],
  inputSchema: {
    type: 'matrix',
    constraints: { minRows: 2, maxRows: 8, minCols: 2, maxCols: 8, minValue: 1, maxValue: 99 },
  },
};

export const defaultInput = [
  [1,  2,  3,  4],
  [5,  6,  7,  8],
  [9,  10, 11, 12],
  [13, 14, 15, 16],
];

export function generateSteps(input) {
  const recorder = new StepRecorder();
  const matrix = input.map(row => [...row]);
  const n = matrix.length;

  const rowHeaders = Array.from({ length: n }, (_, i) => `R${i}`);
  const colHeaders = Array.from({ length: n }, (_, i) => `C${i}`);

  function makeSnapshot(highlights) {
    return {
      grid: matrix.map(row => [...row]),
      highlights,
      rowHeaders,
      colHeaders,
    };
  }

  recorder.add('message', [], 0,
    `Rotating ${n}x${n} matrix 90 degrees clockwise`,
    makeSnapshot([]), {});

  // Step 1: Transpose
  recorder.add('message', [], 0,
    'Step 1: Transpose the matrix (swap matrix[i][j] with matrix[j][i])',
    makeSnapshot([]), {});

  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      recorder.add('compare', [], 3,
        `Swap matrix[${i}][${j}] = ${matrix[i][j]} with matrix[${j}][${i}] = ${matrix[j][i]}`,
        makeSnapshot([
          { row: i, col: j, state: 'computing' },
          { row: j, col: i, state: 'computing' },
        ]),
        { i, j });

      [matrix[i][j], matrix[j][i]] = [matrix[j][i], matrix[i][j]];

      recorder.add('swap', [], 3,
        `Swapped: matrix[${i}][${j}] = ${matrix[i][j]}, matrix[${j}][${i}] = ${matrix[j][i]}`,
        makeSnapshot([
          { row: i, col: j, state: 'computed' },
          { row: j, col: i, state: 'computed' },
        ]),
        { i, j });
    }
  }

  recorder.add('message', [], 0,
    'Transpose complete. Step 2: Reverse each row.',
    makeSnapshot([]), {});

  // Step 2: Reverse each row
  for (let i = 0; i < n; i++) {
    let left = 0, right = n - 1;

    recorder.add('highlight', [], 5,
      `Reversing row ${i}: [${matrix[i].join(', ')}]`,
      makeSnapshot(matrix[i].map((_, c) => ({ row: i, col: c, state: 'computing' }))),
      { row: i });

    while (left < right) {
      [matrix[i][left], matrix[i][right]] = [matrix[i][right], matrix[i][left]];

      recorder.add('swap', [], 5,
        `Row ${i}: swap col ${left} (${matrix[i][left]}) and col ${right} (${matrix[i][right]})`,
        makeSnapshot([
          { row: i, col: left, state: 'computing' },
          { row: i, col: right, state: 'computing' },
        ]),
        { row: i, left, right });

      left++;
      right--;
    }

    recorder.add('visit', [], 5,
      `Row ${i} reversed: [${matrix[i].join(', ')}]`,
      makeSnapshot(matrix[i].map((_, c) => ({ row: i, col: c, state: 'computed' }))),
      { row: i });
  }

  // Final state
  const allHighlights = [];
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      allHighlights.push({ row: i, col: j, state: 'optimal' });
    }
  }

  recorder.add('sorted', [], 0,
    'Matrix rotation complete! Rotated 90 degrees clockwise.',
    makeSnapshot(allHighlights), {});

  return recorder.getSteps();
}
