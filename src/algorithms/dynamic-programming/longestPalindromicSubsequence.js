import StepRecorder from '../../engine/StepRecorder';

export const meta = {
  name: 'Longest Palindromic Subsequence',
  slug: 'longest-palindromic-subsequence',
  category: 'dynamic-programming',
  timeComplexity: { best: 'O(n^2)', average: 'O(n^2)', worst: 'O(n^2)' },
  spaceComplexity: 'O(n^2)',
  description:
    'Finds the longest subsequence of a string that is also a palindrome using interval DP. Input: array of character codes (0-25 for a-z).',
  rendererType: 'grid',
  pseudocode: [
    'dp[i][i] = 1 for all i',
    'for len = 2 to n',
    '  for i = 0 to n-len',
    '    j = i + len - 1',
    '    if s[i]==s[j]: dp[i][j] = dp[i+1][j-1] + 2',
    '    else: dp[i][j] = max(dp[i+1][j], dp[i][j-1])',
  ],
  inputSchema: {
    type: 'array',
    constraints: { minLength: 2, maxLength: 8, minValue: 0, maxValue: 25 },
  },
};

// chars: b=1, b=1, a=0, b=1, c=2, b=1  => "bbabcb"
export const defaultInput = [1, 1, 0, 1, 2, 1];

export function generateSteps(input) {
  const recorder = new StepRecorder();
  const chars = [...input];
  const n = chars.length;
  const toChar = (v) => String.fromCharCode(97 + (v % 26));
  const str = chars.map(toChar).join('');

  const grid = Array.from({ length: n }, () => new Array(n).fill(0));
  const rowHeaders = chars.map((v, i) => `${toChar(v)}(${i})`);
  const colHeaders = chars.map((v, i) => `${toChar(v)}(${i})`);

  function snap(highlights = []) {
    return { grid: grid.map(r => [...r]), highlights, rowHeaders: [...rowHeaders], colHeaders: [...colHeaders] };
  }

  recorder.add('message', [], 0, `Longest Palindromic Subsequence of "${str}"`, snap(), {});

  // Base case: single characters
  for (let i = 0; i < n; i++) grid[i][i] = 1;
  const diagHL = Array.from({ length: n }, (_, i) => ({ row: i, col: i, state: 'computed' }));
  recorder.add('compute', [], 0, 'Base case: dp[i][i] = 1 (single char is palindrome)', snap(diagHL), {});

  for (let len = 2; len <= n; len++) {
    for (let i = 0; i <= n - len; i++) {
      const j = i + len - 1;
      recorder.add('compute', [], 1, `Substring "${str.slice(i, j + 1)}" (indices ${i}..${j})`, snap([{ row: i, col: j, state: 'computing' }]), {});

      if (chars[i] === chars[j]) {
        grid[i][j] = (len === 2 ? 0 : grid[i + 1][j - 1]) + 2;
        recorder.add('compute', [], 4, `'${toChar(chars[i])}' == '${toChar(chars[j])}': dp[${i}][${j}] = ${grid[i][j]}`, snap([{ row: i, col: j, state: 'computed' }]), {});
      } else {
        grid[i][j] = Math.max(grid[i + 1][j], grid[i][j - 1]);
        recorder.add('compute', [], 5, `'${toChar(chars[i])}' != '${toChar(chars[j])}': dp[${i}][${j}] = max(${grid[i + 1][j]}, ${grid[i][j - 1]}) = ${grid[i][j]}`, snap([{ row: i, col: j, state: 'computed' }]), {});
      }
    }
  }

  recorder.add('sorted', [], 5, `LPS length = dp[0][${n - 1}] = ${grid[0][n - 1]}`, snap([{ row: 0, col: n - 1, state: 'optimal' }]), {});

  return recorder.getSteps();
}
