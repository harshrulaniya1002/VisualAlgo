import StepRecorder from '../../engine/StepRecorder';

export const meta = {
  name: 'Tree Diameter & Center',
  slug: 'tree-diameter-center',
  category: 'advanced-trees',
  timeComplexity: { best: 'O(n)', average: 'O(n)', worst: 'O(n)' },
  spaceComplexity: 'O(n)',
  description:
    'Finds the diameter (longest path) and center of an unweighted tree using two BFS passes. First BFS from any node finds a farthest endpoint. Second BFS from that endpoint finds the other endpoint and the diameter. The center is the middle node(s) of the diameter path.',
  rendererType: 'graph',
  pseudocode: [
    'function findDiameterAndCenter():',
    '  BFS from node 0, find farthest node u',
    '  BFS from u, find farthest node v',
    '  diameter = dist(u, v)',
    '  Trace path from u to v',
    '  center = middle node(s) of path',
  ],
  inputSchema: {
    type: 'array',
    constraints: { minLength: 3, maxLength: 30, minValue: 0, maxValue: 99 },
  },
};

export const defaultInput = [7, 0, 1, 1, 2, 2, 3, 1, 4, 4, 5, 5, 6];

function arrangeInLine(n, adj) {
  // Use BFS-based layout for chain-like trees
  const positions = [];
  const visited = new Array(n).fill(false);
  const levels = new Array(n).fill(0);

  const queue = [0];
  visited[0] = true;
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
      y: 60 + lv * 80,
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

  const positions = arrangeInLine(numNodes, adj);
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

  recorder.add('message', [], -1, 'Finding Tree Diameter and Center using two BFS passes', makeSnapshot(nodeStates, edgeStates, nodeLabels));

  // BFS helper
  function bfs(start) {
    const dist = new Array(numNodes).fill(-1);
    const parent = new Array(numNodes).fill(-1);
    const queue = [start];
    dist[start] = 0;

    while (queue.length > 0) {
      const node = queue.shift();
      for (const neighbor of adj[node]) {
        if (dist[neighbor] === -1) {
          dist[neighbor] = dist[node] + 1;
          parent[neighbor] = node;
          queue.push(neighbor);
        }
      }
    }
    return { dist, parent };
  }

  // BFS 1: From node 0
  recorder.add('message', [], 1, 'BFS 1: Start from node 0 to find a farthest node', makeSnapshot(nodeStates, edgeStates, nodeLabels));

  const bfs1 = bfs(0);
  const dist1 = bfs1.dist;

  // Animate BFS 1
  nodeStates[0] = 'current';
  recorder.add('visit', [0], 1, 'Start BFS from node 0', makeSnapshot(nodeStates, edgeStates, nodeLabels));

  // Show distances
  for (let i = 0; i < numNodes; i++) {
    nodeLabels[i] = `${i} (d:${dist1[i]})`;
    nodeStates[i] = 'visited';
  }
  recorder.add('compute', [], 1, `BFS 1 complete. Distances: [${dist1.join(', ')}]`, makeSnapshot(nodeStates, edgeStates, nodeLabels));

  // Find farthest node u
  let u = 0;
  for (let i = 1; i < numNodes; i++) {
    if (dist1[i] > dist1[u]) u = i;
  }

  nodeStates[u] = 'found';
  recorder.add('found', [u], 1, `Farthest node from 0 is node ${u} (distance ${dist1[u]})`, makeSnapshot(nodeStates, edgeStates, nodeLabels));

  // Reset for BFS 2
  for (let i = 0; i < numNodes; i++) {
    nodeStates[i] = 'default';
    nodeLabels[i] = String(i);
  }
  for (let i = 0; i < edgeStates.length; i++) edgeStates[i] = 'default';

  // BFS 2: From node u
  recorder.add('message', [], 2, `BFS 2: Start from node ${u} to find the other diameter endpoint`, makeSnapshot(nodeStates, edgeStates, nodeLabels));

  const bfs2 = bfs(u);
  const dist2 = bfs2.dist;
  const parent2 = bfs2.parent;

  nodeStates[u] = 'current';
  recorder.add('visit', [u], 2, `Start BFS from node ${u}`, makeSnapshot(nodeStates, edgeStates, nodeLabels));

  for (let i = 0; i < numNodes; i++) {
    nodeLabels[i] = `${i} (d:${dist2[i]})`;
    nodeStates[i] = 'visited';
  }
  nodeStates[u] = 'current';
  recorder.add('compute', [], 2, `BFS 2 complete. Distances from ${u}: [${dist2.join(', ')}]`, makeSnapshot(nodeStates, edgeStates, nodeLabels));

  // Find farthest node v
  let v = 0;
  for (let i = 1; i < numNodes; i++) {
    if (dist2[i] > dist2[v]) v = i;
  }

  const diameter = dist2[v];
  nodeStates[v] = 'found';
  recorder.add('found', [v], 3, `Farthest node from ${u} is node ${v} (distance ${diameter}). Diameter = ${diameter}`, makeSnapshot(nodeStates, edgeStates, nodeLabels));

  // Trace the diameter path
  recorder.add('message', [], 4, `Tracing the diameter path from node ${u} to node ${v}`, makeSnapshot(nodeStates, edgeStates, nodeLabels));

  const path = [];
  let cur = v;
  while (cur !== -1) {
    path.push(cur);
    cur = parent2[cur];
  }
  path.reverse();

  // Reset and highlight path
  for (let i = 0; i < numNodes; i++) nodeStates[i] = 'default';
  for (let i = 0; i < edgeStates.length; i++) edgeStates[i] = 'default';

  for (let i = 0; i < path.length; i++) {
    nodeStates[path[i]] = 'current';
    nodeLabels[path[i]] = `${path[i]} (pos:${i})`;
    if (i > 0) {
      const eIdx = edgeList.findIndex(e =>
        (e.from === path[i - 1] && e.to === path[i]) || (e.from === path[i] && e.to === path[i - 1])
      );
      if (eIdx !== -1) edgeStates[eIdx] = 'highlighted';
    }
    recorder.add('visit', [path[i]], 4, `Diameter path node ${i}: node ${path[i]}`, makeSnapshot(nodeStates, edgeStates, nodeLabels));
  }

  recorder.add('highlight', path, 4, `Diameter path: [${path.join(' -> ')}], length = ${diameter}`, makeSnapshot(nodeStates, edgeStates, nodeLabels));

  // Find center
  recorder.add('message', [], 5, 'Finding the center: middle node(s) of the diameter path', makeSnapshot(nodeStates, edgeStates, nodeLabels));

  const mid = Math.floor(path.length / 2);
  if (path.length % 2 === 1) {
    // Single center
    const center = path[mid];
    for (let i = 0; i < numNodes; i++) nodeStates[i] = nodeStates[i] === 'current' ? 'visited' : nodeStates[i];
    nodeStates[center] = 'found';
    nodeLabels[center] = `${center} (CENTER)`;
    recorder.add('found', [center], 5, `Tree has a single center: node ${center} (at position ${mid} in the diameter path)`, makeSnapshot(nodeStates, edgeStates, nodeLabels));
  } else {
    // Two centers
    const c1 = path[mid - 1], c2 = path[mid];
    for (let i = 0; i < numNodes; i++) nodeStates[i] = nodeStates[i] === 'current' ? 'visited' : nodeStates[i];
    nodeStates[c1] = 'found';
    nodeStates[c2] = 'found';
    nodeLabels[c1] = `${c1} (CENTER)`;
    nodeLabels[c2] = `${c2} (CENTER)`;
    recorder.add('found', [c1, c2], 5, `Tree has two centers: nodes ${c1} and ${c2}`, makeSnapshot(nodeStates, edgeStates, nodeLabels));
  }

  recorder.add('message', [], -1, `Done! Diameter = ${diameter}, path = [${path.join(' -> ')}]`, makeSnapshot(nodeStates, edgeStates, nodeLabels));

  return recorder.getSteps();
}
