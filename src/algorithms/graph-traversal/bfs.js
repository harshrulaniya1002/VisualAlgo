import StepRecorder from '../../engine/StepRecorder';

export const meta = {
  name: 'Breadth-First Search (BFS)',
  slug: 'bfs',
  category: 'graph-traversal',
  timeComplexity: { best: 'O(V + E)', average: 'O(V + E)', worst: 'O(V + E)' },
  spaceComplexity: 'O(V)',
  description:
    'BFS explores a graph level by level starting from a source node. It uses a queue to visit all neighbors of the current node before moving deeper. BFS naturally finds shortest paths in unweighted graphs.',
  rendererType: 'graph',
  pseudocode: [
    'enqueue source, mark visited',
    'while queue is not empty:',
    '  node = dequeue()',
    '  for each neighbor of node:',
    '    if neighbor not visited:',
    '      mark visited, enqueue neighbor',
  ],
  inputSchema: {
    type: 'array',
    constraints: { minLength: 2, maxLength: 20, minValue: 0, maxValue: 99 },
  },
};

// Format: [numNodes, from, to, from, to, ...]
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

  // Parse edges
  const edges = [];
  const adj = Array.from({ length: numNodes }, () => []);
  for (let i = 1; i < input.length; i += 2) {
    const u = input[i], v = input[i + 1];
    edges.push({ from: u, to: v, state: 'default', directed: false });
    adj[u].push(v);
    adj[v].push(u);
  }

  function makeNodes(visited, current) {
    return Array.from({ length: numNodes }, (_, i) => ({
      id: i,
      x: positions[i].x,
      y: positions[i].y,
      label: String(i),
      state: i === current ? 'current' : visited[i] ? 'visited' : 'default',
    }));
  }

  function makeSnapshot(visited, current, edgeStates) {
    return {
      nodes: makeNodes(visited, current),
      edges: edgeStates.map(e => ({ ...e })),
    };
  }

  const visited = new Array(numNodes).fill(false);
  const edgeStates = edges.map(e => ({ ...e }));

  // Initial state
  recorder.add('message', [], -1, 'Starting BFS from node 0', makeSnapshot(visited, -1, edgeStates));

  const queue = [0];
  visited[0] = true;
  recorder.add('visit', [0], 0, 'Enqueue node 0 and mark as visited', makeSnapshot(visited, 0, edgeStates));

  while (queue.length > 0) {
    const node = queue.shift();
    recorder.add('visit', [node], 2, `Dequeue node ${node} and explore its neighbors`, makeSnapshot(visited, node, edgeStates));

    for (const neighbor of adj[node]) {
      // Find and highlight the edge
      const edgeIdx = edgeStates.findIndex(
        e => (e.from === node && e.to === neighbor) || (e.from === neighbor && e.to === node)
      );

      if (!visited[neighbor]) {
        visited[neighbor] = true;
        queue.push(neighbor);
        if (edgeIdx !== -1) edgeStates[edgeIdx].state = 'visited';
        recorder.add('visit', [neighbor], 5, `Visit neighbor ${neighbor}, mark visited and enqueue`, makeSnapshot(visited, neighbor, edgeStates));
      } else {
        recorder.add('message', [], 4, `Neighbor ${neighbor} already visited, skip`, makeSnapshot(visited, node, edgeStates));
      }
    }
  }

  recorder.add('message', [], -1, 'BFS traversal complete. All reachable nodes visited.', makeSnapshot(visited, -1, edgeStates));
  return recorder.getSteps();
}
