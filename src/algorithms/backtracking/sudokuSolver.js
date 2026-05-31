import StepRecorder from '../../engine/StepRecorder';

export const meta = {
  name: 'Sudoku Solver',
  slug: 'sudoku-solver',
  category: 'backtracking',
  timeComplexity: {
    best: 'O(9^(n*n))',
    average: 'O(9^(n*n))',
    worst: 'O(9^(n*n))',
  },
  spaceComplexity: 'O(n*n)',
  description:
    'Solves a 9x9 Sudoku puzzle using backtracking. The algorithm finds empty cells and tries placing digits 1-9. For each digit, it checks row, column, and 3x3 box constraints. If a digit leads to a dead end, it backtracks and tries the next digit.',
  rendererType: 'bar',
  pseudocode: [
    'function solveSudoku():',
    '  find next empty cell (row, col)',
    '  if no empty cell: puzzle solved',
    '  for digit = 1 to 9:',
    '    if isValid(row, col, digit):',
    '      place digit at (row, col)',
    '      if solveSudoku(): return true',
    '      remove digit (backtrack)',
  ],
  inputSchema: {
    type: 'array',
    constraints: {
      minLength: 1,
      maxLength: 81,
      minValue: 0,
      maxValue: 999,
    },
  },
};

export const defaultInput = [
  5,3,0,0,7,0,0,0,0,
  6,0,0,1,9,5,0,0,0,
  0,9,8,0,0,0,0,6,0,
  8,0,0,0,6,0,0,0,3,
  4,0,0,8,0,3,0,0,1,
  7,0,0,0,2,0,0,0,6,
  0,6,0,0,0,0,2,8,0,
  0,0,0,4,1,9,0,0,5,
  0,0,0,0,8,0,0,7,9,
];

export function generateSteps(input) {
  const recorder = new StepRecorder();
  const board = [];

  // Parse flat input into 9x9 grid
  for (let r = 0; r < 9; r++) {
    board.push([]);
    for (let c = 0; c < 9; c++) {
      board[r].push(input[r * 9 + c] || 0);
    }
  }

  function makeSnapshot() {
    // Flatten the 9x9 board into a 81-element array for bar visualization
    const flat = [];
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        flat.push(board[r][c]);
      }
    }
    return flat;
  }

  function toIndex(row, col) {
    return row * 9 + col;
  }

  function isValid(row, col, num) {
    // Check row
    for (let c = 0; c < 9; c++) {
      if (board[row][c] === num) return false;
    }
    // Check column
    for (let r = 0; r < 9; r++) {
      if (board[r][col] === num) return false;
    }
    // Check 3x3 box
    const boxRow = Math.floor(row / 3) * 3;
    const boxCol = Math.floor(col / 3) * 3;
    for (let r = boxRow; r < boxRow + 3; r++) {
      for (let c = boxCol; c < boxCol + 3; c++) {
        if (board[r][c] === num) return false;
      }
    }
    return true;
  }

  function findEmpty() {
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (board[r][c] === 0) return [r, c];
      }
    }
    return null;
  }

  let solved = false;
  let stepCount = 0;
  const maxSteps = 800;

  recorder.add(
    'message',
    [],
    -1,
    'Starting Sudoku Solver with backtracking',
    makeSnapshot(),
    {}
  );

  function solve() {
    if (solved || stepCount > maxSteps) return false;

    const empty = findEmpty();
    if (!empty) {
      solved = true;
      recorder.add(
        'sorted',
        Array.from({ length: 81 }, (_, i) => i),
        2,
        'Puzzle solved! All cells filled correctly.',
        makeSnapshot(),
        {}
      );
      return true;
    }

    const [row, col] = empty;
    const idx = toIndex(row, col);

    recorder.add(
      'visit',
      [idx],
      1,
      `Trying to fill cell (${row}, ${col})`,
      makeSnapshot(),
      {}
    );
    stepCount++;

    for (let num = 1; num <= 9; num++) {
      if (stepCount > maxSteps) return false;

      recorder.add(
        'compare',
        [idx],
        4,
        `Checking if ${num} is valid at (${row}, ${col})`,
        makeSnapshot(),
        {}
      );
      stepCount++;

      if (isValid(row, col, num)) {
        board[row][col] = num;
        recorder.add(
          'visit',
          [idx],
          5,
          `Place ${num} at (${row}, ${col})`,
          makeSnapshot(),
          {}
        );
        stepCount++;

        if (solve()) return true;

        if (!solved) {
          board[row][col] = 0;
          recorder.add(
            'backtrack',
            [idx],
            7,
            `Remove ${num} from (${row}, ${col}) - backtrack`,
            makeSnapshot(),
            {}
          );
          stepCount++;
        }
      }
    }

    return false;
  }

  solve();

  if (!solved) {
    recorder.add(
      'message',
      [],
      -1,
      stepCount > maxSteps ? 'Step limit reached. Partial solution shown.' : 'No solution exists for this Sudoku puzzle.',
      makeSnapshot(),
      {}
    );
  }

  recorder.add(
    'message',
    [],
    -1,
    'Sudoku Solver complete.',
    makeSnapshot(),
    {}
  );

  return recorder.getSteps();
}
