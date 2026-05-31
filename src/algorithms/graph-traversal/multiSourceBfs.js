import StepRecorder from '../../engine/StepRecorder';

export const meta = {
  name: 'Multi-source BFS (0-1 BFS)',
  slug: 'multi-source-bfs',
  category: 'graph-traversal',
  timeComplexity: { best: 'O(V + E)', average: 'O(V + E)', worst: 'O(V + E)' },
  spaceComplexity: 'O(V)',
  description:
    'BFS starting from multiple source nodes simultaneously. All sources are enqueued at the start, and the algorithm finds the shortest distance from any source to every other node. Useful for problems like finding the nearest facility.',
  rendererType: 'graph',
  pseudocode: [
    'enqueue all source nodes (dist = 0)',
    'while queue not empty:',
    '  node = dequeue()',
    '  for each neighbor of node:',
    '    if dist[neighbor] > dist[node] + 1:',
    '      update dist, enqueue neighbor',
  ],
  inputSchema: {
    type: 'array',
    constraints: { minLength: 2, maxLength: 20, minValue: 0, maxValue: 99 },
  },
};

// Format: [numNodes, numSources, src1, src2, ..., from, to, from, to, ...]
// Graph with 8 nodes, sources at 0 and 5
export const defaultInput = [8, 2, 0, 5, 0,1, 1,2, 2,3, 3,4, 4,5, 5,6, 6,7, 7,0, 1,6];

function arrangeInCircle(n, cx, cy, r) {
  return Array.from({ length: n }, (_, i) => ({
    x: cx + r * Math.cos(2 * Math.PI * i / n - Math.PI / 2),
    y: cy + r * Math.sin(2 * Math.PI * i / n - Math.PI / 2),
  }));
}

export function generateSteps(input) {
  const recorder = new StepRecorder();
  const numNodes = input[0];
  const numSources = input[1];
  const sources = input.slice(2, 2 + numSources);
  const positions = arrangeInCircle(numNodes, 300, 200, 150);

  const edgeList = [];
  const adj = Array.from({ length: numNodes }, () => []);
  for (let i = 2 + numSources; i < input.length; i += 2) {
    const u = input[i], v = input[i + 1];
    edgeList.push({ from: u, to: v, state: 'default', directed: false });
    adj[u].push(v);
    adj[v].push(u);
  }

  const dist = new Array(numNodes).fill(Infinity);
  const edgeStates = edgeList.map(e => ({ ...e }));

  function makeSnapshot(current) {
    return {
      nodes: Array.from({ length: numNodes }, (_, i) => ({
        id: i, x: positions[i].x, y: positions[i].y,
        label: dist[i] === Infinity ? `${i}` : `${i}:${dist[i]}`,
        state: i === current ? 'current' : sources.includes(i) && dist[i] === 0 ? 'in-path' : dist[i] < Infinity ? 'visited' : 'default',
      })),
      edges: edgeStates.map(e => ({ ...e })),
    };
  }

  recorder.add('message', [], -1, `Multi-source BFS from sources: [${sources.join(', ')}]`, makeSnapshot(-1));

  const queue = [];
  for (const src of sources) {
    dist[src] = 0;
    queue.push(src);
    recorder.add('visit', [src], 0, `Enqueue source ${src} with distance 0`, makeSnapshot(src));
  }

  while (queue.length > 0) {
    const node = queue.shift();
    recorder.add('visit', [node], 2, `Dequeue node ${node} (dist = ${dist[node]})`, makeSnapshot(node));

    for (const neighbor of adj[node]) {
      if (dist[neighbor] > dist[node] + 1) {
        dist[neighbor] = dist[node] + 1;
        queue.push(neighbor);

        const edgeIdx = edgeStates.findIndex(
          e => (e.from === node && e.to === neighbor) || (e.from === neighbor && e.to === node)
        );
        if (edgeIdx !== -1) edgeStates[edgeIdx].state = 'visited';

        recorder.add('visit', [neighbor], 5, `Update dist[${neighbor}] = ${dist[neighbor]}, enqueue`, makeSnapshot(neighbor));
      } else {
        recorder.add('message', [], 4, `Neighbor ${neighbor} already reached (dist ${dist[neighbor]}), skip`, makeSnapshot(node));
      }
    }
  }

  recorder.add('message', [], -1, `Multi-source BFS complete. Distances: [${dist.join(', ')}]`, makeSnapshot(-1));
  return recorder.getSteps();
}
