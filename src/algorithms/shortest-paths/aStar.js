import StepRecorder from '../../engine/StepRecorder';

export const meta = {
  name: 'A* Search Algorithm',
  slug: 'a-star',
  category: 'shortest-paths',
  timeComplexity: { best: 'O(E)', average: 'O(E)', worst: 'O(V^2)' },
  spaceComplexity: 'O(V)',
  description:
    'A* finds the shortest path on a grid using f(n) = g(n) + h(n), where g is the cost from start and h is a heuristic estimate to the goal (Manhattan distance). It explores the most promising nodes first.',
  rendererType: 'grid',
  pseudocode: [
    'add start to open set, g[start] = 0',
    'while open set not empty:',
    '  current = node with lowest f = g + h',
    '  if current is goal: reconstruct path',
    '  for each neighbor of current:',
    '    if new g < g[neighbor]: update & add to open',
  ],
  inputSchema: {
    type: 'array',
    constraints: { minLength: 2, maxLength: 50, minValue: 0, maxValue: 1 },
  },
};

// Format: [rows, cols, grid cells...] 0=open, 1=wall
export const defaultInput = [
  7, 7,
  0, 0, 0, 0, 0, 0, 0,
  0, 1, 1, 0, 1, 1, 0,
  0, 0, 0, 0, 0, 1, 0,
  0, 1, 0, 1, 0, 0, 0,
  0, 1, 0, 1, 1, 1, 0,
  0, 0, 0, 0, 0, 0, 0,
  0, 1, 1, 1, 0, 1, 0,
];

export function generateSteps(input) {
  const recorder = new StepRecorder();
  const rows = input[0];
  const cols = input[1];

  const grid = [];
  let idx = 2;
  for (let r = 0; r < rows; r++) {
    const row = [];
    for (let c = 0; c < cols; c++) {
      row.push(input[idx++] || 0);
    }
    grid.push(row);
  }

  const startR = 0, startC = 0;
  const goalR = rows - 1, goalC = cols - 1;

  function displayGrid() {
    return grid.map(row => row.map(v => (v === 1 ? '#' : '.')));
  }

  function heuristic(r, c) {
    return Math.abs(r - goalR) + Math.abs(c - goalC);
  }

  const g = Array.from({ length: rows }, () => new Array(cols).fill(Infinity));
  const f = Array.from({ length: rows }, () => new Array(cols).fill(Infinity));
  const parent = Array.from({ length: rows }, () => new Array(cols).fill(null));
  const closed = Array.from({ length: rows }, () => new Array(cols).fill(false));

  function makeSnapshot(extraHighlights) {
    const highlights = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (closed[r][c]) highlights.push({ row: r, col: c, state: 'computed' });
        else if (g[r][c] < Infinity) highlights.push({ row: r, col: c, state: 'computing' });
      }
    }
    if (extraHighlights) highlights.push(...extraHighlights);
    return {
      grid: displayGrid(),
      highlights,
      rowHeaders: Array.from({ length: rows }, (_, i) => String(i)),
      colHeaders: Array.from({ length: cols }, (_, i) => String(i)),
    };
  }

  recorder.add('message', [], -1, `A* search from (0,0) to (${goalR},${goalC})`, makeSnapshot([]));

  if (grid[startR][startC] === 1 || grid[goalR][goalC] === 1) {
    recorder.add('message', [], -1, 'Start or goal is blocked. No path.', makeSnapshot([]));
    return recorder.getSteps();
  }

  g[startR][startC] = 0;
  f[startR][startC] = heuristic(startR, startC);
  const openSet = [[startR, startC]];

  recorder.add('visit', [], 0, `Init: g(0,0)=0, h=${heuristic(startR, startC)}, f=${f[startR][startC]}`, makeSnapshot([]));

  const dirs = [[0, 1], [0, -1], [1, 0], [-1, 0]];
  let found = false;

  while (openSet.length > 0) {
    // Find node with lowest f
    openSet.sort((a, b) => f[a[0]][a[1]] - f[b[0]][b[1]]);
    const [cr, cc] = openSet.shift();

    if (closed[cr][cc]) continue;
    closed[cr][cc] = true;

    recorder.add('visit', [], 2, `Expand (${cr},${cc}) with f=${f[cr][cc]}, g=${g[cr][cc]}`, makeSnapshot([{ row: cr, col: cc, state: 'computing' }]));

    if (cr === goalR && cc === goalC) {
      found = true;
      recorder.add('message', [], 3, 'Goal reached!', makeSnapshot([]));
      break;
    }

    for (const [dr, dc] of dirs) {
      const nr = cr + dr, nc = cc + dc;
      if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) continue;
      if (grid[nr][nc] === 1 || closed[nr][nc]) continue;

      const tentG = g[cr][cc] + 1;
      if (tentG < g[nr][nc]) {
        parent[nr][nc] = [cr, cc];
        g[nr][nc] = tentG;
        f[nr][nc] = tentG + heuristic(nr, nc);
        openSet.push([nr, nc]);

        recorder.add('visit', [], 5, `Update (${nr},${nc}): g=${tentG}, h=${heuristic(nr, nc)}, f=${f[nr][nc]}`, makeSnapshot([{ row: nr, col: nc, state: 'computing' }]));
      }
    }
  }

  if (found) {
    const path = [];
    let curr = [goalR, goalC];
    while (curr) {
      path.unshift(curr);
      curr = parent[curr[0]][curr[1]];
    }
    const pathHL = path.map(([r, c]) => ({ row: r, col: c, state: 'optimal' }));
    recorder.add('message', [], -1, `Path found with length ${path.length}!`, makeSnapshot(pathHL));
  } else {
    recorder.add('message', [], -1, 'No path found to goal.', makeSnapshot([]));
  }

  return recorder.getSteps();
}
