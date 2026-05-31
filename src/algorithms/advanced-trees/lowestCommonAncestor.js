import StepRecorder from '../../engine/StepRecorder';

export const meta = {
  name: 'Lowest Common Ancestor (LCA)',
  slug: 'lowest-common-ancestor',
  category: 'advanced-trees',
  timeComplexity: { best: 'O(n log n)', average: 'O(n log n)', worst: 'O(n log n)' },
  spaceComplexity: 'O(n log n)',
  description:
    'Finds the Lowest Common Ancestor of two nodes using binary lifting. Preprocessing takes O(n log n) time and space. Each LCA query is answered in O(log n) by first equalizing depths, then jumping both nodes up in sync until they meet.',
  rendererType: 'graph',
  pseudocode: [
    'function preprocess(root):',
    '  DFS to compute depth[] and parent[]',
    '  Build binary lifting table up[][]',
    'function lca(u, v):',
    '  Equalize depths of u and v',
    '  if u == v, return u',
    '  Jump both up from highest bit to 0:',
    '    if up[u][j] != up[v][j]: jump both',
    '  return parent[u]',
  ],
  inputSchema: {
    type: 'array',
    constraints: { minLength: 3, maxLength: 30, minValue: 0, maxValue: 99 },
  },
};

export const defaultInput = [7, 0, 1, 0, 2, 1, 3, 1, 4, 2, 5, 2, 6];

function arrangeInTree(n, adj, root) {
  const positions = [];
  const visited = new Array(n).fill(false);
  const levels = new Array(n).fill(0);

  const queue = [root];
  visited[root] = true;
  while (queue.length > 0) {
    const node = queue.shift();
    for (const child of adj[node]) {
      if (!visited[child]) {
        visited[child] = true;
        levels[child] = levels[node] + 1;
        queue.push(child);
      }
    }
  }

  const maxLevel = Math.max(...levels);
  const levelCounts = new Array(maxLevel + 1).fill(0);
  const levelPos = new Array(maxLevel + 1).fill(0);
  for (let i = 0; i < n; i++) levelCounts[levels[i]]++;

  for (let i = 0; i < n; i++) {
    const lv = levels[i];
    const count = levelCounts[lv];
    const idx = levelPos[lv]++;
    const xSpacing = 600 / (count + 1);
    positions[i] = {
      x: xSpacing * (idx + 1),
      y: 60 + lv * 90,
    };
  }
  return positions;
}

export function generateSteps(input) {
  const recorder = new StepRecorder();
  const numNodes = input[0];
  const adj = Array.from({ length: numNodes }, () => []);

  for (let i = 1; i < input.length; i += 2) {
    const u = input[i], v = input[i + 1];
    adj[u].push(v);
    adj[v].push(u);
  }

  const root = 0;
  const positions = arrangeInTree(numNodes, adj, root);
  const parent = new Array(numNodes).fill(-1);
  const depth = new Array(numNodes).fill(0);
  const visitedDFS = new Array(numNodes).fill(false);
  const edgeList = [];

  for (let i = 1; i < input.length; i += 2) {
    edgeList.push({ from: input[i], to: input[i + 1] });
  }

  function makeSnapshot(nodeStates, edgeStates) {
    return {
      nodes: Array.from({ length: numNodes }, (_, i) => ({
        id: i,
        x: positions[i].x,
        y: positions[i].y,
        label: String(i),
        state: nodeStates[i] || 'default',
      })),
      edges: edgeList.map((e, idx) => ({
        from: e.from,
        to: e.to,
        state: edgeStates[idx] || 'default',
        directed: false,
        label: '',
      })),
    };
  }

  const nodeStates = new Array(numNodes).fill('default');
  const edgeStates = new Array(edgeList.length).fill('default');

  recorder.add('message', [], -1, 'Starting LCA using Binary Lifting', makeSnapshot(nodeStates, edgeStates));

  // Step 1: DFS from root
  recorder.add('message', [], 0, 'Step 1: DFS from root to compute depths and parents', makeSnapshot(nodeStates, edgeStates));

  const stack = [root];
  visitedDFS[root] = true;

  while (stack.length > 0) {
    const node = stack.pop();
    nodeStates[node] = 'visited';
    recorder.add('visit', [node], 1, `Visit node ${node}: depth=${depth[node]}, parent=${parent[node] === -1 ? 'root' : parent[node]}`, makeSnapshot(nodeStates, edgeStates));

    for (const child of adj[node]) {
      if (!visitedDFS[child]) {
        visitedDFS[child] = true;
        parent[child] = node;
        depth[child] = depth[node] + 1;
        const eIdx = edgeList.findIndex(e =>
          (e.from === node && e.to === child) || (e.from === child && e.to === node)
        );
        if (eIdx !== -1) edgeStates[eIdx] = 'visited';
        stack.push(child);
      }
    }
  }

  // Step 2: Build binary lifting table
  const LOG = Math.ceil(Math.log2(numNodes + 1)) + 1;
  const up = Array.from({ length: numNodes }, () => new Array(LOG).fill(-1));

  recorder.add('message', [], 2, 'Step 2: Build binary lifting table', makeSnapshot(nodeStates, edgeStates));

  for (let v = 0; v < numNodes; v++) {
    up[v][0] = parent[v];
  }

  for (let j = 1; j < LOG; j++) {
    for (let v = 0; v < numNodes; v++) {
      if (up[v][j - 1] !== -1) {
        up[v][j] = up[up[v][j - 1]][j - 1];
      }
    }
  }

  recorder.add('compute', [], 2, `Binary lifting table built with ${LOG} levels`, makeSnapshot(nodeStates, edgeStates));

  // Step 3: Find LCA of nodes 4 and 5
  let u = 4, v = 5;
  recorder.add('message', [], 3, `Query: Find LCA of node ${u} and node ${v}`, makeSnapshot(nodeStates, edgeStates));

  // Reset states
  for (let i = 0; i < numNodes; i++) nodeStates[i] = 'default';
  for (let i = 0; i < edgeStates.length; i++) edgeStates[i] = 'default';

  nodeStates[u] = 'current';
  nodeStates[v] = 'current';
  recorder.add('highlight', [u, v], 3, `Start: node ${u} (depth ${depth[u]}) and node ${v} (depth ${depth[v]})`, makeSnapshot(nodeStates, edgeStates));

  // Ensure u is deeper
  if (depth[u] < depth[v]) {
    const tmp = u;
    u = v;
    v = tmp;
  }

  // Step 4: Equalize depths
  let diff = depth[u] - depth[v];
  if (diff > 0) {
    recorder.add('message', [], 4, `Equalize depths: need to lift node ${u} by ${diff} levels`, makeSnapshot(nodeStates, edgeStates));

    for (let j = LOG - 1; j >= 0; j--) {
      if (diff >= (1 << j) && up[u][j] !== -1) {
        const prev = u;
        nodeStates[prev] = 'visited';
        u = up[u][j];
        nodeStates[u] = 'current';
        diff -= (1 << j);

        const eIdx = edgeList.findIndex(e =>
          (e.from === prev && e.to === u) || (e.from === u && e.to === prev)
        );
        if (eIdx !== -1) edgeStates[eIdx] = 'highlighted';

        recorder.add('visit', [u], 4, `Lift node: jump 2^${j}=${1 << j} levels up to node ${u} (depth ${depth[u]})`, makeSnapshot(nodeStates, edgeStates));
      }
    }
  }

  recorder.add('highlight', [u, v], 4, `Both nodes now at depth ${depth[u]}: node ${u} and node ${v}`, makeSnapshot(nodeStates, edgeStates));

  // Step 5: Jump both up until they meet
  if (u === v) {
    nodeStates[u] = 'found';
    recorder.add('found', [u], 5, `Nodes are the same! LCA is node ${u}`, makeSnapshot(nodeStates, edgeStates));
  } else {
    recorder.add('message', [], 6, 'Nodes differ, jump both up simultaneously', makeSnapshot(nodeStates, edgeStates));

    for (let j = LOG - 1; j >= 0; j--) {
      if (up[u][j] !== -1 && up[u][j] !== up[v][j]) {
        const prevU = u, prevV = v;
        nodeStates[prevU] = 'visited';
        nodeStates[prevV] = 'visited';
        u = up[u][j];
        v = up[v][j];
        nodeStates[u] = 'current';
        nodeStates[v] = 'current';

        recorder.add('visit', [u, v], 7, `up[${prevU}][${j}]=${u} != up[${prevV}][${j}]=${v}, jump both up 2^${j} levels`, makeSnapshot(nodeStates, edgeStates));
      }
    }

    // LCA is parent of u (or v)
    nodeStates[u] = 'visited';
    nodeStates[v] = 'visited';
    const lca = parent[u];
    nodeStates[lca] = 'found';

    // Highlight edges from u and v to LCA
    for (const node of [u, v]) {
      const eIdx = edgeList.findIndex(e =>
        (e.from === node && e.to === lca) || (e.from === lca && e.to === node)
      );
      if (eIdx !== -1) edgeStates[eIdx] = 'highlighted';
    }

    recorder.add('found', [lca], 8, `LCA of the two query nodes is node ${lca}`, makeSnapshot(nodeStates, edgeStates));
  }

  recorder.add('message', [], -1, 'LCA query complete!', makeSnapshot(nodeStates, edgeStates));
  return recorder.getSteps();
}
