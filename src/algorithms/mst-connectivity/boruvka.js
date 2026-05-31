import StepRecorder from '../../engine/StepRecorder';

export const meta = {
  name: "Boruvka's Algorithm",
  slug: 'boruvka',
  category: 'mst-connectivity',
  timeComplexity: { best: 'O(E log V)', average: 'O(E log V)', worst: 'O(E log V)' },
  spaceComplexity: 'O(V + E)',
  description:
    "Finds a Minimum Spanning Tree by simultaneously adding the cheapest outgoing edge from each connected component in each round, merging components until only one remains.",
  rendererType: 'graph',
  pseudocode: [
    'initialize each vertex as its own component',
    'while more than one component:',
    '  for each component, find cheapest outgoing edge',
    '  add all cheapest edges to MST',
    '  merge components via union-find',
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

  function unionSets(a, b) {
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

  recorder.add('message', [], -1, "Starting Boruvka's algorithm: each component adds its cheapest outgoing edge per round", makeSnapshot());

  let numComponents = numNodes;
  let mstWeight = 0;
  let round = 0;

  while (numComponents > 1) {
    round++;
    // cheapest[comp] = { edgeIdx, weight }
    const cheapest = new Array(numNodes).fill(null);

    recorder.add('message', [], 1, `Round ${round}: finding cheapest outgoing edge for each of ${numComponents} components`, makeSnapshot());

    // Find cheapest edge for each component
    for (let i = 0; i < edges.length; i++) {
      const { from: u, to: v, weight: w } = edges[i];
      const cu = find(u), cv = find(v);
      if (cu === cv) continue; // same component

      if (cheapest[cu] === null || w < cheapest[cu].weight) {
        cheapest[cu] = { edgeIdx: i, weight: w };
      }
      if (cheapest[cv] === null || w < cheapest[cv].weight) {
        cheapest[cv] = { edgeIdx: i, weight: w };
      }
    }

    // Show cheapest edges found
    for (let c = 0; c < numNodes; c++) {
      if (cheapest[c] !== null && find(c) === c) {
        const e = edges[cheapest[c].edgeIdx];
        edgeStates[cheapest[c].edgeIdx].state = 'highlighted';
        recorder.add('compare', [e.from, e.to], 2, `Component of ${c}: cheapest outgoing edge is (${e.from}-${e.to}, weight=${e.weight})`, makeSnapshot());
      }
    }

    // Add cheapest edges and merge
    let addedThisRound = 0;
    for (let c = 0; c < numNodes; c++) {
      if (cheapest[c] !== null && find(c) === c) {
        const { edgeIdx, weight: w } = cheapest[c];
        const { from: u, to: v } = edges[edgeIdx];
        if (unionSets(u, v)) {
          edgeStates[edgeIdx].state = 'visited';
          nodeStates[u] = 'visited';
          nodeStates[v] = 'visited';
          mstWeight += w;
          numComponents--;
          addedThisRound++;
          recorder.add('visit', [u, v], 4, `Merge: added edge (${u}-${v}, weight=${w}) to MST. Components remaining: ${numComponents}`, makeSnapshot());
        }
      }
    }

    // Reset highlighted edges that weren't added
    for (let i = 0; i < edgeStates.length; i++) {
      if (edgeStates[i].state === 'highlighted') edgeStates[i].state = 'default';
    }

    if (addedThisRound === 0) break;
  }

  for (let i = 0; i < numNodes; i++) nodeStates[i] = 'sorted';
  recorder.add('message', [], -1, `Boruvka's complete in ${round} round(s). MST total weight = ${mstWeight}`, makeSnapshot());
  return recorder.getSteps();
}
