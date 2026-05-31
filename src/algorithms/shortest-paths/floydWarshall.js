import StepRecorder from '../../engine/StepRecorder';

export const meta = {
  name: 'Floyd-Warshall Algorithm',
  slug: 'floyd-warshall',
  category: 'shortest-paths',
  timeComplexity: { best: 'O(V^3)', average: 'O(V^3)', worst: 'O(V^3)' },
  spaceComplexity: 'O(V^2)',
  description:
    'Computes shortest paths between all pairs of vertices using dynamic programming. Iterates over intermediate vertices k, checking if path i->k->j is shorter than the current i->j distance.',
  rendererType: 'grid',
  pseudocode: [
    'initialize dist[i][j] from edge weights',
    'for k = 0 to V-1:',
    '  for i = 0 to V-1:',
    '    for j = 0 to V-1:',
    '      if dist[i][k] + dist[k][j] < dist[i][j]:',
    '        dist[i][j] = dist[i][k] + dist[k][j]',
  ],
  inputSchema: {
    type: 'array',
    constraints: { minLength: 2, maxLength: 30, minValue: -99, maxValue: 99 },
  },
};

// Format: [numNodes, from, to, weight, ...]
export const defaultInput = [5, 0,1,3, 0,2,8, 1,3,1, 1,4,7, 2,1,4, 3,0,2, 3,2,9, 4,3,6];

export function generateSteps(input) {
  const recorder = new StepRecorder();
  const n = input[0];
  const INF = 999;

  // Build distance matrix
  const dist = Array.from({ length: n }, (_, i) =>
    Array.from({ length: n }, (_, j) => (i === j ? 0 : INF))
  );

  for (let i = 1; i < input.length; i += 3) {
    const u = input[i], v = input[i + 1], w = input[i + 2];
    dist[u][v] = w;
  }

  const headers = Array.from({ length: n }, (_, i) => String(i));

  function makeSnapshot(highlights) {
    return {
      grid: dist.map(row => row.map(v => (v >= INF ? Infinity : v))),
      highlights,
      rowHeaders: headers,
      colHeaders: headers,
    };
  }

  recorder.add('message', [], -1, 'Starting Floyd-Warshall all-pairs shortest paths', makeSnapshot([]));
  recorder.add('message', [], 0, 'Initial distance matrix from edge weights', makeSnapshot([]));

  for (let k = 0; k < n; k++) {
    recorder.add('message', [], 1, `Using node ${k} as intermediate vertex`, makeSnapshot(
      Array.from({ length: n }, (_, i) => ({ row: i, col: k, state: 'computing' }))
        .concat(Array.from({ length: n }, (_, j) => ({ row: k, col: j, state: 'computing' })))
    ));

    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        if (i === j) continue;
        const through_k = dist[i][k] + dist[k][j];

        if (through_k < dist[i][j]) {
          const oldVal = dist[i][j] >= INF ? 'INF' : dist[i][j];
          dist[i][j] = through_k;

          recorder.add('visit', [], 5, `dist[${i}][${j}] = min(${oldVal}, ${dist[i][k]}+${dist[k][j]}) = ${through_k}`, makeSnapshot([
            { row: i, col: j, state: 'optimal' },
            { row: i, col: k, state: 'computing' },
            { row: k, col: j, state: 'computing' },
          ]));
        }
      }
    }

    recorder.add('message', [], 1, `Finished with intermediate vertex ${k}`, makeSnapshot([]));
  }

  // Check for negative cycles (negative diagonal)
  let negCycle = false;
  for (let i = 0; i < n; i++) {
    if (dist[i][i] < 0) { negCycle = true; break; }
  }

  if (negCycle) {
    recorder.add('message', [], -1, 'Negative cycle detected!', makeSnapshot([]));
  } else {
    recorder.add('message', [], -1, 'Floyd-Warshall complete. All-pairs shortest paths computed.', makeSnapshot(
      dist.flatMap((row, i) => row.map((v, j) => (v < INF && i !== j ? { row: i, col: j, state: 'computed' } : null)).filter(Boolean))
    ));
  }

  return recorder.getSteps();
}
