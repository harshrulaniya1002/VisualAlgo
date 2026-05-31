import StepRecorder from '../../engine/StepRecorder';

export const meta = {
  name: 'Fibonacci (DP)',
  slug: 'fibonacci-dp',
  category: 'dynamic-programming',
  timeComplexity: { best: 'O(n)', average: 'O(n)', worst: 'O(n)' },
  spaceComplexity: 'O(n)',
  description:
    'Computes Fibonacci numbers iteratively using dynamic programming to avoid redundant recursive calls. Builds a DP array bottom-up where each entry is the sum of the two preceding entries.',
  rendererType: 'bar',
  pseudocode: [
    'dp[0] = 0, dp[1] = 1',
    'for i = 2 to n',
    '  dp[i] = dp[i-1] + dp[i-2]',
    'return dp[n]',
  ],
  inputSchema: {
    type: 'array',
    constraints: { minLength: 1, maxLength: 1, minValue: 2, maxValue: 15 },
  },
};

export const defaultInput = [10];

export function generateSteps(input) {
  const recorder = new StepRecorder();
  const n = input[0];
  const dp = new Array(n + 1).fill(0);

  recorder.add('message', [], 0, `Computing Fibonacci(${n}) using bottom-up DP`, [...dp], {});

  dp[0] = 0;
  dp[1] = 1;
  recorder.add('compute', [0, 1], 0, `Base cases: dp[0] = 0, dp[1] = 1`, [...dp], {});

  for (let i = 2; i <= n; i++) {
    recorder.add('compare', [i - 1, i - 2], 1, `Computing dp[${i}] = dp[${i - 1}] + dp[${i - 2}] = ${dp[i - 1]} + ${dp[i - 2]}`, [...dp], {});

    dp[i] = dp[i - 1] + dp[i - 2];
    recorder.add('compute', [i], 2, `dp[${i}] = ${dp[i]}`, [...dp], {});
  }

  recorder.add('sorted', [n], 3, `Fibonacci(${n}) = ${dp[n]}`, [...dp], {});
  recorder.add('message', [], 3, `Result: Fibonacci(${n}) = ${dp[n]}`, [...dp], {});

  return recorder.getSteps();
}
