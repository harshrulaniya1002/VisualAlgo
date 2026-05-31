import StepRecorder from '../../engine/StepRecorder';

export const meta = {
  name: 'Profile DP (Broken Profile)',
  slug: 'profile-dp',
  category: 'dynamic-programming',
  timeComplexity: { best: 'O(n * m * 2^m)', average: 'O(n * m * 2^m)', worst: 'O(n * m * 2^m)' },
  spaceComplexity: 'O(2^m)',
  description:
    'Counts the number of ways to tile an n x m grid with 1x2 dominoes. Processes column by column using a bitmask to represent the profile of the boundary. Input: [rows, cols].',
  rendererType: 'grid',
  pseudocode: [
    'dp[0][0] = 1  (empty grid, no profile)',
    'for col = 0 to m-1',
    '  for row = 0 to n-1',
    '    for each valid mask transition',
    '      dp[next_mask] += dp[cur_mask]',
    'return dp[m][0]',
  ],
  inputSchema: {
    type: 'array',
    constraints: { minLength: 2, maxLength: 2, minValue: 2, maxValue: 5 },
  },
};

export const defaultInput = [3, 4];

export function generateSteps(input) {
  const recorder = new StepRecorder();
  const rows = input[0];
  const cols = input[1];
  const masks = 1 << rows;

  // Visualization: grid shows dp states per column
  // We show a grid where rows are mask values, columns are grid columns
  const displayRows = Math.min(masks, 8);
  const grid = Array.from({ length: displayRows }, () => new Array(cols + 1).fill(0));
  const rowHeaders = Array.from({ length: displayRows }, (_, i) => `mask=${i.toString(2).padStart(rows, '0')}`);
  const colHeaders = Array.from({ length: cols + 1 }, (_, i) => `col${i}`);

  function snap(highlights = []) {
    return { grid: grid.map(r => [...r]), highlights, rowHeaders: [...rowHeaders], colHeaders: [...colHeaders] };
  }

  recorder.add('message', [], 0, `Profile DP: Tile a ${rows}x${cols} grid with 1x2 dominoes`, snap(), {});

  // dp[mask] = number of ways
  let dp = new Array(masks).fill(0);
  dp[0] = 1;
  grid[0][0] = 1;

  recorder.add('compute', [], 0, 'Initialize: dp[mask=0] = 1 (empty profile)', snap([{ row: 0, col: 0, state: 'computed' }]), {});

  for (let col = 0; col < cols; col++) {
    const newDp = new Array(masks).fill(0);

    // Generate valid transitions
    function generate(row, curMask, newMask) {
      if (row === rows) {
        newDp[newMask] += dp[curMask];
        return;
      }
      // If current row bit is set in curMask, it's already filled - skip
      if (curMask & (1 << row)) {
        generate(row + 1, curMask, newMask);
        return;
      }
      // Place vertical domino (fills this row in current and next column)
      generate(row + 1, curMask, newMask | (1 << row));

      // Place horizontal domino (fills this and next row in current column)
      if (row + 1 < rows && !(curMask & (1 << (row + 1)))) {
        generate(row + 2, curMask, newMask);
      }
    }

    for (let mask = 0; mask < masks; mask++) {
      if (dp[mask] > 0) {
        generate(0, mask, 0);
      }
    }

    dp = newDp;

    // Update visualization grid
    for (let m = 0; m < displayRows; m++) {
      grid[m][col + 1] = dp[m];
    }

    const hl = [];
    for (let m = 0; m < displayRows; m++) {
      if (dp[m] > 0) hl.push({ row: m, col: col + 1, state: 'computed' });
    }
    recorder.add('compute', [], 1, `After column ${col}: transitions computed`, snap(hl), {});
  }

  const answer = dp[0];
  recorder.add('sorted', [], 5, `Total tilings of ${rows}x${cols} grid = ${answer}`, snap([{ row: 0, col: cols, state: 'optimal' }]), {});

  return recorder.getSteps();
}
