import StepRecorder from '../../engine/StepRecorder';

export const meta = {
  name: 'DSU on Tree (Small-to-Large Merging)',
  slug: 'dsu-on-tree',
  category: 'advanced-trees',
  timeComplexity: { best: 'O(n log n)', average: 'O(n log n)', worst: 'O(n log n)' },
  spaceComplexity: 'O(n)',
  description:
    'DSU on Tree (also called small-to-large merging or Euler tour trick with merging) efficiently answers subtree queries by keeping the heavy child\'s data set and merging light children\'s sets into it. Each element is moved at most O(log n) times, yielding O(n log n) total complexity.',
  rendererType: 'graph',
  pseudocode: [
    'function dfs(node, parent):',
    '  for each light child:',
    '    dfs(lightChild, node)',
    '    clear lightChild data',
    '  dfs(heavyChild, node)  // keep its data',
    '  add node to current set',
    '  for each light child:',
    '    merge lightChild subtree into set',
    '  answer query for node',
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
  const heavyChild = new Array(numNodes).fill(-1);

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

  recorder.add('message', [], -1, 'Starting DSU on Tree (Small-to-Large Merging)', makeSnapshot(nodeStates, edgeStates, nodeLabels));

  // Step 1: Compute subtree sizes and identify heavy children
  recorder.add('message', [], 0, 'Step 1: Compute subtree sizes and identify heavy children', makeSnapshot(nodeStates, edgeStates, nodeLabels));

  function computeSizes(node, par) {
    parentArr[node] = par;
    subtreeSize[node] = 1;
    let maxChildSize = 0;

    for (const child of adj[node]) {
      if (child !== par) {
        computeSizes(child, node);
        subtreeSize[node] += subtreeSize[child];
        if (subtreeSize[child] > maxChildSize) {
          maxChildSize = subtreeSize[child];
          heavyChild[node] = child;
        }
      }
    }

    nodeLabels[node] = `${node} (sz:${subtreeSize[node]})`;
    nodeStates[node] = 'visited';
    recorder.add('compute', [node], 0, `Node ${node}: size=${subtreeSize[node]}, heavy child=${heavyChild[node] === -1 ? 'none (leaf)' : heavyChild[node]}`, makeSnapshot(nodeStates, edgeStates, nodeLabels));
  }

  computeSizes(root, -1);

  // Mark heavy edges
  for (let i = 0; i < numNodes; i++) {
    if (heavyChild[i] !== -1) {
      const eIdx = edgeList.findIndex(e =>
        (e.from === i && e.to === heavyChild[i]) || (e.from === heavyChild[i] && e.to === i)
      );
      if (eIdx !== -1) edgeStates[eIdx] = 'highlighted';
    }
  }

  recorder.add('message', [], -1, 'Heavy edges highlighted. Heavy child keeps its data; light children merge into it.', makeSnapshot(nodeStates, edgeStates, nodeLabels));

  // Step 2: DSU on Tree - small-to-large merging
  recorder.add('message', [], 0, 'Step 2: Perform DSU on Tree using small-to-large merging', makeSnapshot(nodeStates, edgeStates, nodeLabels));

  // Reset states
  for (let i = 0; i < numNodes; i++) nodeStates[i] = 'default';

  // We simulate tracking distinct node IDs in each subtree
  const nodeSet = new Array(numNodes).fill(null).map(() => new Set());

  function getSubtreeNodes(node, par) {
    const result = [node];
    for (const child of adj[node]) {
      if (child !== par) {
        result.push(...getSubtreeNodes(child, node));
      }
    }
    return result;
  }

  function dsuDfs(node, par, keep) {
    const children = adj[node].filter(c => c !== par);
    const lightChildren = children.filter(c => c !== heavyChild[node]);

    // Process light children first (their data will be cleared)
    for (const child of lightChildren) {
      dsuDfs(child, node, false);
    }

    // Process heavy child (keep its data)
    if (heavyChild[node] !== -1) {
      dsuDfs(heavyChild[node], node, true);
      // Inherit heavy child's set
      nodeSet[node] = nodeSet[heavyChild[node]];
    }

    // Add current node to set
    nodeSet[node].add(node);
    nodeStates[node] = 'current';
    recorder.add('insert', [node], 4, `Add node ${node} to its set: {${[...nodeSet[node]].sort().join(', ')}}`, makeSnapshot(nodeStates, edgeStates, nodeLabels));

    // Merge light children's subtrees into current set
    for (const child of lightChildren) {
      const lightNodes = getSubtreeNodes(child, node);
      recorder.add('merge', [child], 6, `Merge light child ${child}'s subtree [${lightNodes.join(', ')}] into node ${node}'s set`, makeSnapshot(nodeStates, edgeStates, nodeLabels));

      for (const ln of lightNodes) {
        nodeSet[node].add(ln);
        nodeStates[ln] = 'visited';
      }

      recorder.add('compute', [node], 6, `Node ${node}'s set after merge: {${[...nodeSet[node]].sort().join(', ')}}`, makeSnapshot(nodeStates, edgeStates, nodeLabels));
    }

    // Answer query for this node
    nodeLabels[node] = `${node} (cnt:${nodeSet[node].size})`;
    nodeStates[node] = 'sorted';
    recorder.add('compute', [node], 7, `Answer for node ${node}: subtree has ${nodeSet[node].size} distinct nodes`, makeSnapshot(nodeStates, edgeStates, nodeLabels));

    // If not keeping, clear
    if (!keep) {
      recorder.add('delete', [node], 2, `Light subtree rooted at ${node}: clear data (will re-merge later)`, makeSnapshot(nodeStates, edgeStates, nodeLabels));
      // Reset visual states for this subtree
      const subtreeNodes = getSubtreeNodes(node, par);
      for (const sn of subtreeNodes) {
        nodeStates[sn] = 'default';
      }
      nodeSet[node] = new Set();
    }
  }

  dsuDfs(root, -1, true);

  recorder.add('message', [], -1, 'DSU on Tree complete! Each node\'s subtree query answered efficiently.', makeSnapshot(nodeStates, edgeStates, nodeLabels));
  recorder.add('message', [], -1, 'Key insight: each element is merged at most O(log n) times since it always joins a set at least twice its size.', makeSnapshot(nodeStates, edgeStates, nodeLabels));

  return recorder.getSteps();
}
