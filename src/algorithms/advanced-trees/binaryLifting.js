import StepRecorder from '../../engine/StepRecorder';

export const meta = {
  name: 'Binary Lifting',
  slug: 'binary-lifting',
  category: 'advanced-trees',
  timeComplexity: { best: 'O(n log n)', average: 'O(n log n)', worst: 'O(n log n)' },
  spaceComplexity: 'O(n log n)',
  description:
    'Binary Lifting preprocesses a rooted tree to answer k-th ancestor queries in O(log n) time. It builds a sparse table where up[v][j] stores the 2^j-th ancestor of node v. Queries decompose k into powers of two and jump upward accordingly.',
  rendererType: 'graph',
  pseudocode: [
    'function preprocess(root):',
    '  DFS to compute depths and parents',
    '  up[v][0] = parent[v] for all v',
    '  for j = 1 to LOG:',
    '    up[v][j] = up[up[v][j-1]][j-1]',
    'function kthAncestor(v, k):',
    '  for each set bit j in k:',
    '    v = up[v][j]',
    '  return v',
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
  const order = [];

  // BFS to get levels
  const queue = [root];
  visited[root] = true;
  while (queue.length > 0) {
    const node = queue.shift();
    order.push(node);
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
  const visited = new Array(numNodes).fill(false);
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

  recorder.add('message', [], -1, 'Starting Binary Lifting: preprocess tree for ancestor queries', makeSnapshot(nodeStates, edgeStates));

  // Step 1: DFS to find parents and depths
  recorder.add('message', [], 0, 'Step 1: DFS from root (node 0) to compute parents and depths', makeSnapshot(nodeStates, edgeStates));

  const stack = [root];
  visited[root] = true;
  const dfsOrder = [];

  while (stack.length > 0) {
    const node = stack.pop();
    dfsOrder.push(node);
    nodeStates[node] = 'visited';

    recorder.add('visit', [node], 1, `Visit node ${node}: depth=${depth[node]}, parent=${parent[node] === -1 ? 'none' : parent[node]}`, makeSnapshot(nodeStates, edgeStates));

    for (const child of adj[node]) {
      if (!visited[child]) {
        visited[child] = true;
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

  // Step 2: Build the binary lifting table
  const LOG = Math.ceil(Math.log2(numNodes + 1)) + 1;
  const up = Array.from({ length: numNodes }, () => new Array(LOG).fill(-1));

  // Fill base case: up[v][0] = parent[v]
  recorder.add('message', [], 2, 'Step 2: Initialize up[v][0] = parent[v] for all nodes', makeSnapshot(nodeStates, edgeStates));

  for (let v = 0; v < numNodes; v++) {
    up[v][0] = parent[v];
    nodeStates[v] = 'current';
    recorder.add('compute', [v], 2, `up[${v}][0] = parent[${v}] = ${parent[v] === -1 ? 'none' : parent[v]}`, makeSnapshot(nodeStates, edgeStates));
    nodeStates[v] = 'visited';
  }

  // Fill higher powers
  recorder.add('message', [], 3, 'Step 3: Fill table for higher powers of 2', makeSnapshot(nodeStates, edgeStates));

  for (let j = 1; j < LOG; j++) {
    recorder.add('message', [], 4, `Computing 2^${j} = ${Math.pow(2, j)}-th ancestors for all nodes`, makeSnapshot(nodeStates, edgeStates));
    for (let v = 0; v < numNodes; v++) {
      if (up[v][j - 1] !== -1) {
        up[v][j] = up[up[v][j - 1]][j - 1];
      }
      nodeStates[v] = 'current';
      const ancestorLabel = up[v][j] === -1 ? 'none' : up[v][j];
      recorder.add('compute', [v], 4, `up[${v}][${j}] = up[up[${v}][${j - 1}]][${j - 1}] = ${ancestorLabel}`, makeSnapshot(nodeStates, edgeStates));
      nodeStates[v] = 'visited';
    }
  }

  // Step 3: Answer a query - find 2nd ancestor of node 5
  const queryNode = 5;
  const queryK = 2;
  recorder.add('message', [], 5, `Query: Find the ${queryK}nd ancestor of node ${queryNode}`, makeSnapshot(nodeStates, edgeStates));

  // Reset states for query visualization
  for (let i = 0; i < numNodes; i++) nodeStates[i] = 'default';
  for (let i = 0; i < edgeStates.length; i++) edgeStates[i] = 'default';

  let current = queryNode;
  let k = queryK;
  nodeStates[current] = 'current';
  recorder.add('highlight', [current], 6, `Start at node ${current}, need to go up ${k} levels`, makeSnapshot(nodeStates, edgeStates));

  for (let j = 0; j < LOG && k > 0; j++) {
    if (k & (1 << j)) {
      const prev = current;
      nodeStates[prev] = 'visited';
      current = up[current][j];
      if (current === -1) {
        recorder.add('message', [], 7, `Bit ${j} set in k=${queryK}: jump 2^${j}=${1 << j} levels up. No ancestor exists.`, makeSnapshot(nodeStates, edgeStates));
        break;
      }
      nodeStates[current] = 'current';
      const eIdx = edgeList.findIndex(e =>
        (e.from === prev && e.to === current) || (e.from === current && e.to === prev)
      );
      if (eIdx !== -1) edgeStates[eIdx] = 'highlighted';
      recorder.add('visit', [current], 7, `Bit ${j} set in k=${queryK}: jump 2^${j}=${1 << j} levels up to node ${current}`, makeSnapshot(nodeStates, edgeStates));
      k ^= (1 << j);
    }
  }

  if (current !== -1) {
    nodeStates[current] = 'found';
    recorder.add('found', [current], 8, `The ${queryK}nd ancestor of node ${queryNode} is node ${current}`, makeSnapshot(nodeStates, edgeStates));
  }

  recorder.add('message', [], -1, 'Binary Lifting complete!', makeSnapshot(nodeStates, edgeStates));
  return recorder.getSteps();
}
