import StepRecorder from '../../engine/StepRecorder';

export const meta = {
  name: 'Word Search',
  slug: 'word-search',
  category: 'backtracking',
  timeComplexity: {
    best: 'O(m * n * 4^L)',
    average: 'O(m * n * 4^L)',
    worst: 'O(m * n * 4^L)',
  },
  spaceComplexity: 'O(L)',
  description:
    'Word Search determines if a target sequence exists in a 2D grid by forming a path of adjacent cells (up, down, left, right). Each cell may only be used once per path. The algorithm uses DFS with backtracking, trying all four directions from each starting cell and unmarking visited cells when a path fails.',
  rendererType: 'bar',
  pseudocode: [
    'function search(row, col, index):',
    '  if index == word.length: return true',
    '  if out of bounds or visited or mismatch: return false',
    '  mark cell as visited',
    '  for each direction (U, D, L, R):',
    '    if search(nextRow, nextCol, index+1): return true',
    '  unmark cell (backtrack)',
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

// Format: [rows, cols, ...values]
// 3x3 grid with values 1-9, search for path [1, 2, 3, 6, 9]
export const defaultInput = [3, 3, 1, 2, 3, 4, 5, 6, 7, 8, 9];

export function generateSteps(input) {
  const recorder = new StepRecorder();
  const rows = input[0];
  const cols = input[1];
  const grid = [];

  for (let r = 0; r < rows; r++) {
    grid.push([]);
    for (let c = 0; c < cols; c++) {
      grid[r].push(input[2 + r * cols + c]);
    }
  }

  // Target sequence to find: path through adjacent cells
  const target = [1, 2, 3, 6, 9];
  const visited = Array.from({ length: rows }, () => new Array(cols).fill(false));

  const directions = [
    [-1, 0, 'Up'],
    [1, 0, 'Down'],
    [0, -1, 'Left'],
    [0, 1, 'Right'],
  ];

  function toIndex(row, col) {
    return row * cols + col;
  }

  function makeSnapshot() {
    // Flat array showing grid values; visited cells get a high marker value
    const flat = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        flat.push(visited[r][c] ? grid[r][c] + 100 : grid[r][c]);
      }
    }
    return flat;
  }

  let found = false;

  recorder.add(
    'message',
    [],
    -1,
    `Starting Word Search on ${rows}x${cols} grid. Looking for sequence [${target.join(', ')}].`,
    makeSnapshot(),
    {}
  );

  function search(row, col, index) {
    if (found) return true;

    if (index === target.length) {
      found = true;
      recorder.add(
        'sorted',
        Array.from({ length: rows * cols }, (_, i) => i),
        1,
        `Sequence [${target.join(', ')}] found!`,
        makeSnapshot(),
        {}
      );
      return true;
    }

    if (row < 0 || row >= rows || col < 0 || col >= cols) return false;
    if (visited[row][col]) return false;
    if (grid[row][col] !== target[index]) return false;

    // Match found at this cell
    visited[row][col] = true;
    recorder.add(
      'visit',
      [toIndex(row, col)],
      3,
      `Cell (${row}, ${col}) = ${grid[row][col]} matches target[${index}] = ${target[index]}. Mark visited.`,
      makeSnapshot(),
      {}
    );

    for (const [dr, dc, dirName] of directions) {
      if (found) return true;
      const nr = row + dr;
      const nc = col + dc;

      if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && !visited[nr][nc]) {
        recorder.add(
          'compare',
          [toIndex(nr, nc)],
          4,
          `Try ${dirName} to (${nr}, ${nc}) = ${grid[nr][nc]}, need ${target[index + 1]}`,
          makeSnapshot(),
          {}
        );

        if (search(nr, nc, index + 1)) return true;
      }
    }

    if (!found) {
      visited[row][col] = false;
      recorder.add(
        'backtrack',
        [toIndex(row, col)],
        6,
        `No valid path from (${row}, ${col}). Unmark and backtrack.`,
        makeSnapshot(),
        {}
      );
    }

    return false;
  }

  // Try each cell as starting point
  for (let r = 0; r < rows && !found; r++) {
    for (let c = 0; c < cols && !found; c++) {
      if (grid[r][c] === target[0]) {
        recorder.add(
          'highlight',
          [toIndex(r, c)],
          0,
          `Trying (${r}, ${c}) = ${grid[r][c]} as starting cell`,
          makeSnapshot(),
          {}
        );
        search(r, c, 0);
      }
    }
  }

  if (!found) {
    recorder.add(
      'message',
      [],
      -1,
      `Sequence [${target.join(', ')}] not found in the grid.`,
      makeSnapshot(),
      {}
    );
  }

  recorder.add(
    'message',
    [],
    -1,
    'Word Search complete.',
    makeSnapshot(),
    {}
  );

  return recorder.getSteps();
}
