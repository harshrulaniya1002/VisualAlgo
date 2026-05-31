import StepRecorder from '../../engine/StepRecorder';

export const meta = {
  name: 'Partition Equal Subset Sum',
  slug: 'partition-equal-subset-sum',
  category: 'dynamic-programming',
  timeComplexity: { best: 'O(n * sum)', average: 'O(n * sum)', worst: 'O(n * sum)' },
  spaceComplexity: 'O(sum)',
  description:
    'Determines whether an array can be partitioned into two subsets with equal sums using a 1D DP boolean array.',
  rendererType: 'bar',
  pseudocode: [
    'totalSum = sum(arr)',
    'if totalSum is odd: return false',
    'target = totalSum / 2; dp[0] = true',
    'for each num in arr',
    '  for s = target down to num',
    '    dp[s] = dp[s] || dp[s - num]',
  ],
  inputSchema: {
    type: 'array',
    constraints: { minLength: 2, maxLength: 12, minValue: 1, maxValue: 20 },
  },
};

export const defaultInput = [1, 5, 11, 5];

export function generateSteps(input) {
  const recorder = new StepRecorder();
  const arr = [...input];
  const totalSum = arr.reduce((a, b) => a + b, 0);

  recorder.add('message', [], 0, `Partition Equal Subset Sum: arr=[${arr}], total=${totalSum}`, [totalSum], {});

  if (totalSum % 2 !== 0) {
    recorder.add('message', [], 1, `Total sum ${totalSum} is odd - cannot partition equally`, [totalSum], {});
    return recorder.getSteps();
  }

  const target = totalSum / 2;
  // dp[s] = 1 if achievable, 0 otherwise
  const dp = new Array(target + 1).fill(0);
  dp[0] = 1;

  recorder.add('compute', [0], 2, `Target = ${target}. dp[0] = true (base case)`, [...dp], {});

  for (let idx = 0; idx < arr.length; idx++) {
    const num = arr[idx];
    recorder.add('message', [], 3, `Processing element ${num} (index ${idx})`, [...dp], {});

    for (let s = target; s >= num; s--) {
      recorder.add('compare', [s], 4, `Check dp[${s}]: dp[${s - num}] = ${dp[s - num] ? 'true' : 'false'}`, [...dp], {});

      if (dp[s - num] && !dp[s]) {
        dp[s] = 1;
        recorder.add('compute', [s], 5, `dp[${s}] = true (${s - num} + ${num} = ${s})`, [...dp], {});
      }
    }
  }

  const result = dp[target] ? 'YES' : 'NO';
  recorder.add('sorted', [target], 5, `Can partition into equal subsets: ${result}`, [...dp], {});

  return recorder.getSteps();
}
