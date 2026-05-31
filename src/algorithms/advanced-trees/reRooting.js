import StepRecorder from '../../engine/StepRecorder';

export const meta = {
  name: 'Re-Rooting Technique',
  slug: 're-rooting',
  category: 'advanced-trees',
  timeComplexity: { best: 'O(n)', average: 'O(n)', worst: 'O(n)' },
  spaceComplexity: 'O(n)',
  description:
    'Re-Rooting computes answers for every node as if it were the root, using two DFS passes. The first DFS computes the answer for one root. The second DFS propagates the answer from parent to children, re-rooting in O(1) per node. Demonstrated here by computing the sum of distances from each node to all others.',
  rendererType: 'graph',
  pseudocode: [
    'function dfs1(node, parent):',
    '  size[node] = 1, dist[node] = 0',
    '  for each child of node:',
    '    dfs1(child, node)',
    '    size[node] += size[child]',
    '    dist[node] += dist[child] + size[child]',
    'function dfs2(node, parent):',
    '  for each child of node:',
    '    ans[child] = ans[node] - size[child] + (n - size[child])',
    '    dfs2(child, node)',
  ],
  inputSchema: {
    type: 'array',
    constraints: { minLength: 3, maxLength: 30, minValue: 0, maxValue: 99 },
  },
};

export const defaultInput = [5, 0, 1, 0, 2, 1, 3, 1, 4];

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
      y: 60 + lv * 100,
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

  const size = new Array(numNodes).fill(0);
  const distDown = new Array(numNodes).fill(0);
  const ans = new Array(numNodes).fill(0);

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

  recorder.add('message', [], -1, 'Re-Rooting: Compute sum of distances from every node to all others', makeSnapshot(nodeStates, edgeStates, nodeLabels));

  // DFS 1: Compute size and downward distances (root = 0)
  recorder.add('message', [], 0, 'Pass 1 (DFS down): Compute subtree sizes and downward distance sums rooted at node 0', makeSnapshot(nodeStates, edgeStates, nodeLabels));

  function dfs1(node, par) {
    size[node] = 1;
    distDown[node] = 0;
    nodeStates[node] = 'current';
    recorder.add('visit', [node], 1, `Enter node ${node}`, makeSnapshot(nodeStates, edgeStates, nodeLabels));

    for (const child of adj[node]) {
      if (child !== par) {
        const eIdx = edgeList.findIndex(e =>
          (e.from === node && e.to === child) || (e.from === child && e.to === node)
        );
        if (eIdx !== -1) edgeStates[eIdx] = 'highlighted';
        dfs1(child, node);
        if (eIdx !== -1) edgeStates[eIdx] = 'visited';

        size[node] += size[child];
        distDown[node] += distDown[child] + size[child];
      }
    }

    nodeLabels[node] = `${node} (sz:${size[node]}, d:${distDown[node]})`;
    nodeStates[node] = 'visited';
    recorder.add('compute', [node], 4, `Node ${node}: size=${size[node]}, distDown=${distDown[node]}`, makeSnapshot(nodeStates, edgeStates, nodeLabels));
  }

  dfs1(root, -1);

  // The answer for root is its downward distance sum
  ans[root] = distDown[root];
  recorder.add('compute', [root], 5, `Answer for root (node 0): sum of distances = ${ans[root]}`, makeSnapshot(nodeStates, edgeStates, nodeLabels));

  // DFS 2: Re-root to compute answers for all nodes
  recorder.add('message', [], 6, 'Pass 2 (DFS re-root): Propagate answers from parent to children', makeSnapshot(nodeStates, edgeStates, nodeLabels));

  for (let i = 0; i < numNodes; i++) {
    nodeStates[i] = 'default';
    edgeStates.fill('default');
  }

  nodeStates[root] = 'sorted';
  nodeLabels[root] = `${root} (ans:${ans[root]})`;

  function dfs2(node, par) {
    for (const child of adj[node]) {
      if (child !== par) {
        nodeStates[child] = 'current';

        // When re-rooting from node to child:
        // Moving root from node to child: child's subtree (size[child] nodes) each get 1 closer,
        // remaining (n - size[child]) nodes each get 1 farther
        ans[child] = ans[node] - size[child] + (numNodes - size[child]);

        const eIdx = edgeList.findIndex(e =>
          (e.from === node && e.to === child) || (e.from === child && e.to === node)
        );
        if (eIdx !== -1) edgeStates[eIdx] = 'highlighted';

        recorder.add('compute', [child], 7, `Re-root to node ${child}: ans[${child}] = ans[${node}](${ans[node]}) - size[${child}](${size[child]}) + (n - size[${child}])(${numNodes - size[child]}) = ${ans[child]}`, makeSnapshot(nodeStates, edgeStates, nodeLabels));

        nodeLabels[child] = `${child} (ans:${ans[child]})`;
        nodeStates[child] = 'sorted';
        if (eIdx !== -1) edgeStates[eIdx] = 'visited';

        dfs2(child, node);
      }
    }
  }

  dfs2(root, -1);

  // Summary
  recorder.add('message', [], -1, 'Re-Rooting complete! Sum of distances from each node:', makeSnapshot(nodeStates, edgeStates, nodeLabels));

  let summary = '';
  for (let i = 0; i < numNodes; i++) {
    summary += `node ${i}: ${ans[i]}  `;
  }
  recorder.add('message', [], -1, summary.trim(), makeSnapshot(nodeStates, edgeStates, nodeLabels));

  return recorder.getSteps();
}
