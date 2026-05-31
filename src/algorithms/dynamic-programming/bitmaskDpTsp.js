import StepRecorder from '../../engine/StepRecorder';

export const meta = {
  name: 'Bitmask DP (Traveling Salesman)',
  slug: 'bitmask-dp-tsp',
  category: 'dynamic-programming',
  timeComplexity: { best: 'O(2^n * n^2)', average: 'O(2^n * n^2)', worst: 'O(2^n * n^2)' },
  spaceComplexity: 'O(2^n * n)',
  description:
    'Solves TSP using bitmasks to represent visited city subsets. dp[mask][i] = min cost to visit cities in mask, ending at city i. Input: flattened adjacency matrix [n, cost00, cost01, ...].',
  rendererType: 'bar',
  pseudocode: [
    'dp[1][0] = 0  (start at city 0)',
    'for mask = 1 to 2^n - 1',
    '  for last in mask',
    '    for next not in mask',
    '      dp[mask|next][next] = min(dp[mask|next][next], dp[mask][last] + dist[last][next])',
    'ans = min(dp[(2^n)-1][i] + dist[i][0])',
  ],
  inputSchema: {
    type: 'array',
    constraints: { minLength: 5, maxLength: 20, minValue: 0, maxValue: 99 },
  },
};

// Input: [n, cost matrix flattened row by row]
// 4 cities: n=4, then 16 costs
export const defaultInput = [4, 0, 10, 15, 20, 10, 0, 35, 25, 15, 35, 0, 30, 20, 25, 30, 0];

export function generateSteps(input) {
  const recorder = new StepRecorder();
  const n = input[0];
  const dist = [];
  for (let i = 0; i < n; i++) {
    dist.push(input.slice(1 + i * n, 1 + (i + 1) * n));
  }
  const totalMasks = 1 << n;
  const INF = 999999;

  // dp[mask][i] - we visualize best costs for each ending city across key masks
  const dp = Array.from({ length: totalMasks }, () => new Array(n).fill(INF));
  dp[1][0] = 0; // start at city 0, mask=1 (only city 0 visited)

  // For visualization: show dp values for ending at each city
  const vizArr = new Array(n).fill(INF);
  vizArr[0] = 0;

  recorder.add('message', [], 0, `TSP with ${n} cities using Bitmask DP`, [...vizArr], {});
  recorder.add('compute', [0], 0, `Start at city 0: dp[mask=1][0] = 0`, [...vizArr], {});

  let stepsAdded = 0;

  for (let mask = 1; mask < totalMasks; mask++) {
    for (let last = 0; last < n; last++) {
      if (!(mask & (1 << last))) continue;
      if (dp[mask][last] === INF) continue;

      for (let next = 0; next < n; next++) {
        if (mask & (1 << next)) continue;

        const newMask = mask | (1 << next);
        const newCost = dp[mask][last] + dist[last][next];

        if (newCost < dp[newMask][next]) {
          dp[newMask][next] = newCost;

          if (stepsAdded < 40) {
            const visitedCities = [];
            for (let b = 0; b < n; b++) if (newMask & (1 << b)) visitedCities.push(b);

            const vizCopy = dp[newMask].map(v => v === INF ? 0 : v);
            recorder.add('compute', [next], 3, `mask=${newMask.toString(2).padStart(n, '0')} cities={${visitedCities}}: end at ${next}, cost=${newCost}`, vizCopy, {});
            stepsAdded++;
          }
        }
      }
    }
  }

  // Find minimum tour cost: visit all cities and return to 0
  const fullMask = totalMasks - 1;
  let minCost = INF;
  let bestLast = -1;
  const finalViz = new Array(n).fill(0);

  for (let i = 0; i < n; i++) {
    const tourCost = dp[fullMask][i] + dist[i][0];
    finalViz[i] = tourCost === INF ? 0 : tourCost;
    if (tourCost < minCost) {
      minCost = tourCost;
      bestLast = i;
    }
  }

  recorder.add('compute', [], 4, `All cities visited. Tour costs (returning to 0): [${finalViz}]`, [...finalViz], {});
  recorder.add('sorted', [bestLast], 5, `Minimum TSP tour cost = ${minCost}`, [...finalViz], {});

  return recorder.getSteps();
}
