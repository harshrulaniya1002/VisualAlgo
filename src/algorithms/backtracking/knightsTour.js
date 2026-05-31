import StepRecorder from '../../engine/StepRecorder';

export const meta = {
  name: "Knight's Tour",
  slug: 'knights-tour',
  category: 'backtracking',
  timeComplexity: {
    best: 'O(8^(n^2))',
    average: 'O(8^(n^2))',
    worst: 'O(8^(n^2))',
  },
  spaceComplexity: 'O(n^2)',
  description:
    "The Knight's Tour problem finds a sequence of knight moves on an n x n chessboard such that the knight visits every square exactly once. The algorithm uses backtracking with Warnsdorff's heuristic, which prioritizes moves to squares with the fewest onward moves, greatly reducing the search space.",
  rendererType: 'bar',
  pseudocode: [
    'function knightTour(row, col, moveNum):',
    '  if moveNum == n*n: tour complete',
    '  get valid moves sorted by Warnsdorff heuristic',
    '  for each move (nextRow, nextCol):',
    '    place moveNum at (nextRow, nextCol)',
    '    if knightTour(nextRow, nextCol, moveNum+1): return true',
    '    remove moveNum (backtrack)',
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

export const defaultInput = [5];

export function generateSteps(input) {
  const recorder = new StepRecorder();
  const n = input[0] || 5;
  const total = n * n;

  // Board stores move numbers (0 = unvisited, positive = move order)
  const board = Array.from({ length: n }, () => new Array(n).fill(0));

  // All 8 possible knight moves
  const knightMoves = [
    [-2, -1], [-2, 1], [-1, -2], [-1, 2],
    [1, -2], [1, 2], [2, -1], [2, 1],
  ];

  function toIndex(row, col) {
    return row * n + col;
  }

  function makeSnapshot() {
    const flat = [];
    for (let r = 0; r < n; r++) {
      for (let c = 0; c < n; c++) {
        flat.push(board[r][c]);
      }
    }
    return flat;
  }

  function isValid(row, col) {
    return row >= 0 && row < n && col >= 0 && col < n && board[row][col] === 0;
  }

  // Warnsdorff heuristic: count how many valid moves are available from (row, col)
  function getDegree(row, col) {
    let count = 0;
    for (const [dr, dc] of knightMoves) {
      if (isValid(row + dr, col + dc)) count++;
    }
    return count;
  }

  // Get sorted next moves using Warnsdorff's rule
  function getNextMoves(row, col) {
    const moves = [];
    for (const [dr, dc] of knightMoves) {
      const nr = row + dr;
      const nc = col + dc;
      if (isValid(nr, nc)) {
        moves.push({ row: nr, col: nc, degree: getDegree(nr, nc) });
      }
    }
    moves.sort((a, b) => a.degree - b.degree);
    return moves;
  }

  let solved = false;
  let stepCount = 0;
  const maxSteps = 500;

  recorder.add(
    'message',
    [],
    -1,
    `Starting Knight's Tour on a ${n}x${n} board. The knight starts at (0, 0).`,
    makeSnapshot(),
    {}
  );

  // Start at (0, 0) with move number 1
  board[0][0] = 1;
  recorder.add(
    'visit',
    [0],
    0,
    'Place knight at (0, 0) as move 1',
    makeSnapshot(),
    {}
  );

  function solve(row, col, moveNum) {
    if (solved || stepCount > maxSteps) return false;

    if (moveNum > total) {
      solved = true;
      recorder.add(
        'sorted',
        Array.from({ length: total }, (_, i) => i),
        1,
        `Knight's Tour complete! All ${total} squares visited.`,
        makeSnapshot(),
        {}
      );
      return true;
    }

    const moves = getNextMoves(row, col);

    recorder.add(
      'message',
      [toIndex(row, col)],
      2,
      `From (${row}, ${col}): ${moves.length} valid moves available (sorted by Warnsdorff heuristic)`,
      makeSnapshot(),
      {}
    );
    stepCount++;

    for (const move of moves) {
      if (solved || stepCount > maxSteps) return solved;

      recorder.add(
        'compare',
        [toIndex(move.row, move.col)],
        3,
        `Try move ${moveNum} to (${move.row}, ${move.col}) [degree: ${move.degree}]`,
        makeSnapshot(),
        {}
      );
      stepCount++;

      board[move.row][move.col] = moveNum;
      recorder.add(
        'visit',
        [toIndex(move.row, move.col)],
        4,
        `Place knight at (${move.row}, ${move.col}) as move ${moveNum}`,
        makeSnapshot(),
        {}
      );
      stepCount++;

      if (solve(move.row, move.col, moveNum + 1)) return true;

      if (!solved) {
        board[move.row][move.col] = 0;
        recorder.add(
          'backtrack',
          [toIndex(move.row, move.col)],
          6,
          `Remove knight from (${move.row}, ${move.col}) (backtrack)`,
          makeSnapshot(),
          {}
        );
        stepCount++;
      }
    }

    return false;
  }

  solve(0, 0, 2);

  if (!solved) {
    recorder.add(
      'message',
      [],
      -1,
      stepCount > maxSteps
        ? 'Step limit reached. Partial tour shown.'
        : `No complete Knight's Tour found from (0, 0) on a ${n}x${n} board.`,
      makeSnapshot(),
      {}
    );
  }

  recorder.add(
    'message',
    [],
    -1,
    "Knight's Tour solver complete.",
    makeSnapshot(),
    {}
  );

  return recorder.getSteps();
}
