import StepRecorder from '../../engine/StepRecorder';

export const meta = {
  name: 'Euler Tour',
  slug: 'euler-tour',
  category: 'advanced-trees',
  timeComplexity: { best: 'O(n)', average: 'O(n)', worst: 'O(n)' },
  spaceComplexity: 'O(n)',
  description:
    'Euler Tour flattens a tree into an array by performing a DFS and recording entry (tin) and exit (tout) times for each node. This linearization enables range queries on subtrees using segment trees or other array-based data structures.',
  rendererType: 'graph',
  pseudocode: [
    'timer = 0',
    'function eulerTour(node, parent):',
    '  tin[node] = timer++',
    '  for each child of node:',
    '    if child != parent:',
    '      eulerTour(child, node)',
    '  tout[node] = timer++',
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

  // Sort adjacency lists for consistent DFS order
  for (let i = 0; i < numNodes; i++) adj[i].sort((a, b) => a - b);

  const root = 0;
  const positions = arrangeInTree(numNodes, adj, root);
  const edgeList = [];

  for (let i = 1; i < input.length; i += 2) {
    edgeList.push({ from: input[i], to: input[i + 1] });
  }

  function makeSnapshot(nodeStates, edgeStates, nodeLabels) {
    return {
      nodes: Array.from({ length: numNodes }, (_, i) => ({
        id: i,
        x: positions[i].x,
        y: positions[i].y,
        label: nodeLabels[i] || String(i),
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

  const tin = new Array(numNodes).fill(-1);
  const tout = new Array(numNodes).fill(-1);
  let timer = 0;

  recorder.add('message', [], -1, 'Starting Euler Tour: DFS to record entry and exit times', makeSnapshot(nodeStates, edgeStates, nodeLabels));
  recorder.add('message', [], 0, 'Initialize timer = 0', makeSnapshot(nodeStates, edgeStates, nodeLabels));

  function dfs(node, par) {
    tin[node] = timer;
    nodeStates[node] = 'current';
    nodeLabels[node] = `${node} [in:${timer}]`;
    recorder.add('visit', [node], 2, `Enter node ${node}: tin[${node}] = ${timer}`, makeSnapshot(nodeStates, edgeStates, nodeLabels));
    timer++;

    for (const child of adj[node]) {
      if (child !== par) {
        const eIdx = edgeList.findIndex(e =>
          (e.from === node && e.to === child) || (e.from === child && e.to === node)
        );
        if (eIdx !== -1) edgeStates[eIdx] = 'highlighted';

        recorder.add('visit', [child], 4, `Recurse into child ${child} of node ${node}`, makeSnapshot(nodeStates, edgeStates, nodeLabels));
        dfs(child, node);

        if (eIdx !== -1) edgeStates[eIdx] = 'visited';
      }
    }

    tout[node] = timer;
    nodeLabels[node] = `${node} [${tin[node]},${timer}]`;
    nodeStates[node] = 'visited';
    recorder.add('compute', [node], 6, `Exit node ${node}: tout[${node}] = ${timer}`, makeSnapshot(nodeStates, edgeStates, nodeLabels));
    timer++;
  }

  dfs(root, -1);

  // Summary
  recorder.add('message', [], -1, 'Euler Tour complete! Each node has [tin, tout] intervals.', makeSnapshot(nodeStates, edgeStates, nodeLabels));

  let summary = 'Entry/Exit times: ';
  for (let i = 0; i < numNodes; i++) {
    summary += `node ${i}=[${tin[i]},${tout[i]}] `;
  }
  recorder.add('message', [], -1, summary.trim(), makeSnapshot(nodeStates, edgeStates, nodeLabels));

  // Show subtree property
  recorder.add('message', [], -1, 'Key property: node j is in subtree of node i iff tin[i] <= tin[j] and tout[j] <= tout[i]', makeSnapshot(nodeStates, edgeStates, nodeLabels));

  return recorder.getSteps();
}
