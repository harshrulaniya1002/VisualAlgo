import StepRecorder from '../../engine/StepRecorder';

export const meta = {
  name: 'Matrix Spiral Traversal',
  slug: 'matrix-spiral-traversal',
  category: 'arrays-strings',
  timeComplexity: { best: 'O(m*n)', average: 'O(m*n)', worst: 'O(m*n)' },
  spaceComplexity: 'O(1)',
  description:
    'Traverses a 2D matrix in spiral order from the outermost layer inward. Moves right, then down, then left, then up, shrinking the boundaries after each direction.',
  rendererType: 'grid',
  pseudocode: [
    'top=0, bottom=rows-1, left=0, right=cols-1',
    'while top<=bottom and left<=right:',
    '  traverse right along top row; top++',
    '  traverse down along right col; right--',
    '  traverse left along bottom row; bottom--',
    '  traverse up along left col; left++',
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
  const rows = matrix.length;
  const cols = matrix[0].length;

  const rowHeaders = Array.from({ length: rows }, (_, i) => `${i}`);
  const colHeaders = Array.from({ length: cols }, (_, i) => `${i}`);

  const visited = []; // track visited cells for highlights

  function makeSnapshot(currentHighlights) {
    return {
      grid: matrix.map(row => [...row]),
      highlights: [
        ...visited.map(v => ({ row: v.row, col: v.col, state: 'computed' })),
        ...currentHighlights,
      ],
      rowHeaders,
      colHeaders,
    };
  }

  recorder.add('message', [], 0,
    `Starting spiral traversal of ${rows}x${cols} matrix`,
    makeSnapshot([]), {});

  let top = 0, bottom = rows - 1, left = 0, right = cols - 1;
  const result = [];

  while (top <= bottom && left <= right) {
    // Traverse right along top row
    for (let c = left; c <= right; c++) {
      recorder.add('visit', [], 2,
        `Move right: matrix[${top}][${c}] = ${matrix[top][c]}`,
        makeSnapshot([{ row: top, col: c, state: 'computing' }]),
        { direction: 'right', value: matrix[top][c] });
      result.push(matrix[top][c]);
      visited.push({ row: top, col: c });
    }
    top++;

    // Traverse down along right column
    for (let r = top; r <= bottom; r++) {
      recorder.add('visit', [], 2,
        `Move down: matrix[${r}][${right}] = ${matrix[r][right]}`,
        makeSnapshot([{ row: r, col: right, state: 'computing' }]),
        { direction: 'down', value: matrix[r][right] });
      result.push(matrix[r][right]);
      visited.push({ row: r, col: right });
    }
    right--;

    // Traverse left along bottom row
    if (top <= bottom) {
      for (let c = right; c >= left; c--) {
        recorder.add('visit', [], 3,
          `Move left: matrix[${bottom}][${c}] = ${matrix[bottom][c]}`,
          makeSnapshot([{ row: bottom, col: c, state: 'computing' }]),
          { direction: 'left', value: matrix[bottom][c] });
        result.push(matrix[bottom][c]);
        visited.push({ row: bottom, col: c });
      }
      bottom--;
    }

    // Traverse up along left column
    if (left <= right) {
      for (let r = bottom; r >= top; r--) {
        recorder.add('visit', [], 5,
          `Move up: matrix[${r}][${left}] = ${matrix[r][left]}`,
          makeSnapshot([{ row: r, col: left, state: 'computing' }]),
          { direction: 'up', value: matrix[r][left] });
        result.push(matrix[r][left]);
        visited.push({ row: r, col: left });
      }
      left++;
    }
  }

  recorder.add('sorted', [], 0,
    `Spiral traversal complete: [${result.join(', ')}]`,
    makeSnapshot([]),
    { result });

  return recorder.getSteps();
}
