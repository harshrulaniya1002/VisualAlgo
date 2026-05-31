import StepRecorder from '../../engine/StepRecorder';

export const meta = {
  name: 'Grid BFS/DFS',
  slug: 'grid-bfs-dfs',
  category: 'graph-traversal',
  timeComplexity: { best: 'O(R * C)', average: 'O(R * C)', worst: 'O(R * C)' },
  spaceComplexity: 'O(R * C)',
  description:
    'Applies BFS on a 2D grid where each cell is a node and adjacent cells (up, down, left, right) are edges. Walls (value 1) block movement. Finds shortest path from top-left to bottom-right.',
  rendererType: 'grid',
  pseudocode: [
    'enqueue start cell (0,0)',
    'while queue not empty:',
    '  cell = dequeue()',
    '  for each 4-directional neighbor:',
    '    if valid and not wall and not visited:',
    '      mark visited, enqueue neighbor',
  ],
  inputSchema: {
    type: 'array',
    constraints: { minLength: 2, maxLength: 50, minValue: 0, maxValue: 1 },
  },
};

// Format: [rows, cols, cell(0,0), cell(0,1), ..., cell(rows-1, cols-1)]
// 0 = open, 1 = wall
export const defaultInput = [
  5, 5,
  0, 0, 0, 1, 0,
  0, 1, 0, 1, 0,
  0, 1, 0, 0, 0,
  0, 0, 1, 1, 0,
  1, 0, 0, 0, 0,
];

export function generateSteps(input) {
  const recorder = new StepRecorder();
  const rows = input[0];
  const cols = input[1];

  // Build grid
  const grid = [];
  let idx = 2;
  for (let r = 0; r < rows; r++) {
    const row = [];
    for (let c = 0; c < cols; c++) {
      row.push(input[idx++] || 0);
    }
    grid.push(row);
  }

  // Display values: 0 = open path shown as '.', 1 = wall shown as '#'
  function displayGrid() {
    return grid.map(row => row.map(v => v === 1 ? '#' : '.'));
  }

  const visited = Array.from({ length: rows }, () => new Array(cols).fill(false));
  const parent = Array.from({ length: rows }, () => new Array(cols).fill(null));

  function makeSnapshot(highlights) {
    return {
      grid: displayGrid(),
      highlights,
      rowHeaders: Array.from({ length: rows }, (_, i) => String(i)),
      colHeaders: Array.from({ length: cols }, (_, i) => String(i)),
    };
  }

  function getHighlights() {
    const hl = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (visited[r][c]) hl.push({ row: r, col: c, state: 'computed' });
        if (grid[r][c] === 1) hl.push({ row: r, col: c, state: 'default' });
      }
    }
    return hl;
  }

  recorder.add('message', [], -1, `BFS on ${rows}x${cols} grid. Find path from (0,0) to (${rows - 1},${cols - 1})`, makeSnapshot([]));

  if (grid[0][0] === 1) {
    recorder.add('message', [], -1, 'Start cell is a wall. No path exists.', makeSnapshot([]));
    return recorder.getSteps();
  }

  const dirs = [[0, 1], [0, -1], [1, 0], [-1, 0]];
  const queue = [[0, 0]];
  visited[0][0] = true;

  recorder.add('visit', [], 0, 'Enqueue start cell (0, 0)', makeSnapshot([...getHighlights(), { row: 0, col: 0, state: 'computing' }]));

  let found = false;

  while (queue.length > 0 && !found) {
    const [r, c] = queue.shift();
    const hl = [...getHighlights(), { row: r, col: c, state: 'computing' }];
    recorder.add('visit', [], 2, `Dequeue cell (${r}, ${c})`, makeSnapshot(hl));

    for (const [dr, dc] of dirs) {
      const nr = r + dr, nc = c + dc;
      if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && !visited[nr][nc] && grid[nr][nc] === 0) {
        visited[nr][nc] = true;
        parent[nr][nc] = [r, c];
        queue.push([nr, nc]);

        const hl2 = [...getHighlights(), { row: nr, col: nc, state: 'computing' }];
        recorder.add('visit', [], 5, `Visit neighbor (${nr}, ${nc})`, makeSnapshot(hl2));

        if (nr === rows - 1 && nc === cols - 1) {
          found = true;
          break;
        }
      }
    }
  }

  if (found) {
    // Trace path
    const path = [];
    let curr = [rows - 1, cols - 1];
    while (curr) {
      path.unshift(curr);
      curr = parent[curr[0]][curr[1]];
    }

    const pathHighlights = getHighlights();
    for (const [r, c] of path) {
      pathHighlights.push({ row: r, col: c, state: 'optimal' });
    }
    recorder.add('message', [], -1, `Path found with ${path.length} cells!`, makeSnapshot(pathHighlights));
  } else {
    recorder.add('message', [], -1, 'No path exists from start to end.', makeSnapshot(getHighlights()));
  }

  return recorder.getSteps();
}
