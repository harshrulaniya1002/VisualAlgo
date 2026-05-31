import StepRecorder from '../../engine/StepRecorder';

export const meta = {
  name: '0/1 Knapsack',
  slug: '01-knapsack',
  category: 'dynamic-programming',
  timeComplexity: { best: 'O(n * W)', average: 'O(n * W)', worst: 'O(n * W)' },
  spaceComplexity: 'O(n * W)',
  description:
    'Maximizes value in a knapsack of capacity W by deciding whether to include or exclude each item. Uses a 2D DP table where dp[i][w] is the max value using the first i items with capacity w.',
  rendererType: 'grid',
  pseudocode: [
    'dp[0][w] = 0 for all w',
    'for i = 1 to n',
    '  for w = 0 to W',
    '    if wt[i] <= w: dp[i][w] = max(dp[i-1][w], val[i] + dp[i-1][w-wt[i]])',
    '    else: dp[i][w] = dp[i-1][w]',
    'return dp[n][W]',
  ],
  inputSchema: {
    type: 'array',
    constraints: { minLength: 3, maxLength: 15, minValue: 0, maxValue: 20 },
  },
};

// Input format: [W, w1, v1, w2, v2, ...]
export const defaultInput = [7, 1, 1, 3, 4, 4, 5, 5, 7];

export function generateSteps(input) {
  const recorder = new StepRecorder();
  const W = input[0];
  const items = [];
  for (let i = 1; i < input.length; i += 2) {
    items.push({ weight: input[i], value: input[i + 1] });
  }
  const n = items.length;

  // Build grid: (n+1) rows x (W+1) cols
  const grid = Array.from({ length: n + 1 }, () => new Array(W + 1).fill(0));
  const rowHeaders = ['0', ...items.map((it, i) => `Item${i + 1}(w=${it.weight},v=${it.value})`)];
  const colHeaders = Array.from({ length: W + 1 }, (_, i) => `${i}`);

  function snap(highlights = []) {
    return { grid: grid.map(r => [...r]), highlights, rowHeaders: [...rowHeaders], colHeaders: [...colHeaders] };
  }

  recorder.add('message', [], 0, `0/1 Knapsack: ${n} items, capacity W=${W}`, snap(), {});

  // Base case row is already 0
  recorder.add('compute', [], 0, 'Base case: dp[0][w] = 0 for all w (no items)', snap(
    colHeaders.map((_, c) => ({ row: 0, col: c, state: 'computed' }))
  ), {});

  for (let i = 1; i <= n; i++) {
    const wt = items[i - 1].weight;
    const val = items[i - 1].value;
    for (let w = 0; w <= W; w++) {
      recorder.add('compute', [], 2, `Computing dp[${i}][${w}] for item ${i} (wt=${wt}, val=${val}), capacity=${w}`, snap([{ row: i, col: w, state: 'computing' }]), {});

      if (wt <= w) {
        const include = val + grid[i - 1][w - wt];
        const exclude = grid[i - 1][w];
        grid[i][w] = Math.max(include, exclude);
        const chose = grid[i][w] === include ? 'include' : 'exclude';
        recorder.add('compute', [], 3, `dp[${i}][${w}] = max(${exclude}, ${val}+${grid[i - 1][w - wt]}) = ${grid[i][w]} (${chose})`, snap([{ row: i, col: w, state: 'computed' }]), {});
      } else {
        grid[i][w] = grid[i - 1][w];
        recorder.add('compute', [], 4, `wt=${wt} > capacity=${w}, dp[${i}][${w}] = dp[${i - 1}][${w}] = ${grid[i][w]}`, snap([{ row: i, col: w, state: 'computed' }]), {});
      }
    }
  }

  recorder.add('sorted', [], 5, `Maximum value = dp[${n}][${W}] = ${grid[n][W]}`, snap([{ row: n, col: W, state: 'optimal' }]), {});

  return recorder.getSteps();
}
