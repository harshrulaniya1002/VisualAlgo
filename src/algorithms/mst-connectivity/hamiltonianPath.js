import StepRecorder from '../../engine/StepRecorder';

export const meta = {
  name: 'Hamiltonian Path (Backtracking)',
  slug: 'hamiltonian-path',
  category: 'mst-connectivity',
  timeComplexity: { best: 'O(V!)', average: 'O(V!)', worst: 'O(V!)' },
  spaceComplexity: 'O(V)',
  description:
    'Finds a Hamiltonian path (visiting every vertex exactly once) using backtracking. Explores all possible paths from a starting node, marking vertices as visited and backtracking when a dead end is reached.',
  rendererType: 'graph',
  graphType: 'undirected',
  pseudocode: [
    'start from node 0, mark visited',
    'if path length == V: solution found',
    'for each neighbor v of current node:',
    '  if v not visited: mark visited, recurse',
    '  if recursion succeeds: return true',
    '  else: unmark v (backtrack)',
    'return false (no path from here)',
  ],
  inputSchema: {
    type: 'array',
    constraints: { minLength: 2, maxLength: 20, minValue: 0, maxValue: 99 },
  },
};

export const defaultInput = [5, 0,1, 1,2, 2,3, 3,4, 4,0, 0,2, 1,3];

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
  for (let i = 1; i < input.length; i += 2) {
    const u = input[i], v = input[i + 1];
    edgeList.push({ from: u, to: v });
    adj[u].push({ node: v, edgeIdx: edgeList.length - 1 });
    adj[v].push({ node: u, edgeIdx: edgeList.length - 1 });
  }

  const edgeStates = edgeList.map(e => ({ ...e, state: 'default', directed: false }));
  const visited = new Array(numNodes).fill(false);
  const nodeStates = new Array(numNodes).fill('default');
  const path = [];
  let found = false;

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

  recorder.add('message', [], -1, 'Starting Hamiltonian Path search using backtracking from node 0', makeSnapshot());

  function backtrack(u) {
    if (found) return;

    visited[u] = true;
    path.push(u);
    nodeStates[u] = 'current';

    recorder.add('visit', [u], 0, `Visit node ${u}. Path: [${path.join(' -> ')}] (length ${path.length}/${numNodes})`, makeSnapshot());

    if (path.length === numNodes) {
      found = true;
      for (const n of path) nodeStates[n] = 'found';
      // Mark path edges
      for (let i = 0; i < path.length - 1; i++) {
        const a = path[i], b = path[i + 1];
        const eIdx = edgeList.findIndex(
          e => (e.from === a && e.to === b) || (e.from === b && e.to === a)
        );
        if (eIdx !== -1) edgeStates[eIdx].state = 'visited';
      }
      recorder.add('visit', path, 1, `Hamiltonian path found! Path: [${path.join(' -> ')}]`, makeSnapshot());
      return;
    }

    for (const { node: v, edgeIdx } of adj[u]) {
      if (found) return;
      if (!visited[v]) {
        edgeStates[edgeIdx].state = 'highlighted';
        recorder.add('message', [v], 2, `Try edge ${u}-${v}`, makeSnapshot());
        backtrack(v);
        if (found) return;

        // Backtrack
        edgeStates[edgeIdx].state = 'default';
        nodeStates[v] = 'default';
        recorder.add('message', [v], 5, `Backtrack from node ${v}. Dead end.`, makeSnapshot());
      }
    }

    if (!found) {
      visited[u] = false;
      path.pop();
      nodeStates[u] = path.includes(u) ? 'current' : 'default';
    }
  }

  backtrack(0);

  if (!found) {
    for (let i = 0; i < numNodes; i++) nodeStates[i] = 'default';
    recorder.add('message', [], -1, 'No Hamiltonian path exists from node 0', makeSnapshot());
  } else {
    recorder.add('message', [], -1, `Hamiltonian path: [${path.join(' -> ')}]`, makeSnapshot());
  }

  return recorder.getSteps();
}
