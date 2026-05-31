import StepRecorder from '../../engine/StepRecorder';

export const meta = {
  name: 'Subset Sum',
  slug: 'subset-sum',
  category: 'dynamic-programming',
  timeComplexity: { best: 'O(n * sum)', average: 'O(n * sum)', worst: 'O(n * sum)' },
  spaceComplexity: 'O(n * sum)',
  hasTarget: true,
  description:
    'Determines whether a subset of elements exists that sums to a given target value. Input: [target, val1, val2, ...]. Uses a 2D boolean DP table.',
  rendererType: 'grid',
  pseudocode: [
    'dp[0][0] = true, dp[i][0] = true',
    'for i = 1 to n',
    '  for s = 1 to target',
    '    dp[i][s] = dp[i-1][s]',
    '    if arr[i] <= s: dp[i][s] |= dp[i-1][s-arr[i]]',
    'return dp[n][target]',
  ],
  inputSchema: {
    type: 'array',
    constraints: { minLength: 2, maxLength: 12, minValue: 0, maxValue: 20 },
  },
};

// Input: [target, val1, val2, ...]
export const defaultInput = [9, 3, 34, 4, 12, 5, 2];

export function generateSteps(input) {
  const recorder = new StepRecorder();
  const target = input[0];
  const arr = input.slice(1);
  const n = arr.length;

  const grid = Array.from({ length: n + 1 }, () => new Array(target + 1).fill(0));
  const rowHeaders = ['0', ...arr.map((v, i) => `${v}`)];
  const colHeaders = Array.from({ length: target + 1 }, (_, i) => `${i}`);

  // Base case: sum=0 is achievable with empty subset
  for (let i = 0; i <= n; i++) grid[i][0] = 1;

  function snap(highlights = []) {
    return { grid: grid.map(r => [...r]), highlights, rowHeaders: [...rowHeaders], colHeaders: [...colHeaders] };
  }

  recorder.add('message', [], 0, `Subset Sum: arr=[${arr}], target=${target}`, snap(), {});
  recorder.add('compute', [], 0, 'Base case: dp[i][0] = true (empty subset sums to 0)', snap(
    Array.from({ length: n + 1 }, (_, i) => ({ row: i, col: 0, state: 'computed' }))
  ), {});

  for (let i = 1; i <= n; i++) {
    for (let s = 1; s <= target; s++) {
      recorder.add('compute', [], 1, `Checking: can we make sum ${s} using first ${i} elements?`, snap([{ row: i, col: s, state: 'computing' }]), {});

      // Exclude current element
      grid[i][s] = grid[i - 1][s];

      // Include current element if possible
      if (arr[i - 1] <= s && grid[i - 1][s - arr[i - 1]]) {
        grid[i][s] = 1;
        recorder.add('compute', [], 4, `Include ${arr[i - 1]}: dp[${i}][${s}] = true (dp[${i - 1}][${s - arr[i - 1]}] was true)`, snap([{ row: i, col: s, state: 'computed' }]), {});
      } else {
        recorder.add('compute', [], 3, `dp[${i}][${s}] = ${grid[i][s] ? 'true' : 'false'} (${grid[i - 1][s] ? 'inherited' : 'cannot achieve'})`, snap([{ row: i, col: s, state: 'computed' }]), {});
      }
    }
  }

  const result = grid[n][target] ? 'YES' : 'NO';
  recorder.add('sorted', [], 5, `Subset sum = ${target} is ${result}`, snap([{ row: n, col: target, state: grid[n][target] ? 'optimal' : 'computed' }]), {});

  return recorder.getSteps();
}
