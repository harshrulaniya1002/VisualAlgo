import StepRecorder from '../../engine/StepRecorder';

export const meta = {
  name: 'Bipartite Check',
  slug: 'bipartite-check',
  category: 'graph-traversal',
  timeComplexity: { best: 'O(V + E)', average: 'O(V + E)', worst: 'O(V + E)' },
  spaceComplexity: 'O(V)',
  description:
    'Determines if a graph is bipartite by attempting to 2-color it using BFS. A graph is bipartite if its vertices can be divided into two disjoint sets such that no two adjacent vertices share the same set.',
  rendererType: 'graph',
  pseudocode: [
    'color source with color 0',
    'enqueue source',
    'while queue not empty:',
    '  node = dequeue()',
    '  for each neighbor of node:',
    '    if same color -> not bipartite; else color & enqueue',
  ],
  inputSchema: {
    type: 'array',
    constraints: { minLength: 2, maxLength: 20, minValue: 0, maxValue: 99 },
  },
};

// Bipartite graph: 0-1, 0-3, 1-2, 2-3 (cycle of length 4)
export const defaultInput = [6, 0,1, 0,3, 1,2, 2,3, 3,4, 4,5];

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

  const color = new Array(numNodes).fill(-1);
  const edgeStates = edgeList.map(e => ({ ...e }));

  function makeSnapshot(current) {
    return {
      nodes: Array.from({ length: numNodes }, (_, i) => ({
        id: i, x: positions[i].x, y: positions[i].y, label: String(i),
        state: i === current ? 'current' : color[i] === 0 ? 'visited' : color[i] === 1 ? 'in-path' : 'default',
      })),
      edges: edgeStates.map(e => ({ ...e })),
    };
  }

  recorder.add('message', [], -1, 'Checking if the graph is bipartite using BFS 2-coloring', makeSnapshot(-1));

  let isBipartite = true;

  for (let start = 0; start < numNodes && isBipartite; start++) {
    if (color[start] !== -1) continue;

    color[start] = 0;
    const queue = [start];
    recorder.add('visit', [start], 0, `Color node ${start} with color A (blue)`, makeSnapshot(start));

    while (queue.length > 0 && isBipartite) {
      const node = queue.shift();
      recorder.add('visit', [node], 3, `Dequeue node ${node} (color ${color[node] === 0 ? 'A' : 'B'})`, makeSnapshot(node));

      for (const neighbor of adj[node]) {
        const edgeIdx = edgeStates.findIndex(
          e => (e.from === node && e.to === neighbor) || (e.from === neighbor && e.to === node)
        );

        if (color[neighbor] === -1) {
          color[neighbor] = 1 - color[node];
          queue.push(neighbor);
          if (edgeIdx !== -1) edgeStates[edgeIdx].state = 'visited';
          recorder.add('visit', [neighbor], 5, `Color neighbor ${neighbor} with color ${color[neighbor] === 0 ? 'A' : 'B'}`, makeSnapshot(neighbor));
        } else if (color[neighbor] === color[node]) {
          isBipartite = false;
          if (edgeIdx !== -1) edgeStates[edgeIdx].state = 'in-path';
          recorder.add('message', [], 5, `Conflict! Nodes ${node} and ${neighbor} have the same color. Graph is NOT bipartite.`, makeSnapshot(node));
        } else {
          recorder.add('message', [], 5, `Neighbor ${neighbor} already colored differently. OK.`, makeSnapshot(node));
        }
      }
    }
  }

  if (isBipartite) {
    recorder.add('message', [], -1, 'Graph IS bipartite. Successfully 2-colored all nodes.', makeSnapshot(-1));
  } else {
    recorder.add('message', [], -1, 'Graph is NOT bipartite. Found an odd-length cycle.', makeSnapshot(-1));
  }

  return recorder.getSteps();
}
