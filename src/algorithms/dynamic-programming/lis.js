import StepRecorder from '../../engine/StepRecorder';

export const meta = {
  name: 'Longest Increasing Subsequence (LIS)',
  slug: 'lis',
  category: 'dynamic-programming',
  timeComplexity: { best: 'O(n^2)', average: 'O(n^2)', worst: 'O(n^2)' },
  spaceComplexity: 'O(n)',
  description:
    'Finds the longest strictly increasing subsequence using a DP array where dp[i] is the length of the LIS ending at index i.',
  rendererType: 'bar',
  pseudocode: [
    'dp[i] = 1 for all i',
    'for i = 1 to n-1',
    '  for j = 0 to i-1',
    '    if arr[j] < arr[i]: dp[i] = max(dp[i], dp[j]+1)',
    'return max(dp)',
  ],
  inputSchema: {
    type: 'array',
    constraints: { minLength: 2, maxLength: 15, minValue: 0, maxValue: 50 },
  },
};

export const defaultInput = [10, 9, 2, 5, 3, 7, 101, 18];

export function generateSteps(input) {
  const recorder = new StepRecorder();
  const arr = [...input];
  const n = arr.length;
  const dp = new Array(n).fill(1);

  recorder.add('message', [], 0, `Finding LIS of [${arr}]`, [...dp], {});
  recorder.add('compute', [], 0, 'Initialize dp[i] = 1 for all i (each element is a subsequence of length 1)', [...dp], {});

  for (let i = 1; i < n; i++) {
    recorder.add('compute', [i], 1, `Processing arr[${i}] = ${arr[i]}`, [...dp], {});

    for (let j = 0; j < i; j++) {
      recorder.add('compare', [j, i], 2, `Compare arr[${j}]=${arr[j]} < arr[${i}]=${arr[i]}?`, [...dp], {});

      if (arr[j] < arr[i]) {
        if (dp[j] + 1 > dp[i]) {
          dp[i] = dp[j] + 1;
          recorder.add('compute', [i], 3, `dp[${i}] = dp[${j}] + 1 = ${dp[i]}`, [...dp], {});
        }
      }
    }

    recorder.add('sorted', [i], 3, `dp[${i}] = ${dp[i]} finalized`, [...dp], {});
  }

  const lisLength = Math.max(...dp);
  recorder.add('message', [], 4, `LIS length = ${lisLength}`, [...dp], {});

  return recorder.getSteps();
}
