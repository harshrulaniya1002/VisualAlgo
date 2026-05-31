import StepRecorder from '../../engine/StepRecorder';

export const meta = {
  name: "Prim's Algorithm",
  slug: 'prim',
  category: 'mst-connectivity',
  timeComplexity: { best: 'O((V + E) log V)', average: 'O((V + E) log V)', worst: 'O((V + E) log V)' },
  spaceComplexity: 'O(V)',
  description:
    "Grows a Minimum Spanning Tree from node 0 by always selecting the minimum-weight edge connecting a visited node to an unvisited node. Uses a priority queue to efficiently find the cheapest edge.",
  rendererType: 'graph',
  pseudocode: [
    'start from node 0, mark as visited',
    'add all edges from node 0 to priority queue',
    'while PQ not empty and MST incomplete:',
    '  (w, u, v) = extract min from PQ',
    '  if v already visited, skip',
    '  add edge (u,v) to MST, mark v visited',
    '  add all edges from v to PQ',
  ],
  inputSchema: {
    type: 'array',
    constraints: { minLength: 2, maxLength: 20, minValue: 0, maxValue: 99 },
  },
};

export const defaultInput = [6, 0,1,4, 0,2,3, 1,2,1, 1,3,2, 2,3,4, 3,4,2, 4,5,6];

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
    edgeList.push({ from: u, to: v, weight: w });
    adj[u].push({ node: v, weight: w, edgeIdx: edgeList.length - 1 });
    adj[v].push({ node: u, weight: w, edgeIdx: edgeList.length - 1 });
  }

  const edgeStates = edgeList.map(e => ({ ...e, state: 'default', directed: false, label: `${e.weight}` }));
  const visited = new Array(numNodes).fill(false);

  function makeSnapshot(current) {
    return {
      nodes: Array.from({ length: numNodes }, (_, i) => ({
        id: i, x: positions[i].x, y: positions[i].y,
        label: `${i}`,
        state: i === current ? 'current' : visited[i] ? 'visited' : 'default',
      })),
      edges: edgeStates.map(e => ({ ...e })),
    };
  }

  recorder.add('message', [], -1, "Starting Prim's algorithm from node 0", makeSnapshot(-1));

  // Start from node 0
  visited[0] = true;
  const pq = []; // { weight, from, to, edgeIdx }
  for (const { node: v, weight: w, edgeIdx } of adj[0]) {
    pq.push({ weight: w, from: 0, to: v, edgeIdx });
  }
  recorder.add('visit', [0], 0, 'Mark node 0 as visited. Add its edges to priority queue.', makeSnapshot(0));

  let mstWeight = 0;
  let mstEdgeCount = 0;

  while (pq.length > 0 && mstEdgeCount < numNodes - 1) {
    // Extract min
    pq.sort((a, b) => a.weight - b.weight);
    const { weight: w, from: u, to: v, edgeIdx } = pq.shift();

    if (visited[v]) {
      recorder.add('message', [], 4, `Skip edge (${u}-${v}, weight=${w}): node ${v} already visited`, makeSnapshot(u));
      continue;
    }

    // Add edge to MST
    edgeStates[edgeIdx].state = 'visited';
    visited[v] = true;
    mstWeight += w;
    mstEdgeCount++;
    recorder.add('visit', [v], 5, `Add edge (${u}-${v}, weight=${w}) to MST. Mark node ${v} visited. MST weight = ${mstWeight}`, makeSnapshot(v));

    // Add new edges from v
    for (const { node: next, weight: nw, edgeIdx: nIdx } of adj[v]) {
      if (!visited[next]) {
        pq.push({ weight: nw, from: v, to: next, edgeIdx: nIdx });
        edgeStates[nIdx].state = 'highlighted';
        recorder.add('message', [], 6, `Add edge (${v}-${next}, weight=${nw}) to priority queue`, makeSnapshot(v));
      }
    }
  }

  // Mark all as sorted
  for (let i = 0; i < numNodes; i++) visited[i] = true;
  recorder.add('message', [], -1, `Prim's complete. MST total weight = ${mstWeight}`, makeSnapshot(-1));
  return recorder.getSteps();
}
