import StepRecorder from '../../engine/StepRecorder';

export const meta = {
  name: 'N-Queens',
  slug: 'n-queens',
  category: 'backtracking',
  timeComplexity: {
    best: 'O(n!)',
    average: 'O(n!)',
    worst: 'O(n!)',
  },
  spaceComplexity: 'O(n)',
  description:
    'The N-Queens problem places n queens on an n x n chessboard so that no two queens threaten each other. A queen can attack along its row, column, and diagonals. The algorithm uses backtracking to try placing a queen in each row, checking constraints, and undoing placements that lead to conflicts.',
  rendererType: 'bar',
  pseudocode: [
    'function solveNQueens(row):',
    '  if row == n: solution found',
    '  for col = 0 to n-1:',
    '    if isSafe(row, col):',
    '      place queen at (row, col)',
    '      solveNQueens(row + 1)',
    '      remove queen from (row, col)',
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

export const defaultInput = [4];

export function generateSteps(input) {
  const recorder = new StepRecorder();
  const n = input[0] || 4;

  // queens[i] = column where queen is placed in row i, -1 if no queen
  const queens = new Array(n).fill(-1);
  let solutionFound = false;

  function makeSnapshot() {
    // Bar visualization: each bar represents a row, bar height = column position + 1 (0 means no queen)
    return queens.map(q => (q === -1 ? 0 : q + 1));
  }

  function isSafe(row, col) {
    for (let i = 0; i < row; i++) {
      if (queens[i] === col) return false;
      if (Math.abs(queens[i] - col) === Math.abs(i - row)) return false;
    }
    return true;
  }

  recorder.add(
    'message',
    [],
    -1,
    `Starting N-Queens solver for ${n}x${n} board`,
    makeSnapshot(),
    {}
  );

  function solve(row) {
    if (solutionFound) return;

    if (row === n) {
      solutionFound = true;
      recorder.add(
        'sorted',
        Array.from({ length: n }, (_, i) => i),
        1,
        `Solution found! Queens placed at columns: [${queens.join(', ')}]`,
        makeSnapshot(),
        {}
      );
      return;
    }

    recorder.add(
      'message',
      [row],
      0,
      `Trying to place a queen in row ${row}`,
      makeSnapshot(),
      {}
    );

    for (let col = 0; col < n; col++) {
      if (solutionFound) return;

      recorder.add(
        'compare',
        [row],
        3,
        `Checking if column ${col} is safe for row ${row}`,
        makeSnapshot(),
        {}
      );

      if (isSafe(row, col)) {
        queens[row] = col;
        recorder.add(
          'visit',
          [row],
          4,
          `Place queen at row ${row}, column ${col} (safe position)`,
          makeSnapshot(),
          {}
        );

        solve(row + 1);

        if (!solutionFound) {
          queens[row] = -1;
          recorder.add(
            'backtrack',
            [row],
            6,
            `Remove queen from row ${row}, column ${col} (backtrack)`,
            makeSnapshot(),
            {}
          );
        }
      } else {
        recorder.add(
          'highlight',
          [row],
          3,
          `Column ${col} conflicts with an existing queen in row ${row} - skip`,
          makeSnapshot(),
          {}
        );
      }
    }
  }

  solve(0);

  if (!solutionFound) {
    recorder.add(
      'message',
      [],
      -1,
      `No solution exists for the ${n}-Queens problem`,
      makeSnapshot(),
      {}
    );
  }

  recorder.add(
    'message',
    [],
    -1,
    'N-Queens solver complete.',
    makeSnapshot(),
    {}
  );

  return recorder.getSteps();
}
