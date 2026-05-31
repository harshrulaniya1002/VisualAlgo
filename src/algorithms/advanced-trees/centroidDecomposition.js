import StepRecorder from '../../engine/StepRecorder';

export const meta = {
  name: 'Centroid Decomposition',
  slug: 'centroid-decomposition',
  category: 'advanced-trees',
  timeComplexity: { best: 'O(n log n)', average: 'O(n log n)', worst: 'O(n log n)' },
  spaceComplexity: 'O(n)',
  description:
    'Centroid Decomposition recursively finds the centroid of a tree (a node whose removal leaves no subtree with more than half the nodes), removes it, and recurses on the remaining subtrees. The resulting decomposition tree has O(log n) depth, enabling efficient divide-and-conquer on trees.',
  rendererType: 'graph',
  pseudocode: [
    'function centroidDecompose(tree):',
    '  computeSubtreeSizes(tree)',
    '  centroid = findCentroid(tree)',
    '  mark centroid as removed',
    '  for each subtree after removal:',
    '    centroidDecompose(subtree)',
    'function findCentroid(node, treeSize):',
    '  for each child:',
    '    if size[child] > treeSize / 2: go deeper',
    '  return node',
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

  const removed = new Array(numNodes).fill(false);
  const subtreeSize = new Array(numNodes).fill(0);

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

  recorder.add('message', [], -1, 'Starting Centroid Decomposition', makeSnapshot(nodeStates, edgeStates));

  function computeSize(node, par) {
    subtreeSize[node] = 1;
    for (const child of adj[node]) {
      if (child !== par && !removed[child]) {
        computeSize(child, node);
        subtreeSize[node] += subtreeSize[child];
      }
    }
  }

  function findCentroid(node, par, treeSize) {
    for (const child of adj[node]) {
      if (child !== par && !removed[child] && subtreeSize[child] > treeSize / 2) {
        return findCentroid(child, node, treeSize);
      }
    }
    return node;
  }

  let decompositionLevel = 0;

  function decompose(node, par) {
    // Compute sizes in this component
    computeSize(node, -1);
    const treeSize = subtreeSize[node];

    recorder.add('compute', [], 1, `Computing subtree sizes in component rooted at node ${node} (size: ${treeSize})`, makeSnapshot(nodeStates, edgeStates));

    // Find centroid
    const centroid = findCentroid(node, -1, treeSize);
    nodeStates[centroid] = 'current';
    recorder.add('found', [centroid], 2, `Centroid found: node ${centroid} (removing it splits tree into subtrees each of size <= ${Math.floor(treeSize / 2)})`, makeSnapshot(nodeStates, edgeStates));

    // Mark as removed
    removed[centroid] = true;
    nodeStates[centroid] = 'sorted';
    recorder.add('delete', [centroid], 3, `Remove centroid node ${centroid} from the tree`, makeSnapshot(nodeStates, edgeStates));

    // Dim edges from centroid
    for (const child of adj[centroid]) {
      if (!removed[child]) {
        const eIdx = edgeList.findIndex(e =>
          (e.from === centroid && e.to === child) || (e.from === child && e.to === centroid)
        );
        if (eIdx !== -1) edgeStates[eIdx] = 'visited';
      }
    }

    // Recurse on remaining subtrees
    for (const child of adj[centroid]) {
      if (!removed[child]) {
        recorder.add('message', [], 4, `Recurse into subtree containing node ${child}`, makeSnapshot(nodeStates, edgeStates));
        decompose(child, centroid);
      }
    }
  }

  decompose(root, -1);

  recorder.add('message', [], -1, 'Centroid Decomposition complete! The decomposition tree has depth O(log n).', makeSnapshot(nodeStates, edgeStates));
  recorder.add('message', [], -1, 'Each node was a centroid at some level. This structure enables efficient divide-and-conquer for path queries.', makeSnapshot(nodeStates, edgeStates));

  return recorder.getSteps();
}
