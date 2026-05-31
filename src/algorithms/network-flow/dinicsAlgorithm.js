import StepRecorder from '../../engine/StepRecorder';

export const meta = {
  name: "Dinic's Algorithm",
  slug: 'dinics-algorithm',
  category: 'network-flow',
  timeComplexity: { best: 'O(V^2 * E)', average: 'O(V^2 * E)', worst: 'O(V^2 * E)' },
  spaceComplexity: 'O(V + E)',
  description:
    "Dinic's algorithm finds maximum flow by repeatedly constructing a level graph via BFS and then finding blocking flows via DFS. The level graph ensures progress at each phase, giving a better worst-case bound than Edmonds-Karp.",
  rendererType: 'graph',
  graphType: 'directed-weighted',
  pseudocode: [
    'while BFS builds level graph from source to sink:',
    '  construct level graph using BFS distances',
    '  while DFS finds blocking flow:',
    '    find path from source to sink in level graph',
    '    bottleneck = min residual on path',
    '    update flow along path',
    '    total flow += bottleneck',
    '  repeat BFS with updated residual graph',
  ],
  inputSchema: {
    type: 'array',
    constraints: { minLength: 2, maxLength: 20, minValue: 0, maxValue: 99 },
  },
};

// Format: [numNodes, from, to, capacity, ...]
export const defaultInput = [6, 0,1,10, 0,2,10, 1,2,2, 1,3,4, 1,4,8, 2,4,9, 3,5,10, 4,3,6, 4,5,10];

function arrangeInCircle(n, cx, cy, r) {
  return Array.from({ length: n }, (_, i) => ({
    x: cx + r * Math.cos(2 * Math.PI * i / n - Math.PI / 2),
    y: cy + r * Math.sin(2 * Math.PI * i / n - Math.PI / 2),
  }));
}

export function generateSteps(input) {
  const recorder = new StepRecorder();
  const numNodes = input[0];
  const source = 0;
  const sink = numNodes - 1;
  const positions = arrangeInCircle(numNodes, 300, 200, 150);

  // Build capacity and flow matrices
  const capacity = Array.from({ length: numNodes }, () => new Array(numNodes).fill(0));
  const flow = Array.from({ length: numNodes }, () => new Array(numNodes).fill(0));
  const originalEdges = [];

  for (let i = 1; i < input.length; i += 3) {
    const u = input[i], v = input[i + 1], c = input[i + 2];
    capacity[u][v] = c;
    originalEdges.push({ from: u, to: v, capacity: c });
  }

  function makeSnapshot(nodeStates, edgeHighlights) {
    const nodes = Array.from({ length: numNodes }, (_, i) => ({
      id: i, x: positions[i].x, y: positions[i].y,
      label: nodeStates.labels ? nodeStates.labels[i] : (i === source ? `${i}(S)` : i === sink ? `${i}(T)` : String(i)),
      state: nodeStates[i] || 'default',
    }));
    const edges = originalEdges.map(e => {
      const f = flow[e.from][e.to];
      const c = e.capacity;
      return {
        from: e.from, to: e.to, directed: true,
        label: `${f}/${c}`,
        weight: c,
        state: (edgeHighlights && edgeHighlights[`${e.from}-${e.to}`]) || (f > 0 ? 'visited' : 'default'),
      };
    });
    return { nodes, edges };
  }

  function makeNodeStates(opts = {}) {
    const states = {};
    for (let i = 0; i < numNodes; i++) {
      if (opts.pathNodes && opts.pathNodes.has(i)) states[i] = 'current';
      else if (opts.levelNodes && opts.levelNodes.has(i)) states[i] = 'visited';
      else if (i === source || i === sink) states[i] = 'found';
      else states[i] = 'default';
    }
    if (opts.labels) states.labels = opts.labels;
    return states;
  }

  recorder.add('message', [], -1,
    `Starting Dinic's algorithm. Source = ${source}, Sink = ${sink}`,
    makeSnapshot(makeNodeStates(), {}));

  let totalFlow = 0;
  let phase = 0;

  while (true) {
    phase++;
    // BFS to build level graph
    const level = new Array(numNodes).fill(-1);
    level[source] = 0;
    const queue = [source];

    recorder.add('visit', [source], 0,
      `Phase ${phase}: BFS to build level graph`,
      makeSnapshot(makeNodeStates(), {}));

    while (queue.length > 0) {
      const u = queue.shift();
      for (let v = 0; v < numNodes; v++) {
        if (level[v] === -1 && capacity[u][v] - flow[u][v] > 0) {
          level[v] = level[u] + 1;
          queue.push(v);
        }
      }
    }

    if (level[sink] === -1) {
      recorder.add('message', [], 0,
        `BFS cannot reach sink. No more augmenting paths. Algorithm terminates.`,
        makeSnapshot(makeNodeStates(), {}));
      break;
    }

    // Show level graph
    const levelNodes = new Set();
    const labels = {};
    for (let i = 0; i < numNodes; i++) {
      if (level[i] >= 0) {
        levelNodes.add(i);
        labels[i] = `${i}(L${level[i]})`;
      } else {
        labels[i] = String(i);
      }
    }

    recorder.add('visit', [...levelNodes], 1,
      `Level graph built. Levels: ${Array.from(levelNodes).map(n => `${n}:L${level[n]}`).join(', ')}`,
      makeSnapshot(makeNodeStates({ levelNodes, labels }), {}));

    // DFS to find blocking flows
    const iter = new Array(numNodes).fill(0);

    function dfs(u, pushed) {
      if (u === sink) return pushed;
      for (; iter[u] < numNodes; iter[u]++) {
        const v = iter[u];
        if (level[v] !== level[u] + 1) continue;
        const residual = capacity[u][v] - flow[u][v];
        if (residual <= 0) continue;
        const d = dfs(v, Math.min(pushed, residual));
        if (d > 0) {
          flow[u][v] += d;
          flow[v][u] -= d;
          return d;
        }
      }
      return 0;
    }

    let blockingFlowCount = 0;
    while (true) {
      const pushed = dfs(source, Infinity);
      if (pushed === 0) break;
      totalFlow += pushed;
      blockingFlowCount++;

      // Reconstruct the path for visualization by tracing flow changes
      // Show the current state after pushing flow
      const pathEdges = {};
      // Highlight edges with recent flow
      for (const e of originalEdges) {
        if (flow[e.from][e.to] > 0) {
          pathEdges[`${e.from}-${e.to}`] = 'highlighted';
        }
      }

      recorder.add('visit', [], 4,
        `Blocking flow #${blockingFlowCount}: pushed ${pushed} units. Total flow = ${totalFlow}`,
        makeSnapshot(makeNodeStates({ levelNodes, labels }), pathEdges));
    }

    recorder.add('message', [], 7,
      `Phase ${phase} complete. Pushed ${blockingFlowCount} blocking flow(s). Total flow = ${totalFlow}`,
      makeSnapshot(makeNodeStates({ labels }), {}));
  }

  // Final state
  const finalStates = {};
  for (let i = 0; i < numNodes; i++) finalStates[i] = 'sorted';
  recorder.add('message', [], -1,
    `Dinic's algorithm complete. Maximum flow = ${totalFlow}`,
    makeSnapshot(Object.assign(finalStates, { labels: undefined }), {}));

  return recorder.getSteps();
}
