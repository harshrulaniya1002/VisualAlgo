import StepRecorder from '../../engine/StepRecorder';

export const meta = {
  name: 'Rat in a Maze',
  slug: 'rat-in-maze',
  category: 'backtracking',
  timeComplexity: {
    best: 'O(2^(n^2))',
    average: 'O(2^(n^2))',
    worst: 'O(2^(n^2))',
  },
  spaceComplexity: 'O(n^2)',
  description:
    'The Rat in a Maze problem finds a path from the top-left corner (0,0) to the bottom-right corner (n-1,n-1) in a grid. The rat can move down, right, up, or left. Cells with value 1 are open paths and cells with value 0 are walls. Backtracking is used to explore all directions and undo moves that lead to dead ends.',
  rendererType: 'bar',
  pseudocode: [
    'function solveMaze(row, col):',
    '  if (row, col) is destination: return true',
    '  for each direction (D, R, U, L):',
    '    if move is valid and cell is open:',
    '      mark cell as part of path',
    '      if solveMaze(nextRow, nextCol): return true',
    '      unmark cell (backtrack)',
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

// First value is n (grid size), followed by n*n values (1 = open, 0 = wall)
export const defaultInput = [
  4,
  1, 0, 0, 0,
  1, 1, 0, 1,
  0, 1, 0, 0,
  1, 1, 1, 1,
];

export function generateSteps(input) {
  const recorder = new StepRecorder();
  const n = input[0];
  const maze = [];
  const path = [];

  // Parse flat input into n x n grid
  for (let r = 0; r < n; r++) {
    maze.push([]);
    path.push([]);
    for (let c = 0; c < n; c++) {
      maze[r].push(input[1 + r * n + c]);
      path[r].push(0);
    }
  }

  const directions = [
    [1, 0, 'Down'],
    [0, 1, 'Right'],
    [-1, 0, 'Up'],
    [0, -1, 'Left'],
  ];

  function toIndex(row, col) {
    return row * n + col;
  }

  function makeSnapshot() {
    // Flat array: 0 = wall, 1 = open, 2 = on current path
    const flat = [];
    for (let r = 0; r < n; r++) {
      for (let c = 0; c < n; c++) {
        if (path[r][c]) {
          flat.push(2);
        } else {
          flat.push(maze[r][c]);
        }
      }
    }
    return flat;
  }

  function isValid(row, col) {
    return row >= 0 && row < n && col >= 0 && col < n && maze[row][col] === 1 && !path[row][col];
  }

  let solved = false;

  recorder.add(
    'message',
    [],
    -1,
    `Starting Rat in a Maze on a ${n}x${n} grid. Find path from (0,0) to (${n - 1},${n - 1}).`,
    makeSnapshot(),
    {}
  );

  function solve(row, col) {
    if (solved) return false;

    if (row === n - 1 && col === n - 1) {
      path[row][col] = 1;
      solved = true;
      recorder.add(
        'sorted',
        [toIndex(row, col)],
        1,
        `Reached destination (${row}, ${col})! Path found.`,
        makeSnapshot(),
        {}
      );
      return true;
    }

    path[row][col] = 1;
    recorder.add(
      'visit',
      [toIndex(row, col)],
      4,
      `Move to cell (${row}, ${col}) and mark as part of path`,
      makeSnapshot(),
      {}
    );

    for (const [dr, dc, dirName] of directions) {
      if (solved) return true;
      const nr = row + dr;
      const nc = col + dc;

      recorder.add(
        'compare',
        [toIndex(row, col)],
        2,
        `Try moving ${dirName} from (${row}, ${col}) to (${nr}, ${nc})`,
        makeSnapshot(),
        {}
      );

      if (isValid(nr, nc)) {
        if (solve(nr, nc)) return true;
      } else {
        const reason = (nr < 0 || nr >= n || nc < 0 || nc >= n)
          ? 'out of bounds'
          : (maze[nr] && maze[nr][nc] === 0 ? 'wall' : 'already visited');
        recorder.add(
          'highlight',
          [],
          3,
          `Cannot move ${dirName} to (${nr}, ${nc}): ${reason}`,
          makeSnapshot(),
          {}
        );
      }
    }

    if (!solved) {
      path[row][col] = 0;
      recorder.add(
        'backtrack',
        [toIndex(row, col)],
        6,
        `Dead end at (${row}, ${col}). Backtrack and unmark.`,
        makeSnapshot(),
        {}
      );
    }

    return false;
  }

  if (maze[0][0] === 1) {
    solve(0, 0);
  }

  if (!solved) {
    recorder.add(
      'message',
      [],
      -1,
      'No path exists from (0,0) to the destination.',
      makeSnapshot(),
      {}
    );
  }

  recorder.add(
    'message',
    [],
    -1,
    'Rat in a Maze solver complete.',
    makeSnapshot(),
    {}
  );

  return recorder.getSteps();
}
