import StepRecorder from '../../engine/StepRecorder';

export const meta = {
  name: "Dijkstra's Algorithm",
  slug: 'dijkstra',
  category: 'shortest-paths',
  timeComplexity: { best: 'O((V + E) log V)', average: 'O((V + E) log V)', worst: 'O((V + E) log V)' },
  spaceComplexity: 'O(V)',
  description:
    'Finds shortest paths from a source to all vertices in a weighted graph with non-negative edge weights. Uses a priority queue (min-heap) to greedily select the closest unvisited vertex at each step.',
  rendererType: 'graph',
  pseudocode: [
    'set dist[source] = 0, all others = INF',
    'add source to priority queue',
    'while PQ not empty:',
    '  u = extract min from PQ',
    '  for each neighbor v of u:',
    '    if dist[u] + weight(u,v) < dist[v]: update & push',
  ],
  inputSchema: {
    type: 'array',
    constraints: { minLength: 2, maxLength: 30, minValue: 0, maxValue: 99 },
  },
};

// Format: [numNodes, from, to, weight, from, to, weight, ...]
export const defaultInput = [6, 0,1,4, 0,2,2, 1,2,1, 1,3,5, 2,3,8, 2,4,10, 3,4,2, 3,5,6, 4,5,3];

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

  const edgeList = [];
  const adj = Array.from({ length: numNodes }, () => []);
  for (let i = 1; i < input.length; i += 3) {
    const u = input[i], v = input[i + 1], w = input[i + 2];
    edgeList.push({ from: u, to: v, weight: w, state: 'default', directed: false });
    adj[u].push({ node: v, weight: w });
    adj[v].push({ node: u, weight: w });
  }

  const dist = new Array(numNodes).fill(Infinity);
  const visited = new Array(numNodes).fill(false);
  const edgeStates = edgeList.map(e => ({ ...e }));

  function makeSnapshot(current) {
    return {
      nodes: Array.from({ length: numNodes }, (_, i) => ({
        id: i, x: positions[i].x, y: positions[i].y,
        label: dist[i] === Infinity ? `${i}:INF` : `${i}:${dist[i]}`,
        state: i === current ? 'current' : visited[i] ? 'in-path' : dist[i] < Infinity ? 'visited' : 'default',
      })),
      edges: edgeStates.map(e => ({ ...e })),
    };
  }

  recorder.add('message', [], -1, 'Starting Dijkstra\'s algorithm from node 0', makeSnapshot(-1));

  dist[0] = 0;
  // Simple priority queue using array (for visualization clarity)
  const pq = [{ node: 0, dist: 0 }];

  recorder.add('visit', [0], 0, 'Set dist[0] = 0, add to priority queue', makeSnapshot(0));

  while (pq.length > 0) {
    // Extract min
    pq.sort((a, b) => a.dist - b.dist);
    const { node: u } = pq.shift();

    if (visited[u]) continue;
    visited[u] = true;

    recorder.add('visit', [u], 3, `Extract node ${u} (dist = ${dist[u]}) from PQ, mark finalized`, makeSnapshot(u));

    for (const { node: v, weight: w } of adj[u]) {
      if (visited[v]) continue;

      const edgeIdx = edgeStates.findIndex(
        e => (e.from === u && e.to === v) || (e.from === v && e.to === u)
      );

      const newDist = dist[u] + w;
      if (newDist < dist[v]) {
        dist[v] = newDist;
        pq.push({ node: v, dist: newDist });
        if (edgeIdx !== -1) edgeStates[edgeIdx].state = 'visited';
        recorder.add('visit', [v], 5, `Relax edge ${u}->${v}: dist[${v}] = ${dist[u]} + ${w} = ${newDist}`, makeSnapshot(v));
      } else {
        recorder.add('message', [], 5, `Edge ${u}->${v}: ${dist[u]} + ${w} = ${newDist} >= ${dist[v]}, no update`, makeSnapshot(u));
      }
    }
  }

  recorder.add('message', [], -1, `Dijkstra complete. Shortest distances: [${dist.join(', ')}]`, makeSnapshot(-1));
  return recorder.getSteps();
}
