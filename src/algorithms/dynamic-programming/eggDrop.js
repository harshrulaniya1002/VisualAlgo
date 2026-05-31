import StepRecorder from '../../engine/StepRecorder';

export const meta = {
  name: 'Egg Drop Problem',
  slug: 'egg-drop',
  category: 'dynamic-programming',
  timeComplexity: { best: 'O(n * k^2)', average: 'O(n * k^2)', worst: 'O(n * k^2)' },
  spaceComplexity: 'O(n * k)',
  description:
    'Finds the minimum number of trials needed to determine the critical floor with k eggs and n floors. Input: [eggs, floors].',
  rendererType: 'grid',
  pseudocode: [
    'dp[1][j] = j, dp[i][1] = 1, dp[i][0] = 0',
    'for i = 2 to eggs',
    '  for j = 2 to floors',
    '    dp[i][j] = min over x of (1 + max(dp[i-1][x-1], dp[i][j-x]))',
    'return dp[eggs][floors]',
  ],
  inputSchema: {
    type: 'array',
    constraints: { minLength: 2, maxLength: 2, minValue: 1, maxValue: 8 },
  },
};

// Input: [eggs, floors]
export const defaultInput = [3, 6];

export function generateSteps(input) {
  const recorder = new StepRecorder();
  const eggs = input[0];
  const floors = input[1];

  const grid = Array.from({ length: eggs + 1 }, () => new Array(floors + 1).fill(0));
  const rowHeaders = Array.from({ length: eggs + 1 }, (_, i) => `${i} egg${i !== 1 ? 's' : ''}`);
  const colHeaders = Array.from({ length: floors + 1 }, (_, j) => `${j}F`);

  function snap(highlights = []) {
    return { grid: grid.map(r => [...r]), highlights, rowHeaders: [...rowHeaders], colHeaders: [...colHeaders] };
  }

  recorder.add('message', [], 0, `Egg Drop: ${eggs} eggs, ${floors} floors`, snap(), {});

  // Base cases
  for (let j = 0; j <= floors; j++) grid[1][j] = j; // 1 egg: try each floor linearly
  for (let i = 1; i <= eggs; i++) {
    grid[i][0] = 0;
    grid[i][1] = 1;
  }

  const baseHL = [];
  for (let j = 0; j <= floors; j++) baseHL.push({ row: 1, col: j, state: 'computed' });
  for (let i = 2; i <= eggs; i++) {
    baseHL.push({ row: i, col: 0, state: 'computed' });
    baseHL.push({ row: i, col: 1, state: 'computed' });
  }
  recorder.add('compute', [], 0, 'Base: 1 egg needs j trials for j floors; 0 floors needs 0; 1 floor needs 1', snap(baseHL), {});

  for (let i = 2; i <= eggs; i++) {
    for (let j = 2; j <= floors; j++) {
      grid[i][j] = Infinity;
      recorder.add('compute', [], 1, `Computing dp[${i}][${j}]: ${i} eggs, ${j} floors`, snap([{ row: i, col: j, state: 'computing' }]), {});

      for (let x = 1; x <= j; x++) {
        const breaks = grid[i - 1][x - 1]; // egg breaks: go down
        const survives = grid[i][j - x];    // egg survives: go up
        const worst = 1 + Math.max(breaks, survives);

        if (worst < grid[i][j]) {
          grid[i][j] = worst;
        }
      }

      recorder.add('compute', [], 3, `dp[${i}][${j}] = ${grid[i][j]}`, snap([{ row: i, col: j, state: 'computed' }]), {});
    }
  }

  recorder.add('sorted', [], 4, `Minimum trials = dp[${eggs}][${floors}] = ${grid[eggs][floors]}`, snap([{ row: eggs, col: floors, state: 'optimal' }]), {});

  return recorder.getSteps();
}
