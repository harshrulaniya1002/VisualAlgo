import StepRecorder from '../../engine/StepRecorder';

export const meta = {
  name: 'Matrix Chain Multiplication',
  slug: 'matrix-chain-multiplication',
  category: 'dynamic-programming',
  timeComplexity: { best: 'O(n^3)', average: 'O(n^3)', worst: 'O(n^3)' },
  spaceComplexity: 'O(n^2)',
  description:
    'Finds the optimal order of matrix multiplications to minimize the total number of scalar multiplications. Input is array of matrix dimensions.',
  rendererType: 'grid',
  pseudocode: [
    'dp[i][i] = 0 for all i',
    'for len = 2 to n',
    '  for i = 1 to n-len+1',
    '    j = i + len - 1',
    '    dp[i][j] = min over k of (dp[i][k] + dp[k+1][j] + p[i-1]*p[k]*p[j])',
    'return dp[1][n]',
  ],
  inputSchema: {
    type: 'array',
    constraints: { minLength: 3, maxLength: 8, minValue: 1, maxValue: 50 },
  },
};

// dimensions: A1 is p[0]xp[1], A2 is p[1]xp[2], etc.
export const defaultInput = [10, 20, 30, 40, 30];

export function generateSteps(input) {
  const recorder = new StepRecorder();
  const p = [...input];
  const n = p.length - 1; // number of matrices

  const grid = Array.from({ length: n }, () => new Array(n).fill(0));
  const rowHeaders = Array.from({ length: n }, (_, i) => `M${i + 1}`);
  const colHeaders = Array.from({ length: n }, (_, i) => `M${i + 1}`);

  function snap(highlights = []) {
    return { grid: grid.map(r => [...r]), highlights, rowHeaders: [...rowHeaders], colHeaders: [...colHeaders] };
  }

  recorder.add('message', [], 0, `Matrix Chain Multiplication: ${n} matrices with dims [${p}]`, snap(), {});

  // Base case: single matrices cost 0
  const diagHL = Array.from({ length: n }, (_, i) => ({ row: i, col: i, state: 'computed' }));
  recorder.add('compute', [], 0, 'Base case: dp[i][i] = 0 (single matrix, no multiplication)', snap(diagHL), {});

  // Fill by chain length
  for (let len = 2; len <= n; len++) {
    for (let i = 0; i < n - len + 1; i++) {
      const j = i + len - 1;
      grid[i][j] = Infinity;

      recorder.add('compute', [], 1, `Computing cost of multiplying M${i + 1}..M${j + 1} (chain length ${len})`, snap([{ row: i, col: j, state: 'computing' }]), {});

      for (let k = i; k < j; k++) {
        const cost = grid[i][k] + grid[k + 1][j] + p[i] * p[k + 1] * p[j + 1];
        recorder.add('compare', [], 4, `Split at k=${k + 1}: ${grid[i][k]} + ${grid[k + 1][j]} + ${p[i]}*${p[k + 1]}*${p[j + 1]} = ${cost}`, snap([{ row: i, col: j, state: 'computing' }, { row: i, col: k, state: 'computed' }, { row: k + 1, col: j, state: 'computed' }]), {});

        if (cost < grid[i][j]) {
          grid[i][j] = cost;
        }
      }

      recorder.add('compute', [], 4, `dp[${i}][${j}] = ${grid[i][j]}`, snap([{ row: i, col: j, state: 'computed' }]), {});
    }
  }

  recorder.add('sorted', [], 5, `Minimum multiplications = dp[0][${n - 1}] = ${grid[0][n - 1]}`, snap([{ row: 0, col: n - 1, state: 'optimal' }]), {});

  return recorder.getSteps();
}
