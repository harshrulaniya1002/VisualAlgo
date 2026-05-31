import StepRecorder from '../../engine/StepRecorder';

export const meta = {
  name: 'Hungarian Algorithm',
  slug: 'hungarian-algorithm',
  category: 'network-flow',
  timeComplexity: { best: 'O(n^3)', average: 'O(n^3)', worst: 'O(n^3)' },
  spaceComplexity: 'O(n^2)',
  description:
    'The Hungarian algorithm solves the assignment problem: given an n x n cost matrix, it finds a minimum cost one-to-one assignment of rows to columns. It works by reducing the matrix through row and column operations, covering zeros with minimum lines, and iterating until an optimal assignment is found.',
  rendererType: 'bar',
  pseudocode: [
    'subtract row minimums from each row',
    'subtract column minimums from each column',
    'cover all zeros with minimum lines',
    'while lines < n:',
    '  find min uncovered element',
    '  subtract from uncovered, add to double-covered',
    '  re-cover zeros with minimum lines',
    'find optimal assignment from zero positions',
  ],
  inputSchema: {
    type: 'array',
    constraints: { minLength: 2, maxLength: 20, minValue: 0, maxValue: 99 },
  },
};

// Format: [n, c00, c01, ..., c(n-1)(n-1)] row by row
export const defaultInput = [3, 9,2,7, 6,4,3, 5,8,1];

export function generateSteps(input) {
  const recorder = new StepRecorder();
  const n = input[0];
  const cost = [];
  for (let i = 0; i < n; i++) {
    cost.push([]);
    for (let j = 0; j < n; j++) {
      cost[i].push(input[1 + i * n + j]);
    }
  }

  // Flatten matrix to 1D array for bar renderer snapshot
  function flatten(matrix) {
    const arr = [];
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        arr.push(matrix[i][j]);
      }
    }
    return arr;
  }

  function matrixStr(matrix) {
    return matrix.map(row => `[${row.join(', ')}]`).join(' ');
  }

  // Initial state
  recorder.add('message', [], -1,
    `Starting Hungarian Algorithm on ${n}x${n} cost matrix`,
    flatten(cost));

  recorder.add('message', [], -1,
    `Initial cost matrix: ${matrixStr(cost)}`,
    flatten(cost));

  // Step 1: Row reduction - subtract row minimum from each row
  for (let i = 0; i < n; i++) {
    const rowMin = Math.min(...cost[i]);
    const indices = [];
    for (let j = 0; j < n; j++) {
      cost[i][j] -= rowMin;
      indices.push(i * n + j);
    }
    recorder.add('compute', indices, 0,
      `Row ${i}: subtract minimum ${rowMin}. Row becomes [${cost[i].join(', ')}]`,
      flatten(cost));
  }

  recorder.add('message', [], 0,
    `After row reduction: ${matrixStr(cost)}`,
    flatten(cost));

  // Step 2: Column reduction - subtract column minimum from each column
  for (let j = 0; j < n; j++) {
    let colMin = Infinity;
    for (let i = 0; i < n; i++) {
      colMin = Math.min(colMin, cost[i][j]);
    }
    const indices = [];
    for (let i = 0; i < n; i++) {
      cost[i][j] -= colMin;
      indices.push(i * n + j);
    }
    recorder.add('compute', indices, 1,
      `Column ${j}: subtract minimum ${colMin}. Column becomes [${Array.from({ length: n }, (_, i) => cost[i][j]).join(', ')}]`,
      flatten(cost));
  }

  recorder.add('message', [], 1,
    `After column reduction: ${matrixStr(cost)}`,
    flatten(cost));

  // Iterative covering and adjustment
  let maxIterations = n * n;
  while (maxIterations-- > 0) {
    // Find minimum lines to cover all zeros
    // Use a simplified approach: try to find assignment via greedy matching
    const rowCovered = new Array(n).fill(false);
    const colCovered = new Array(n).fill(false);
    const assignment = new Array(n).fill(-1);
    const colAssignment = new Array(n).fill(-1);

    // Try to assign rows to columns at zero positions
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        if (cost[i][j] === 0 && !colCovered[j]) {
          assignment[i] = j;
          colAssignment[j] = i;
          colCovered[j] = true;
          break;
        }
      }
    }

    // Count assignments
    let numAssigned = 0;
    for (let i = 0; i < n; i++) {
      if (assignment[i] !== -1) numAssigned++;
    }

    // Highlight zero positions
    const zeroIndices = [];
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        if (cost[i][j] === 0) zeroIndices.push(i * n + j);
      }
    }

    recorder.add('compare', zeroIndices, 2,
      `Found ${numAssigned} assignments out of ${n} needed. Zero positions highlighted.`,
      flatten(cost));

    if (numAssigned === n) {
      // Optimal assignment found
      const assignIndices = [];
      let totalCost = 0;
      const assignmentDesc = [];
      for (let i = 0; i < n; i++) {
        assignIndices.push(i * n + assignment[i]);
        totalCost += input[1 + i * n + assignment[i]];
        assignmentDesc.push(`Row ${i} -> Col ${assignment[i]} (cost ${input[1 + i * n + assignment[i]]})`);
      }

      recorder.add('sorted', assignIndices, 7,
        `Optimal assignment found! ${assignmentDesc.join(', ')}`,
        flatten(cost));

      recorder.add('message', [], -1,
        `Hungarian Algorithm complete. Minimum cost = ${totalCost}`,
        flatten(cost));

      return recorder.getSteps();
    }

    // Cover zeros with minimum lines using Konig's theorem approach
    // Mark rows without assignments
    const markedRows = new Set();
    const markedCols = new Set();
    for (let i = 0; i < n; i++) {
      if (assignment[i] === -1) markedRows.add(i);
    }

    // Iteratively mark columns and rows
    let changed = true;
    while (changed) {
      changed = false;
      // Mark columns with zeros in marked rows
      for (const i of markedRows) {
        for (let j = 0; j < n; j++) {
          if (cost[i][j] === 0 && !markedCols.has(j)) {
            markedCols.add(j);
            changed = true;
          }
        }
      }
      // Mark rows with assignments in marked columns
      for (const j of markedCols) {
        if (colAssignment[j] !== -1 && !markedRows.has(colAssignment[j])) {
          markedRows.add(colAssignment[j]);
          changed = true;
        }
      }
    }

    // Lines: cover unmarked rows and marked columns
    const coveredRows = new Set();
    const coveredCols = new Set();
    for (let i = 0; i < n; i++) {
      if (!markedRows.has(i)) coveredRows.add(i);
    }
    for (const j of markedCols) coveredCols.add(j);

    const coveredIndices = [];
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        if (coveredRows.has(i) || coveredCols.has(j)) {
          coveredIndices.push(i * n + j);
        }
      }
    }

    recorder.add('compare', coveredIndices, 2,
      `Covering zeros: ${coveredRows.size} row line(s) + ${coveredCols.size} column line(s) = ${coveredRows.size + coveredCols.size} lines (need ${n})`,
      flatten(cost));

    // Find minimum uncovered element
    let minUncovered = Infinity;
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        if (!coveredRows.has(i) && !coveredCols.has(j)) {
          minUncovered = Math.min(minUncovered, cost[i][j]);
        }
      }
    }

    recorder.add('compute', [], 4,
      `Minimum uncovered element = ${minUncovered}`,
      flatten(cost));

    // Adjust: subtract from uncovered, add to double-covered
    const adjustedIndices = [];
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        if (!coveredRows.has(i) && !coveredCols.has(j)) {
          cost[i][j] -= minUncovered;
          adjustedIndices.push(i * n + j);
        } else if (coveredRows.has(i) && coveredCols.has(j)) {
          cost[i][j] += minUncovered;
          adjustedIndices.push(i * n + j);
        }
      }
    }

    recorder.add('compute', adjustedIndices, 5,
      `Subtract ${minUncovered} from uncovered, add to double-covered. Matrix: ${matrixStr(cost)}`,
      flatten(cost));
  }

  // Fallback - should not normally reach here
  recorder.add('message', [], -1,
    'Hungarian Algorithm terminated (iteration limit reached).',
    flatten(cost));

  return recorder.getSteps();
}
