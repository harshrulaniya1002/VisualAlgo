import StepRecorder from '../../engine/StepRecorder';

export const meta = {
  name: 'Unbounded Knapsack',
  slug: 'unbounded-knapsack',
  category: 'dynamic-programming',
  timeComplexity: { best: 'O(n * W)', average: 'O(n * W)', worst: 'O(n * W)' },
  spaceComplexity: 'O(W)',
  description:
    'Maximizes value when items can be chosen multiple times. Uses a 1D DP array where dp[w] stores the maximum value achievable with capacity w.',
  rendererType: 'bar',
  pseudocode: [
    'dp[0] = 0',
    'for w = 1 to W',
    '  for each item (wt, val)',
    '    if wt <= w: dp[w] = max(dp[w], dp[w-wt] + val)',
    'return dp[W]',
  ],
  inputSchema: {
    type: 'array',
    constraints: { minLength: 3, maxLength: 15, minValue: 0, maxValue: 20 },
  },
};

// Input format: [W, w1, v1, w2, v2, ...]
export const defaultInput = [8, 1, 1, 3, 4, 4, 5, 5, 7];

export function generateSteps(input) {
  const recorder = new StepRecorder();
  const W = input[0];
  const items = [];
  for (let i = 1; i < input.length; i += 2) {
    items.push({ weight: input[i], value: input[i + 1] });
  }

  const dp = new Array(W + 1).fill(0);

  recorder.add('message', [], 0, `Unbounded Knapsack: ${items.length} items, capacity W=${W}`, [...dp], {});
  recorder.add('compute', [0], 0, 'Base case: dp[0] = 0 (no capacity, no value)', [...dp], {});

  for (let w = 1; w <= W; w++) {
    recorder.add('compute', [w], 1, `Computing dp[${w}] - trying all items`, [...dp], {});

    for (let j = 0; j < items.length; j++) {
      const { weight: wt, value: val } = items[j];
      if (wt <= w) {
        const candidate = dp[w - wt] + val;
        if (candidate > dp[w]) {
          dp[w] = candidate;
          recorder.add('compute', [w], 3, `Item ${j + 1} (wt=${wt}, val=${val}): dp[${w}] = dp[${w - wt}] + ${val} = ${dp[w]}`, [...dp], {});
        }
      }
    }

    recorder.add('sorted', [w], 3, `dp[${w}] = ${dp[w]} finalized`, [...dp], {});
  }

  recorder.add('message', [], 4, `Maximum value = dp[${W}] = ${dp[W]}`, [...dp], {});

  return recorder.getSteps();
}
