import StepRecorder from '../../engine/StepRecorder';

export const meta = {
  name: "Kosaraju's SCC",
  slug: 'kosaraju',
  category: 'mst-connectivity',
  timeComplexity: { best: 'O(V + E)', average: 'O(V + E)', worst: 'O(V + E)' },
  spaceComplexity: 'O(V + E)',
  description:
    "Finds all Strongly Connected Components using two DFS passes. The first DFS records nodes in finish order. The graph is then transposed, and a second DFS in reverse finish order identifies each SCC.",
  rendererType: 'graph',
  graphType: 'directed',
  pseudocode: [
    'Pass 1: DFS on original graph, record finish order',
    'Transpose the graph (reverse all edges)',
    'Pass 2: DFS on transposed graph in reverse finish order',
    '  each DFS tree in pass 2 is an SCC',
  ],
  inputSchema: {
    type: 'array',
    constraints: { minLength: 2, maxLength: 20, minValue: 0, maxValue: 99 },
  },
};

export const defaultInput = [6, 0,1, 1,2, 2,0, 1,3, 3,4, 4,5, 5,3];

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
  const radj = Array.from({ length: numNodes }, () => []);

  for (let i = 1; i < input.length; i += 2) {
    const u = input[i], v = input[i + 1];
    edgeList.push({ from: u, to: v });
    adj[u].push(v);
    radj[v].push(u);
  }

  let edgeStates = edgeList.map(e => ({ ...e, state: 'default', directed: true }));
  const nodeStates = new Array(numNodes).fill('default');
  const visited = new Array(numNodes).fill(false);
  const finishOrder = [];

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

  recorder.add('message', [], -1, "Starting Kosaraju's algorithm: two-pass DFS to find SCCs", makeSnapshot());

  // Pass 1: DFS on original graph to get finish order
  recorder.add('message', [], 0, 'Pass 1: DFS on original graph to record finish order', makeSnapshot());

  function dfs1(u) {
    visited[u] = true;
    nodeStates[u] = 'current';
    recorder.add('visit', [u], 0, `Pass 1: visit node ${u}`, makeSnapshot());

    for (const v of adj[u]) {
      if (!visited[v]) {
        const eIdx = edgeStates.findIndex(e => e.from === u && e.to === v);
        if (eIdx !== -1) edgeStates[eIdx].state = 'visited';
        dfs1(v);
      }
    }

    nodeStates[u] = 'visited';
    finishOrder.push(u);
    recorder.add('message', [u], 0, `Pass 1: finish node ${u}. Finish order so far: [${finishOrder.join(', ')}]`, makeSnapshot());
  }

  for (let i = 0; i < numNodes; i++) {
    if (!visited[i]) dfs1(i);
  }

  recorder.add('message', [], 0, `Pass 1 complete. Finish order: [${finishOrder.join(', ')}]`, makeSnapshot());

  // Transpose: show reversed edges
  recorder.add('message', [], 1, 'Transposing graph: reversing all edge directions', makeSnapshot());

  const transposedEdgeList = edgeList.map(e => ({ from: e.to, to: e.from }));
  edgeStates = transposedEdgeList.map(e => ({ ...e, state: 'default', directed: true }));

  // Reset node states
  for (let i = 0; i < numNodes; i++) {
    nodeStates[i] = 'default';
    visited[i] = false;
  }
  recorder.add('message', [], 1, 'Graph transposed. All edges reversed.', makeSnapshot());

  // Pass 2: DFS on transposed graph in reverse finish order
  recorder.add('message', [], 2, 'Pass 2: DFS on transposed graph in reverse finish order', makeSnapshot());
  const sccs = [];

  function dfs2(u, scc) {
    visited[u] = true;
    scc.push(u);
    nodeStates[u] = 'current';
    recorder.add('visit', [u], 3, `Pass 2: visit node ${u}, adding to current SCC`, makeSnapshot());

    for (const v of radj[u]) {
      if (!visited[v]) {
        const eIdx = edgeStates.findIndex(e => e.from === u && e.to === v);
        if (eIdx !== -1) edgeStates[eIdx].state = 'visited';
        dfs2(v, scc);
      }
    }
  }

  for (let i = finishOrder.length - 1; i >= 0; i--) {
    const node = finishOrder[i];
    if (!visited[node]) {
      recorder.add('message', [], 2, `Pass 2: start new DFS from node ${node} (reverse finish order)`, makeSnapshot());
      const scc = [];
      dfs2(node, scc);
      sccs.push(scc);
      for (const n of scc) nodeStates[n] = 'found';
      recorder.add('visit', scc, 3, `SCC found: {${scc.join(', ')}}`, makeSnapshot());
    }
  }

  recorder.add('message', [], -1, `Kosaraju's complete. Found ${sccs.length} SCC(s): ${sccs.map(s => `{${s.join(',')}}`).join(', ')}`, makeSnapshot());
  return recorder.getSteps();
}
