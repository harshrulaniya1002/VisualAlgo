import StepRecorder from '../../engine/StepRecorder';

export const meta = {
  name: 'DP on Intervals',
  slug: 'dp-on-intervals',
  category: 'dynamic-programming',
  timeComplexity: { best: 'O(n^3)', average: 'O(n^3)', worst: 'O(n^3)' },
  spaceComplexity: 'O(n^2)',
  description:
    'Solves the burst balloons problem: maximize coins collected by bursting balloons, where bursting balloon i gives nums[left]*nums[i]*nums[right] coins. Classic interval DP.',
  rendererType: 'grid',
  pseudocode: [
    'dp[i][j] = max coins bursting balloons i..j',
    'for len = 1 to n',
    '  for i = 0 to n-len',
    '    j = i + len - 1',
    '    for k = i to j (last balloon to burst)',
    '      dp[i][j] = max(dp[i][j], dp[i][k-1] + dp[k+1][j] + nums[i-1]*nums[k]*nums[j+1])',
  ],
  inputSchema: {
    type: 'array',
    constraints: { minLength: 2, maxLength: 6, minValue: 1, maxValue: 20 },
  },
};

export const defaultInput = [3, 1, 5, 8];

export function generateSteps(input) {
  const recorder = new StepRecorder();
  const nums = [...input];
  const n = nums.length;

  // Add boundary 1s
  const a = [1, ...nums, 1];

  const grid = Array.from({ length: n }, () => new Array(n).fill(0));
  const rowHeaders = nums.map((v, i) => `B${i}=${v}`);
  const colHeaders = nums.map((v, i) => `B${i}=${v}`);

  function snap(highlights = []) {
    return { grid: grid.map(r => [...r]), highlights, rowHeaders: [...rowHeaders], colHeaders: [...colHeaders] };
  }

  recorder.add('message', [], 0, `Burst Balloons (Interval DP): [${nums}]`, snap(), {});

  for (let len = 1; len <= n; len++) {
    for (let i = 0; i <= n - len; i++) {
      const j = i + len - 1;

      recorder.add('compute', [], 1, `Computing dp[${i}][${j}]: balloons ${i} to ${j}`, snap([{ row: i, col: j, state: 'computing' }]), {});

      for (let k = i; k <= j; k++) {
        const left = k > i ? grid[i][k - 1] : 0;
        const right = k < j ? grid[k + 1][j] : 0;
        const coins = a[i] * a[k + 1] * a[j + 2];
        const total = left + right + coins;

        recorder.add('compare', [], 4, `Burst B${k} last: ${left} + ${right} + ${a[i]}*${a[k + 1]}*${a[j + 2]} = ${total}`, snap([{ row: i, col: j, state: 'computing' }]), {});

        if (total > grid[i][j]) {
          grid[i][j] = total;
        }
      }

      recorder.add('compute', [], 5, `dp[${i}][${j}] = ${grid[i][j]}`, snap([{ row: i, col: j, state: 'computed' }]), {});
    }
  }

  recorder.add('sorted', [], 5, `Maximum coins = dp[0][${n - 1}] = ${grid[0][n - 1]}`, snap([{ row: 0, col: n - 1, state: 'optimal' }]), {});

  return recorder.getSteps();
}
