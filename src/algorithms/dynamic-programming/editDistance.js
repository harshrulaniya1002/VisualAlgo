import StepRecorder from '../../engine/StepRecorder';

export const meta = {
  name: 'Edit Distance (Levenshtein)',
  slug: 'edit-distance',
  category: 'dynamic-programming',
  timeComplexity: { best: 'O(m * n)', average: 'O(m * n)', worst: 'O(m * n)' },
  spaceComplexity: 'O(m * n)',
  description:
    'Computes the minimum number of insertions, deletions, and substitutions to transform one string into another. Input: [len1, ...chars1, ...chars2] where chars are character codes.',
  rendererType: 'grid',
  pseudocode: [
    'dp[i][0] = i, dp[0][j] = j',
    'for i = 1 to m',
    '  for j = 1 to n',
    '    if A[i] == B[j]: dp[i][j] = dp[i-1][j-1]',
    '    else: dp[i][j] = 1 + min(dp[i-1][j], dp[i][j-1], dp[i-1][j-1])',
    'return dp[m][n]',
  ],
  inputSchema: {
    type: 'array',
    constraints: { minLength: 3, maxLength: 15, minValue: 0, maxValue: 25 },
  },
};

// Input: [len1, c1, c2, ..., c1', c2', ...]  using small ints to represent chars
// e.g. "horse" -> "ros": [5, 8,15,18,19,5, 18,15,19] (h=8,o=15,r=18,s=19,e=5)
export const defaultInput = [5, 8, 15, 18, 19, 5, 18, 15, 19];

export function generateSteps(input) {
  const recorder = new StepRecorder();
  const len1 = input[0];
  const A = input.slice(1, 1 + len1);
  const B = input.slice(1 + len1);
  const m = A.length;
  const n = B.length;

  const toChar = (v) => String.fromCharCode(97 + (v % 26));
  const strA = A.map(toChar).join('');
  const strB = B.map(toChar).join('');

  const grid = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  const rowHeaders = ['', ...A.map((v, i) => toChar(v))];
  const colHeaders = ['', ...B.map((v, i) => toChar(v))];

  function snap(highlights = []) {
    return { grid: grid.map(r => [...r]), highlights, rowHeaders: [...rowHeaders], colHeaders: [...colHeaders] };
  }

  recorder.add('message', [], 0, `Edit Distance: "${strA}" -> "${strB}"`, snap(), {});

  // Base cases
  for (let i = 0; i <= m; i++) grid[i][0] = i;
  for (let j = 0; j <= n; j++) grid[0][j] = j;

  const baseHL = [];
  for (let i = 0; i <= m; i++) baseHL.push({ row: i, col: 0, state: 'computed' });
  for (let j = 1; j <= n; j++) baseHL.push({ row: 0, col: j, state: 'computed' });
  recorder.add('compute', [], 0, 'Base cases: dp[i][0] = i (delete all), dp[0][j] = j (insert all)', snap(baseHL), {});

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      recorder.add('compute', [], 1, `Comparing "${toChar(A[i - 1])}" with "${toChar(B[j - 1])}"`, snap([{ row: i, col: j, state: 'computing' }]), {});

      if (A[i - 1] === B[j - 1]) {
        grid[i][j] = grid[i - 1][j - 1];
        recorder.add('compute', [], 3, `Match! dp[${i}][${j}] = dp[${i - 1}][${j - 1}] = ${grid[i][j]} (no edit)`, snap([{ row: i, col: j, state: 'computed' }]), {});
      } else {
        const del = grid[i - 1][j];
        const ins = grid[i][j - 1];
        const sub = grid[i - 1][j - 1];
        grid[i][j] = 1 + Math.min(del, ins, sub);
        const op = grid[i][j] === del + 1 ? 'delete' : grid[i][j] === ins + 1 ? 'insert' : 'substitute';
        recorder.add('compute', [], 4, `dp[${i}][${j}] = 1 + min(${del},${ins},${sub}) = ${grid[i][j]} (${op})`, snap([{ row: i, col: j, state: 'computed' }]), {});
      }
    }
  }

  recorder.add('sorted', [], 5, `Edit Distance = dp[${m}][${n}] = ${grid[m][n]}`, snap([{ row: m, col: n, state: 'optimal' }]), {});

  return recorder.getSteps();
}
