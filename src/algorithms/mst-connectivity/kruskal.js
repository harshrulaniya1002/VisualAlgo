import StepRecorder from '../../engine/StepRecorder';

export const meta = {
  name: "Kruskal's Algorithm",
  slug: 'kruskal',
  category: 'mst-connectivity',
  timeComplexity: { best: 'O(E log E)', average: 'O(E log E)', worst: 'O(E log E)' },
  spaceComplexity: 'O(V)',
  description:
    "Finds a Minimum Spanning Tree by sorting all edges by weight, then greedily adding each edge if it doesn't form a cycle. Uses a Union-Find (disjoint set) data structure for efficient cycle detection.",
  rendererType: 'graph',
  pseudocode: [
    'sort all edges by weight',
    'initialize union-find for each vertex',
    'for each edge (u, v, w) in sorted order:',
    '  if find(u) != find(v):',
    '    add edge to MST',
    '    union(u, v)',
    'return MST edges',
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

  const edges = [];
  for (let i = 1; i < input.length; i += 3) {
    const u = input[i], v = input[i + 1], w = input[i + 2];
    edges.push({ from: u, to: v, weight: w });
  }

  const edgeStates = edges.map(e => ({ ...e, state: 'default', directed: false, label: `${e.weight}` }));
  const nodeStates = new Array(numNodes).fill('default');

  // Union-Find
  const parent = Array.from({ length: numNodes }, (_, i) => i);
  const rank = new Array(numNodes).fill(0);

  function find(x) {
    while (parent[x] !== x) {
      parent[x] = parent[parent[x]];
      x = parent[x];
    }
    return x;
  }

  function union(a, b) {
    const ra = find(a), rb = find(b);
    if (ra === rb) return false;
    if (rank[ra] < rank[rb]) parent[ra] = rb;
    else if (rank[ra] > rank[rb]) parent[rb] = ra;
    else { parent[rb] = ra; rank[ra]++; }
    return true;
  }

  function makeSnapshot() {
    return {
      nodes: Array.from({ length: numNodes }, (_, i) => ({
        id: i, x: positions[i].x, y: positions[i].y,
        label: `${i}`,
        state: nodeStates[i],
      })),
      edges: edgeStates.map(e => ({ ...e })),
    };
  }

  recorder.add('message', [], -1, "Starting Kruskal's algorithm: sort edges by weight, then add if no cycle", makeSnapshot());

  // Sort edges by weight
  const sortedIndices = edges.map((_, i) => i);
  sortedIndices.sort((a, b) => edges[a].weight - edges[b].weight);

  recorder.add('message', [], 0, `Edges sorted by weight: ${sortedIndices.map(i => `(${edges[i].from}-${edges[i].to}:${edges[i].weight})`).join(', ')}`, makeSnapshot());

  let mstWeight = 0;
  let mstEdgeCount = 0;

  for (const idx of sortedIndices) {
    const { from: u, to: v, weight: w } = edges[idx];

    // Highlight the edge being considered
    edgeStates[idx].state = 'highlighted';
    nodeStates[u] = 'current';
    nodeStates[v] = 'current';
    recorder.add('compare', [u, v], 2, `Considering edge (${u}-${v}, weight=${w}). find(${u})=${find(u)}, find(${v})=${find(v)}`, makeSnapshot());

    if (union(u, v)) {
      edgeStates[idx].state = 'visited';
      nodeStates[u] = 'visited';
      nodeStates[v] = 'visited';
      mstWeight += w;
      mstEdgeCount++;
      recorder.add('visit', [u, v], 4, `Added edge (${u}-${v}, weight=${w}) to MST. No cycle formed. MST weight = ${mstWeight}`, makeSnapshot());
    } else {
      edgeStates[idx].state = 'default';
      nodeStates[u] = nodeStates[u] === 'visited' ? 'visited' : 'default';
      nodeStates[v] = nodeStates[v] === 'visited' ? 'visited' : 'default';
      recorder.add('message', [u, v], 3, `Skipped edge (${u}-${v}, weight=${w}): would form a cycle (same component)`, makeSnapshot());
    }

    if (mstEdgeCount === numNodes - 1) break;
  }

  // Mark all MST nodes as sorted
  for (let i = 0; i < numNodes; i++) nodeStates[i] = 'sorted';
  recorder.add('message', [], -1, `Kruskal's complete. MST total weight = ${mstWeight}`, makeSnapshot());
  return recorder.getSteps();
}
