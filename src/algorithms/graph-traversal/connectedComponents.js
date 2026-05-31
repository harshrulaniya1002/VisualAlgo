import StepRecorder from '../../engine/StepRecorder';

export const meta = {
  name: 'Connected Components',
  slug: 'connected-components',
  category: 'graph-traversal',
  timeComplexity: { best: 'O(V + E)', average: 'O(V + E)', worst: 'O(V + E)' },
  spaceComplexity: 'O(V)',
  description:
    'Finds all connected components in an undirected graph. Each component is a maximal set of vertices where every pair is connected by a path. Uses BFS/DFS from each unvisited node to discover components.',
  rendererType: 'graph',
  pseudocode: [
    'for each node in graph:',
    '  if node not visited:',
    '    start new component',
    '    BFS/DFS from node',
    '    mark all reachable as same component',
    '    component count += 1',
  ],
  inputSchema: {
    type: 'array',
    constraints: { minLength: 2, maxLength: 20, minValue: 0, maxValue: 99 },
  },
};

// Graph with 2 disconnected components: {0,1,2} and {3,4,5}
export const defaultInput = [7, 0,1, 1,2, 0,2, 3,4, 4,5, 6,6];

function arrangeInCircle(n, cx, cy, r) {
  return Array.from({ length: n }, (_, i) => ({
    x: cx + r * Math.cos(2 * Math.PI * i / n - Math.PI / 2),
    y: cy + r * Math.sin(2 * Math.PI * i / n - Math.PI / 2),
  }));
}

const COMPONENT_STATES = ['visited', 'current', 'in-path'];

export function generateSteps(input) {
  const recorder = new StepRecorder();
  const numNodes = input[0];
  const positions = arrangeInCircle(numNodes, 300, 200, 150);

  const edgeList = [];
  const adj = Array.from({ length: numNodes }, () => []);
  for (let i = 1; i < input.length; i += 2) {
    const u = input[i], v = input[i + 1];
    if (u !== v) {
      edgeList.push({ from: u, to: v, state: 'default', directed: false });
      adj[u].push(v);
      adj[v].push(u);
    }
  }

  const visited = new Array(numNodes).fill(false);
  const componentId = new Array(numNodes).fill(-1);
  const edgeStates = edgeList.map(e => ({ ...e }));

  function makeSnapshot(current) {
    return {
      nodes: Array.from({ length: numNodes }, (_, i) => ({
        id: i, x: positions[i].x, y: positions[i].y, label: String(i),
        state: i === current ? 'current' : componentId[i] >= 0 ? COMPONENT_STATES[componentId[i] % 3] : 'default',
      })),
      edges: edgeStates.map(e => ({ ...e })),
    };
  }

  recorder.add('message', [], -1, 'Finding connected components using BFS', makeSnapshot(-1));

  let compCount = 0;

  for (let i = 0; i < numNodes; i++) {
    if (!visited[i]) {
      recorder.add('message', [i], 2, `Node ${i} not visited. Starting component ${compCount + 1}`, makeSnapshot(i));

      // BFS
      const queue = [i];
      visited[i] = true;
      componentId[i] = compCount;

      while (queue.length > 0) {
        const node = queue.shift();
        recorder.add('visit', [node], 3, `Explore node ${node} in component ${compCount + 1}`, makeSnapshot(node));

        for (const neighbor of adj[node]) {
          if (!visited[neighbor]) {
            visited[neighbor] = true;
            componentId[neighbor] = compCount;
            queue.push(neighbor);

            const edgeIdx = edgeStates.findIndex(
              e => (e.from === node && e.to === neighbor) || (e.from === neighbor && e.to === node)
            );
            if (edgeIdx !== -1) edgeStates[edgeIdx].state = 'visited';

            recorder.add('visit', [neighbor], 4, `Add node ${neighbor} to component ${compCount + 1}`, makeSnapshot(neighbor));
          }
        }
      }

      compCount++;
      recorder.add('message', [], 5, `Component ${compCount} complete`, makeSnapshot(-1));
    }
  }

  recorder.add('message', [], -1, `Found ${compCount} connected component(s)`, makeSnapshot(-1));
  return recorder.getSteps();
}
