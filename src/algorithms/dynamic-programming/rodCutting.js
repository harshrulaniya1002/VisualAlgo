import StepRecorder from '../../engine/StepRecorder';

export const meta = {
  name: 'Rod Cutting',
  slug: 'rod-cutting',
  category: 'dynamic-programming',
  timeComplexity: { best: 'O(n^2)', average: 'O(n^2)', worst: 'O(n^2)' },
  spaceComplexity: 'O(n)',
  description:
    'Determines the maximum revenue from cutting a rod of length n into pieces. The input array gives the price for each length from 1 to n.',
  rendererType: 'bar',
  pseudocode: [
    'dp[0] = 0',
    'for i = 1 to n',
    '  for j = 1 to i',
    '    dp[i] = max(dp[i], price[j] + dp[i-j])',
    'return dp[n]',
  ],
  inputSchema: {
    type: 'array',
    constraints: { minLength: 1, maxLength: 12, minValue: 0, maxValue: 50 },
  },
};

// prices[i] = price for rod of length i+1
export const defaultInput = [1, 5, 8, 9, 10, 17, 17, 20];

export function generateSteps(input) {
  const recorder = new StepRecorder();
  const prices = [...input];
  const n = prices.length;
  const dp = new Array(n + 1).fill(0);

  recorder.add('message', [], 0, `Rod Cutting: length=${n}, prices=[${prices}]`, [...dp], {});
  recorder.add('compute', [0], 0, 'Base case: dp[0] = 0 (no rod, no revenue)', [...dp], {});

  for (let i = 1; i <= n; i++) {
    recorder.add('compute', [i], 1, `Computing dp[${i}] - max revenue for rod of length ${i}`, [...dp], {});

    for (let j = 1; j <= i; j++) {
      const candidate = prices[j - 1] + dp[i - j];
      recorder.add('compare', [i], 2, `Cut length ${j}: price[${j}]=${prices[j - 1]} + dp[${i - j}]=${dp[i - j]} = ${candidate}`, [...dp], {});

      if (candidate > dp[i]) {
        dp[i] = candidate;
        recorder.add('compute', [i], 3, `dp[${i}] updated to ${dp[i]}`, [...dp], {});
      }
    }

    recorder.add('sorted', [i], 3, `dp[${i}] = ${dp[i]} finalized`, [...dp], {});
  }

  recorder.add('message', [], 4, `Maximum revenue for rod of length ${n} = ${dp[n]}`, [...dp], {});

  return recorder.getSteps();
}
