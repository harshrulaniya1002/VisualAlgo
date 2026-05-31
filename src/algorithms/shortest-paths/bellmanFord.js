import StepRecorder from '../../engine/StepRecorder';

export const meta = {
  name: 'Bellman-Ford Algorithm',
  slug: 'bellman-ford',
  category: 'shortest-paths',
  timeComplexity: { best: 'O(V * E)', average: 'O(V * E)', worst: 'O(V * E)' },
  spaceComplexity: 'O(V)',
  description:
    'Finds shortest paths from a source vertex to all other vertices, even with negative edge weights. Runs V-1 relaxation passes over all edges and can detect negative weight cycles on the V-th pass.',
  rendererType: 'graph',
  graphType: 'directed-weighted',
  pseudocode: [
    'set dist[source] = 0, others = INF',
    'repeat (V - 1) times:',
    '  for each edge (u, v, w):',
    '    if dist[u] + w < dist[v]:',
    '      dist[v] = dist[u] + w',
    'check for negative cycles (V-th pass)',
  ],
  inputSchema: {
    type: 'array',
    constraints: { minLength: 2, maxLength: 30, minValue: -99, maxValue: 99 },
  },
};

// Format: [numNodes, from, to, weight, ...] (directed edges)
export const defaultInput = [5, 0,1,6, 0,2,7, 1,2,8, 1,3,-4, 1,4,5, 2,3,9, 2,4,-3, 3,0,2, 4,3,7];

function arrangeInCircle(n, cx, cy, r) {
  return Array.from({ length: n }, (_, i) => ({
    x: cx + r * Math.cos(2 * Math.PI * i / n - Math.PI / 2),
    y: cy + r * Math.sin(2 * Math.PI * i / n - Math.PI / 2),
  }));
}

export function generateSteps(input) {
  const recorder = new StepRecorder();
  const numNodes = input[0];
  const positions = arrangeInCircle(numNodes, 300, 200, 150);

  // Parse directed weighted edges
  const edgeList = [];
  for (let i = 1; i < input.length; i += 3) {
    const u = input[i], v = input[i + 1], w = input[i + 2];
    edgeList.push({ from: u, to: v, weight: w, state: 'default', directed: true });
  }

  const dist = new Array(numNodes).fill(Infinity);
  const edgeStates = edgeList.map(e => ({ ...e }));

  function makeSnapshot(current) {
    return {
      nodes: Array.from({ length: numNodes }, (_, i) => ({
        id: i, x: positions[i].x, y: positions[i].y,
        label: dist[i] === Infinity ? `${i}:INF` : `${i}:${dist[i]}`,
        state: i === current ? 'current' : dist[i] < Infinity ? 'visited' : 'default',
      })),
      edges: edgeStates.map(e => ({ ...e })),
    };
  }

  dist[0] = 0;
  recorder.add('message', [], -1, 'Starting Bellman-Ford from node 0', makeSnapshot(0));
  recorder.add('visit', [0], 0, 'Set dist[0] = 0, all others = INF', makeSnapshot(0));

  // V - 1 relaxation passes
  for (let pass = 0; pass < numNodes - 1; pass++) {
    recorder.add('message', [], 1, `Relaxation pass ${pass + 1} of ${numNodes - 1}`, makeSnapshot(-1));
    let updated = false;

    for (let e = 0; e < edgeList.length; e++) {
      const { from: u, to: v, weight: w } = edgeList[e];

      if (dist[u] === Infinity) continue;

      if (dist[u] + w < dist[v]) {
        dist[v] = dist[u] + w;
        edgeStates[e].state = 'visited';
        updated = true;
        recorder.add('visit', [v], 4, `Relax ${u}->${v}: dist[${v}] = ${dist[u]} + (${w}) = ${dist[v]}`, makeSnapshot(v));
      }
    }

    if (!updated) {
      recorder.add('message', [], 1, `No updates in pass ${pass + 1}. Early termination.`, makeSnapshot(-1));
      break;
    }
  }

  // Check for negative cycles
  recorder.add('message', [], 5, 'Checking for negative weight cycles...', makeSnapshot(-1));
  let hasNegCycle = false;
  for (const { from: u, to: v, weight: w } of edgeList) {
    if (dist[u] !== Infinity && dist[u] + w < dist[v]) {
      hasNegCycle = true;
      break;
    }
  }

  if (hasNegCycle) {
    recorder.add('message', [], -1, 'Negative weight cycle detected! Distances are undefined.', makeSnapshot(-1));
  } else {
    recorder.add('message', [], -1, `Bellman-Ford complete. Shortest distances: [${dist.join(', ')}]`, makeSnapshot(-1));
  }

  return recorder.getSteps();
}
