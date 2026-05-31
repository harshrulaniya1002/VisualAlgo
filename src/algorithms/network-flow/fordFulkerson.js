import StepRecorder from '../../engine/StepRecorder';

export const meta = {
  name: 'Ford-Fulkerson Algorithm',
  slug: 'ford-fulkerson',
  category: 'network-flow',
  timeComplexity: { best: 'O(E * max_flow)', average: 'O(E * max_flow)', worst: 'O(E * max_flow)' },
  spaceComplexity: 'O(V + E)',
  description:
    'Ford-Fulkerson computes maximum flow in a flow network by repeatedly finding augmenting paths from source to sink in the residual graph using DFS, then pushing flow along those paths until no more augmenting paths exist.',
  rendererType: 'graph',
  graphType: 'directed-weighted',
  pseudocode: [
    'initialize flow = 0 on all edges',
    'while augmenting path exists in residual graph:',
    '  find path from source to sink via DFS',
    '  bottleneck = min residual capacity on path',
    '  for each edge (u,v) on path:',
    '    increase flow(u,v) by bottleneck',
    '    decrease flow(v,u) by bottleneck',
    '  total flow += bottleneck',
  ],
  inputSchema: {
    type: 'array',
    constraints: { minLength: 2, maxLength: 20, minValue: 0, maxValue: 99 },
  },
};

// Format: [numNodes, from, to, capacity, ...]
export const defaultInput = [6, 0,1,16, 0,2,13, 1,2,10, 1,3,12, 2,1,4, 2,4,14, 3,2,9, 3,5,20, 4,3,7, 4,5,4];

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
      label: i === source ? `${i}(S)` : i === sink ? `${i}(T)` : String(i),
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

  function makeNodeStates(pathNodes, visited) {
    const states = {};
    for (let i = 0; i < numNodes; i++) {
      if (pathNodes && pathNodes.has(i)) states[i] = 'current';
      else if (visited && visited[i]) states[i] = 'visited';
      else if (i === source || i === sink) states[i] = 'found';
      else states[i] = 'default';
    }
    return states;
  }

  recorder.add('message', [], -1,
    `Starting Ford-Fulkerson. Source = ${source}, Sink = ${sink}`,
    makeSnapshot(makeNodeStates(), {}));

  let totalFlow = 0;
  let iteration = 0;

  while (true) {
    iteration++;
    // DFS to find augmenting path in residual graph
    const parent = new Array(numNodes).fill(-1);
    const visitedArr = new Array(numNodes).fill(false);
    const stack = [source];
    visitedArr[source] = true;

    recorder.add('visit', [source], 2,
      `Iteration ${iteration}: DFS from source (node ${source}) to find augmenting path`,
      makeSnapshot(makeNodeStates(null, visitedArr), {}));

    let found = false;
    while (stack.length > 0) {
      const u = stack.pop();
      if (u === sink) {
        found = true;
        break;
      }
      for (let v = 0; v < numNodes; v++) {
        const residual = capacity[u][v] - flow[u][v];
        if (!visitedArr[v] && residual > 0) {
          visitedArr[v] = true;
          parent[v] = u;
          stack.push(v);
          recorder.add('visit', [v], 2,
            `DFS explores node ${v} from ${u} (residual capacity: ${residual})`,
            makeSnapshot(makeNodeStates(null, visitedArr), { [`${u}-${v}`]: 'highlighted' }));
        }
      }
    }

    if (!found) {
      recorder.add('message', [], 1,
        `No augmenting path found. Algorithm terminates.`,
        makeSnapshot(makeNodeStates(), {}));
      break;
    }

    // Reconstruct path and find bottleneck
    const path = [];
    let bottleneck = Infinity;
    let v = sink;
    while (v !== source) {
      const u = parent[v];
      path.unshift({ from: u, to: v });
      bottleneck = Math.min(bottleneck, capacity[u][v] - flow[u][v]);
      v = u;
    }

    const pathNodes = new Set();
    const edgeHighlights = {};
    for (const edge of path) {
      pathNodes.add(edge.from);
      pathNodes.add(edge.to);
      edgeHighlights[`${edge.from}-${edge.to}`] = 'highlighted';
    }

    const pathStr = [path[0].from, ...path.map(e => e.to)].join(' -> ');
    recorder.add('visit', [...pathNodes], 3,
      `Augmenting path found: ${pathStr}. Bottleneck = ${bottleneck}`,
      makeSnapshot(makeNodeStates(pathNodes), edgeHighlights));

    // Update flow along path
    for (const edge of path) {
      flow[edge.from][edge.to] += bottleneck;
      flow[edge.to][edge.from] -= bottleneck;
    }
    totalFlow += bottleneck;

    recorder.add('visit', [...pathNodes], 5,
      `Push flow = ${bottleneck} along path. Total flow = ${totalFlow}`,
      makeSnapshot(makeNodeStates(pathNodes), edgeHighlights));
  }

  // Final state
  const finalStates = {};
  for (let i = 0; i < numNodes; i++) finalStates[i] = 'sorted';
  recorder.add('message', [], -1,
    `Ford-Fulkerson complete. Maximum flow = ${totalFlow}`,
    makeSnapshot(finalStates, {}));

  return recorder.getSteps();
}
