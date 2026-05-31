import StepRecorder from '../../engine/StepRecorder';

export const meta = {
  name: 'Wildcard Matching',
  slug: 'wildcard-matching',
  category: 'dynamic-programming',
  timeComplexity: { best: 'O(m * n)', average: 'O(m * n)', worst: 'O(m * n)' },
  spaceComplexity: 'O(m * n)',
  description:
    'Matches a string against a pattern containing ? (any single char) and * (any sequence) using 2D DP. Input: [len_s, ...s_chars, ...p_chars] where 26=? and 27=*.',
  rendererType: 'grid',
  pseudocode: [
    'dp[0][0] = true',
    'dp[0][j] = true if p[1..j] are all *',
    'for i = 1 to m',
    '  for j = 1 to n',
    '    if p[j]==* : dp[i][j] = dp[i-1][j] || dp[i][j-1]',
    '    if p[j]==? or s[i]==p[j]: dp[i][j] = dp[i-1][j-1]',
  ],
  inputSchema: {
    type: 'array',
    constraints: { minLength: 3, maxLength: 15, minValue: 0, maxValue: 27 },
  },
};

// "adceb" matched against "*a*b": s=[0,3,2,4,1], p=[27,0,27,1]
// len_s=5 then s chars then p chars: [5, 0,3,2,4,1, 27,0,27,1]
export const defaultInput = [5, 0, 3, 2, 4, 1, 27, 0, 27, 1];

export function generateSteps(input) {
  const recorder = new StepRecorder();
  const lenS = input[0];
  const sArr = input.slice(1, 1 + lenS);
  const pArr = input.slice(1 + lenS);
  const m = sArr.length;
  const n = pArr.length;

  const toChar = (v) => {
    if (v === 26) return '?';
    if (v === 27) return '*';
    return String.fromCharCode(97 + (v % 26));
  };

  const strS = sArr.map(toChar).join('');
  const strP = pArr.map(toChar).join('');

  const grid = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  const rowHeaders = ['', ...sArr.map(toChar)];
  const colHeaders = ['', ...pArr.map(toChar)];

  function snap(highlights = []) {
    return { grid: grid.map(r => [...r]), highlights, rowHeaders: [...rowHeaders], colHeaders: [...colHeaders] };
  }

  recorder.add('message', [], 0, `Wildcard Matching: s="${strS}", p="${strP}"`, snap(), {});

  // Base cases
  grid[0][0] = 1;
  for (let j = 1; j <= n; j++) {
    if (pArr[j - 1] === 27) grid[0][j] = grid[0][j - 1];
  }

  const baseHL = [{ row: 0, col: 0, state: 'computed' }];
  for (let j = 1; j <= n; j++) baseHL.push({ row: 0, col: j, state: 'computed' });
  recorder.add('compute', [], 0, 'Base cases: dp[0][0]=true, dp[0][j]=true if pattern[1..j] are all *', snap(baseHL), {});

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      recorder.add('compute', [], 2, `Matching s[${i}]='${toChar(sArr[i - 1])}' with p[${j}]='${toChar(pArr[j - 1])}'`, snap([{ row: i, col: j, state: 'computing' }]), {});

      if (pArr[j - 1] === 27) {
        // * matches empty (dp[i][j-1]) or any char (dp[i-1][j])
        grid[i][j] = (grid[i - 1][j] || grid[i][j - 1]) ? 1 : 0;
        recorder.add('compute', [], 4, `p='*': dp[${i}][${j}] = dp[${i - 1}][${j}] || dp[${i}][${j - 1}] = ${grid[i][j] ? 'true' : 'false'}`, snap([{ row: i, col: j, state: 'computed' }]), {});
      } else if (pArr[j - 1] === 26 || sArr[i - 1] === pArr[j - 1]) {
        // ? or exact match
        grid[i][j] = grid[i - 1][j - 1];
        recorder.add('compute', [], 5, `Match: dp[${i}][${j}] = dp[${i - 1}][${j - 1}] = ${grid[i][j] ? 'true' : 'false'}`, snap([{ row: i, col: j, state: 'computed' }]), {});
      } else {
        grid[i][j] = 0;
        recorder.add('compute', [], 5, `No match: dp[${i}][${j}] = false`, snap([{ row: i, col: j, state: 'computed' }]), {});
      }
    }
  }

  const result = grid[m][n] ? 'MATCH' : 'NO MATCH';
  recorder.add('sorted', [], 5, `Result: ${result}`, snap([{ row: m, col: n, state: grid[m][n] ? 'optimal' : 'computed' }]), {});

  return recorder.getSteps();
}
