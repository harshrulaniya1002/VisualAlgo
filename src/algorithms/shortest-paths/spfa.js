import StepRecorder from '../../engine/StepRecorder';

export const meta = {
  name: 'SPFA (Shortest Path Faster Algorithm)',
  slug: 'spfa',
  category: 'shortest-paths',
  timeComplexity: { best: 'O(V + E)', average: 'O(V + E)', worst: 'O(V * E)' },
  spaceComplexity: 'O(V)',
  description:
    'An optimization of Bellman-Ford that uses a queue to relax only vertices whose distances have been updated. Each vertex is enqueued only when its distance improves, making it faster in practice on most graphs.',
  rendererType: 'graph',
  pseudocode: [
    'set dist[source] = 0, enqueue source',
    'while queue not empty:',
    '  u = dequeue(), mark u not in queue',
    '  for each edge (u, v, w):',
    '    if dist[u] + w < dist[v]:',
    '      update dist[v], enqueue v if not in queue',
  ],
  inputSchema: {
    type: 'array',
    constraints: { minLength: 2, maxLength: 30, minValue: -99, maxValue: 99 },
  },
};

// Format: [numNodes, from, to, weight, ...]
export const defaultInput = [6, 0,1,2, 0,2,5, 1,2,1, 1,3,6, 2,3,3, 2,4,8, 3,5,2, 4,5,1, 4,3,-2];

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
  for (let i = 1; i < input.length; i += 3) {
    const u = input[i], v = input[i + 1], w = input[i + 2];
    edgeList.push({ from: u, to: v, weight: w, state: 'default', directed: true });
    adj[u].push({ node: v, weight: w, edgeIdx: edgeList.length - 1 });
  }

  const dist = new Array(numNodes).fill(Infinity);
  const inQueue = new Array(numNodes).fill(false);
  const count = new Array(numNodes).fill(0); // for negative cycle detection
  const edgeStates = edgeList.map(e => ({ ...e }));

  function makeSnapshot(current) {
    return {
      nodes: Array.from({ length: numNodes }, (_, i) => ({
        id: i, x: positions[i].x, y: positions[i].y,
        label: dist[i] === Infinity ? `${i}:INF` : `${i}:${dist[i]}`,
        state: i === current ? 'current' : inQueue[i] ? 'visited' : dist[i] < Infinity ? 'in-path' : 'default',
      })),
      edges: edgeStates.map(e => ({ ...e })),
    };
  }

  recorder.add('message', [], -1, 'Starting SPFA from node 0', makeSnapshot(-1));

  dist[0] = 0;
  inQueue[0] = true;
  const queue = [0];
  recorder.add('visit', [0], 0, 'Set dist[0] = 0 and enqueue', makeSnapshot(0));

  let negCycle = false;

  while (queue.length > 0 && !negCycle) {
    const u = queue.shift();
    inQueue[u] = false;
    recorder.add('visit', [u], 2, `Dequeue node ${u} (dist = ${dist[u]})`, makeSnapshot(u));

    for (const { node: v, weight: w, edgeIdx } of adj[u]) {
      if (dist[u] + w < dist[v]) {
        dist[v] = dist[u] + w;
        edgeStates[edgeIdx].state = 'visited';
        recorder.add('visit', [v], 4, `Relax ${u}->${v}: dist[${v}] = ${dist[u]} + (${w}) = ${dist[v]}`, makeSnapshot(v));

        if (!inQueue[v]) {
          inQueue[v] = true;
          count[v]++;
          queue.push(v);

          if (count[v] >= numNodes) {
            negCycle = true;
            recorder.add('message', [], -1, `Node ${v} enqueued ${count[v]} times. Negative cycle detected!`, makeSnapshot(v));
            break;
          }
          recorder.add('message', [v], 5, `Enqueue node ${v}`, makeSnapshot(v));
        }
      }
    }
  }

  if (!negCycle) {
    recorder.add('message', [], -1, `SPFA complete. Shortest distances: [${dist.map(d => d === Infinity ? 'INF' : d).join(', ')}]`, makeSnapshot(-1));
  }

  return recorder.getSteps();
}
