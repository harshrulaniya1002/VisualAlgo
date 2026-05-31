import StepRecorder from '../../engine/StepRecorder';

export const meta = {
  name: "Johnson's Algorithm",
  slug: 'johnsons-algorithm',
  category: 'shortest-paths',
  timeComplexity: { best: 'O(V^2 log V + V*E)', average: 'O(V^2 log V + V*E)', worst: 'O(V^2 log V + V*E)' },
  spaceComplexity: 'O(V^2)',
  description:
    'Computes all-pairs shortest paths for sparse graphs. First runs Bellman-Ford from a new virtual node to reweight edges (removing negatives), then runs Dijkstra from each vertex on the reweighted graph.',
  rendererType: 'graph',
  pseudocode: [
    'add virtual node s with 0-weight edges to all',
    'run Bellman-Ford from s to get h[]',
    'reweight: w\'(u,v) = w(u,v) + h[u] - h[v]',
    'for each node u:',
    '  run Dijkstra from u on reweighted graph',
    '  adjust: dist[u][v] += h[v] - h[u]',
  ],
  inputSchema: {
    type: 'array',
    constraints: { minLength: 2, maxLength: 30, minValue: -99, maxValue: 99 },
  },
};

// Format: [numNodes, from, to, weight, ...] directed edges with some negative weights
export const defaultInput = [5, 0,1,3, 0,4,-4, 1,2,8, 1,3,1, 2,0,2, 3,2,-5, 4,3,6];

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
  for (let i = 1; i < input.length; i += 3) {
    edgeList.push({ from: input[i], to: input[i + 1], weight: input[i + 2] });
  }

  const displayEdges = edgeList.map(e => ({
    from: e.from, to: e.to, weight: e.weight, state: 'default', directed: true,
  }));

  function makeSnapshot(current, nodeLabels) {
    return {
      nodes: Array.from({ length: numNodes }, (_, i) => ({
        id: i, x: positions[i].x, y: positions[i].y,
        label: nodeLabels ? nodeLabels[i] : String(i),
        state: i === current ? 'current' : 'default',
      })),
      edges: displayEdges.map(e => ({ ...e })),
    };
  }

  recorder.add('message', [], -1, 'Starting Johnson\'s algorithm for all-pairs shortest paths', makeSnapshot(-1));

  // Step 1: Bellman-Ford from virtual node (node index = numNodes)
  recorder.add('message', [], 0, 'Step 1: Run Bellman-Ford from virtual node to get potentials h[]', makeSnapshot(-1));

  const h = new Array(numNodes).fill(0); // h[v] = shortest dist from virtual node
  // Virtual node has 0-weight edges to all nodes, so initially h = [0, 0, ..., 0]

  // Run V-1 passes of Bellman-Ford
  for (let pass = 0; pass < numNodes - 1; pass++) {
    let updated = false;
    for (const { from: u, to: v, weight: w } of edgeList) {
      if (h[u] + w < h[v]) {
        h[v] = h[u] + w;
        updated = true;
      }
    }
    if (!updated) break;
  }

  const hLabels = Array.from({ length: numNodes }, (_, i) => `${i}:h=${h[i]}`);
  recorder.add('message', [], 1, `Bellman-Ford complete. Potentials h = [${h.join(', ')}]`, makeSnapshot(-1, hLabels));

  // Step 2: Reweight edges
  recorder.add('message', [], 2, 'Step 2: Reweight edges: w\'(u,v) = w(u,v) + h[u] - h[v]', makeSnapshot(-1, hLabels));

  const reweightedEdges = edgeList.map(e => ({
    ...e,
    reweight: e.weight + h[e.from] - h[e.to],
  }));

  for (let i = 0; i < reweightedEdges.length; i++) {
    const e = reweightedEdges[i];
    displayEdges[i].weight = e.reweight;
    displayEdges[i].state = 'visited';
  }
  recorder.add('message', [], 2, 'All edge weights are now non-negative', makeSnapshot(-1, hLabels));

  // Step 3: Run Dijkstra from each node
  const allDist = Array.from({ length: numNodes }, () => new Array(numNodes).fill(Infinity));

  const adj = Array.from({ length: numNodes }, () => []);
  for (const e of reweightedEdges) {
    adj[e.from].push({ node: e.to, weight: e.reweight });
  }

  for (let src = 0; src < numNodes; src++) {
    recorder.add('message', [src], 3, `Step 3: Run Dijkstra from node ${src}`, makeSnapshot(src, hLabels));

    const dist = new Array(numNodes).fill(Infinity);
    const visited = new Array(numNodes).fill(false);
    dist[src] = 0;
    const pq = [{ node: src, dist: 0 }];

    while (pq.length > 0) {
      pq.sort((a, b) => a.dist - b.dist);
      const { node: u } = pq.shift();
      if (visited[u]) continue;
      visited[u] = true;

      for (const { node: v, weight: w } of adj[u]) {
        if (!visited[v] && dist[u] + w < dist[v]) {
          dist[v] = dist[u] + w;
          pq.push({ node: v, dist: dist[v] });
        }
      }
    }

    // Adjust distances back: real dist = dist[v] - h[src] + h[v]
    for (let v = 0; v < numNodes; v++) {
      if (dist[v] < Infinity) {
        allDist[src][v] = dist[v] - h[src] + h[v];
      }
    }

    const labels = Array.from({ length: numNodes }, (_, i) =>
      allDist[src][i] === Infinity ? `${i}:INF` : `${i}:${allDist[src][i]}`
    );
    recorder.add('visit', [src], 5, `From ${src}: [${allDist[src].map(d => d === Infinity ? 'INF' : d).join(', ')}]`, makeSnapshot(src, labels));
  }

  // Restore original edge weights for final display
  for (let i = 0; i < edgeList.length; i++) {
    displayEdges[i].weight = edgeList[i].weight;
  }

  recorder.add('message', [], -1, 'Johnson\'s algorithm complete. All-pairs shortest paths computed.', makeSnapshot(-1));
  return recorder.getSteps();
}
