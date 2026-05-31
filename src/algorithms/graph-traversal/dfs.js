import StepRecorder from '../../engine/StepRecorder';

export const meta = {
  name: 'Depth-First Search (DFS)',
  slug: 'dfs',
  category: 'graph-traversal',
  timeComplexity: { best: 'O(V + E)', average: 'O(V + E)', worst: 'O(V + E)' },
  spaceComplexity: 'O(V)',
  description:
    'DFS explores a graph by going as deep as possible along each branch before backtracking. It uses a stack (or recursion) and is useful for topological sorting, cycle detection, and finding connected components.',
  rendererType: 'graph',
  pseudocode: [
    'mark source as visited',
    'for each neighbor of source:',
    '  if neighbor not visited:',
    '    recursively DFS(neighbor)',
    '  else:',
    '    skip (already visited)',
  ],
  inputSchema: {
    type: 'array',
    constraints: { minLength: 2, maxLength: 20, minValue: 0, maxValue: 99 },
  },
};

export const defaultInput = [6, 0,1, 0,2, 1,3, 2,3, 3,4, 4,5];

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
    edgeList.push({ from: u, to: v, state: 'default', directed: false });
    adj[u].push(v);
    adj[v].push(u);
  }

  const visited = new Array(numNodes).fill(false);
  const edgeStates = edgeList.map(e => ({ ...e }));

  function makeSnapshot(current) {
    return {
      nodes: Array.from({ length: numNodes }, (_, i) => ({
        id: i, x: positions[i].x, y: positions[i].y, label: String(i),
        state: i === current ? 'current' : visited[i] ? 'visited' : 'default',
      })),
      edges: edgeStates.map(e => ({ ...e })),
    };
  }

  recorder.add('message', [], -1, 'Starting DFS from node 0', makeSnapshot(-1));

  function dfs(node) {
    visited[node] = true;
    recorder.add('visit', [node], 0, `Visit node ${node} and mark as visited`, makeSnapshot(node));

    for (const neighbor of adj[node]) {
      const edgeIdx = edgeStates.findIndex(
        e => (e.from === node && e.to === neighbor) || (e.from === neighbor && e.to === node)
      );

      if (!visited[neighbor]) {
        if (edgeIdx !== -1) edgeStates[edgeIdx].state = 'visited';
        recorder.add('visit', [neighbor], 3, `Recurse into unvisited neighbor ${neighbor}`, makeSnapshot(neighbor));
        dfs(neighbor);
        recorder.add('message', [node], 3, `Backtrack to node ${node}`, makeSnapshot(node));
      } else {
        recorder.add('message', [], 5, `Neighbor ${neighbor} already visited, skip`, makeSnapshot(node));
      }
    }
  }

  dfs(0);
  recorder.add('message', [], -1, 'DFS traversal complete. All reachable nodes visited.', makeSnapshot(-1));
  return recorder.getSteps();
}
