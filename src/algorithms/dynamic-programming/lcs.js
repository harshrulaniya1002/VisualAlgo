import StepRecorder from '../../engine/StepRecorder';

export const meta = {
  name: 'Longest Common Subsequence (LCS)',
  slug: 'lcs',
  category: 'dynamic-programming',
  timeComplexity: { best: 'O(m * n)', average: 'O(m * n)', worst: 'O(m * n)' },
  spaceComplexity: 'O(m * n)',
  description:
    'Finds the longest subsequence common to two sequences using a 2D DP table. Input encodes two sequences in one array: [len1, ...seq1, ...seq2].',
  rendererType: 'grid',
  pseudocode: [
    'dp[0][j] = 0, dp[i][0] = 0',
    'for i = 1 to m',
    '  for j = 1 to n',
    '    if A[i] == B[j]: dp[i][j] = dp[i-1][j-1] + 1',
    '    else: dp[i][j] = max(dp[i-1][j], dp[i][j-1])',
    'return dp[m][n]',
  ],
  inputSchema: {
    type: 'array',
    constraints: { minLength: 3, maxLength: 15, minValue: 0, maxValue: 9 },
  },
};

// Input: [len1, ...seq1, ...seq2] e.g. [4, 1,3,4,1, 1,4,3] => A=[1,3,4,1], B=[1,4,3]
export const defaultInput = [4, 1, 3, 4, 1, 1, 4, 3];

export function generateSteps(input) {
  const recorder = new StepRecorder();
  const len1 = input[0];
  const A = input.slice(1, 1 + len1);
  const B = input.slice(1 + len1);
  const m = A.length;
  const n = B.length;

  const grid = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  const rowHeaders = ['', ...A.map((v, i) => `A[${i}]=${v}`)];
  const colHeaders = ['', ...B.map((v, i) => `B[${i}]=${v}`)];

  function snap(highlights = []) {
    return { grid: grid.map(r => [...r]), highlights, rowHeaders: [...rowHeaders], colHeaders: [...colHeaders] };
  }

  recorder.add('message', [], 0, `LCS of A=[${A}] and B=[${B}]`, snap(), {});

  // Base cases
  recorder.add('compute', [], 0, 'Base cases: dp[0][j] = 0 and dp[i][0] = 0', snap(
    [...Array(n + 1).keys()].map(c => ({ row: 0, col: c, state: 'computed' })).concat(
      [...Array(m + 1).keys()].map(r => ({ row: r, col: 0, state: 'computed' }))
    )
  ), {});

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      recorder.add('compute', [], 1, `Comparing A[${i - 1}]=${A[i - 1]} with B[${j - 1}]=${B[j - 1]}`, snap([{ row: i, col: j, state: 'computing' }]), {});

      if (A[i - 1] === B[j - 1]) {
        grid[i][j] = grid[i - 1][j - 1] + 1;
        recorder.add('compute', [], 3, `Match! dp[${i}][${j}] = dp[${i - 1}][${j - 1}] + 1 = ${grid[i][j]}`, snap([{ row: i, col: j, state: 'computed' }, { row: i - 1, col: j - 1, state: 'optimal' }]), {});
      } else {
        grid[i][j] = Math.max(grid[i - 1][j], grid[i][j - 1]);
        recorder.add('compute', [], 4, `No match. dp[${i}][${j}] = max(dp[${i - 1}][${j}], dp[${i}][${j - 1}]) = ${grid[i][j]}`, snap([{ row: i, col: j, state: 'computed' }]), {});
      }
    }
  }

  recorder.add('sorted', [], 5, `LCS length = dp[${m}][${n}] = ${grid[m][n]}`, snap([{ row: m, col: n, state: 'optimal' }]), {});

  return recorder.getSteps();
}
