import StepRecorder from '../../engine/StepRecorder';

export const meta = {
  name: 'Heavy-Light Decomposition',
  slug: 'heavy-light-decomposition',
  category: 'advanced-trees',
  timeComplexity: { best: 'O(n)', average: 'O(n)', worst: 'O(n)' },
  spaceComplexity: 'O(n)',
  description:
    'Heavy-Light Decomposition (HLD) splits a tree into chains of heavy edges so that any root-to-leaf path crosses at most O(log n) chains. A heavy edge connects a node to its child with the largest subtree. This enables efficient path queries using segment trees.',
  rendererType: 'graph',
  pseudocode: [
    'function computeSizes(node, parent):',
    '  size[node] = 1',
    '  for each child of node:',
    '    computeSizes(child, node)',
    '    size[node] += size[child]',
    'function decompose(node, parent, chainHead):',
    '  head[node] = chainHead',
    '  heavyChild = child with max size',
    '  decompose(heavyChild, node, chainHead)',
    '  for each light child:',
    '    decompose(lightChild, node, lightChild)',
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

  for (let i = 0; i < numNodes; i++) adj[i].sort((a, b) => a - b);

  const root = 0;
  const positions = arrangeInTree(numNodes, adj, root);
  const edgeList = [];

  for (let i = 1; i < input.length; i += 2) {
    edgeList.push({ from: input[i], to: input[i + 1] });
  }

  const parentArr = new Array(numNodes).fill(-1);
  const subtreeSize = new Array(numNodes).fill(0);
  const head = new Array(numNodes).fill(-1);
  const chainId = new Array(numNodes).fill(-1);

  function makeSnapshot(nodeStates, edgeStates, nodeLabels) {
    return {
      nodes: Array.from({ length: numNodes }, (_, i) => ({
        id: i,
        x: positions[i].x,
        y: positions[i].y,
        label: nodeLabels ? nodeLabels[i] : String(i),
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
  const nodeLabels = Array.from({ length: numNodes }, (_, i) => String(i));

  recorder.add('message', [], -1, 'Starting Heavy-Light Decomposition', makeSnapshot(nodeStates, edgeStates, nodeLabels));

  // Phase 1: Compute subtree sizes via DFS
  recorder.add('message', [], 0, 'Phase 1: Compute subtree sizes using DFS', makeSnapshot(nodeStates, edgeStates, nodeLabels));

  function computeSizes(node, par) {
    parentArr[node] = par;
    subtreeSize[node] = 1;
    nodeStates[node] = 'current';
    recorder.add('visit', [node], 1, `Enter node ${node}`, makeSnapshot(nodeStates, edgeStates, nodeLabels));

    for (const child of adj[node]) {
      if (child !== par) {
        computeSizes(child, node);
        subtreeSize[node] += subtreeSize[child];
      }
    }

    nodeLabels[node] = `${node} (sz:${subtreeSize[node]})`;
    nodeStates[node] = 'visited';
    recorder.add('compute', [node], 3, `size[${node}] = ${subtreeSize[node]}`, makeSnapshot(nodeStates, edgeStates, nodeLabels));
  }

  computeSizes(root, -1);

  // Phase 2: Identify heavy edges
  recorder.add('message', [], 5, 'Phase 2: Identify heavy edges (edge to child with largest subtree)', makeSnapshot(nodeStates, edgeStates, nodeLabels));

  for (let i = 0; i < numNodes; i++) nodeStates[i] = 'default';

  const heavyChild = new Array(numNodes).fill(-1);
  for (let node = 0; node < numNodes; node++) {
    let maxSize = 0;
    let best = -1;
    for (const child of adj[node]) {
      if (child !== parentArr[node] && subtreeSize[child] > maxSize) {
        maxSize = subtreeSize[child];
        best = child;
      }
    }
    heavyChild[node] = best;
  }

  // Mark heavy edges
  for (let node = 0; node < numNodes; node++) {
    if (heavyChild[node] !== -1) {
      const child = heavyChild[node];
      const eIdx = edgeList.findIndex(e =>
        (e.from === node && e.to === child) || (e.from === child && e.to === node)
      );
      if (eIdx !== -1) {
        edgeStates[eIdx] = 'highlighted';
      }
      recorder.add('highlight', [node, child], 7, `Heavy edge: ${node} -> ${child} (subtree size ${subtreeSize[child]})`, makeSnapshot(nodeStates, edgeStates, nodeLabels));
    }
  }

  // Show light edges
  for (let node = 0; node < numNodes; node++) {
    for (const child of adj[node]) {
      if (child !== parentArr[node] && child !== heavyChild[node]) {
        const eIdx = edgeList.findIndex(e =>
          (e.from === node && e.to === child) || (e.from === child && e.to === node)
        );
        if (eIdx !== -1 && edgeStates[eIdx] !== 'highlighted') {
          edgeStates[eIdx] = 'default';
        }
        recorder.add('message', [node, child], 9, `Light edge: ${node} -> ${child} (subtree size ${subtreeSize[child]})`, makeSnapshot(nodeStates, edgeStates, nodeLabels));
      }
    }
  }

  // Phase 3: Form chains
  recorder.add('message', [], 5, 'Phase 3: Decompose into heavy chains', makeSnapshot(nodeStates, edgeStates, nodeLabels));

  let currentChain = 0;

  function decompose(node, par, chainHead) {
    head[node] = chainHead;
    chainId[node] = currentChain;
    nodeStates[node] = 'current';
    nodeLabels[node] = `${node} (ch:${currentChain})`;
    recorder.add('visit', [node], 6, `Node ${node} belongs to chain headed by node ${chainHead} (chain ${currentChain})`, makeSnapshot(nodeStates, edgeStates, nodeLabels));
    nodeStates[node] = 'sorted';

    // First follow heavy child (same chain)
    if (heavyChild[node] !== -1) {
      decompose(heavyChild[node], node, chainHead);
    }

    // Then light children (start new chains)
    for (const child of adj[node]) {
      if (child !== par && child !== heavyChild[node]) {
        currentChain++;
        decompose(child, node, child);
      }
    }
  }

  decompose(root, -1, root);

  // Summary
  recorder.add('message', [], -1, 'Heavy-Light Decomposition complete!', makeSnapshot(nodeStates, edgeStates, nodeLabels));

  const chains = {};
  for (let i = 0; i < numNodes; i++) {
    if (!chains[chainId[i]]) chains[chainId[i]] = [];
    chains[chainId[i]].push(i);
  }

  for (const [cid, nodes] of Object.entries(chains)) {
    recorder.add('message', [], -1, `Chain ${cid}: [${nodes.join(' -> ')}], head = node ${head[nodes[0]]}`, makeSnapshot(nodeStates, edgeStates, nodeLabels));
  }

  recorder.add('message', [], -1, 'Any root-to-leaf path crosses at most O(log n) light edges, enabling efficient path queries.', makeSnapshot(nodeStates, edgeStates, nodeLabels));

  return recorder.getSteps();
}
