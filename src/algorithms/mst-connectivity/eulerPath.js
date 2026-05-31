import StepRecorder from '../../engine/StepRecorder';

export const meta = {
  name: 'Euler Path (Hierholzer)',
  slug: 'euler-path',
  category: 'mst-connectivity',
  timeComplexity: { best: 'O(E)', average: 'O(E)', worst: 'O(E)' },
  spaceComplexity: 'O(E)',
  description:
    "Finds an Euler path or circuit using Hierholzer's algorithm. Builds the path by following unused edges, and splices in sub-circuits when a vertex with remaining edges is encountered.",
  rendererType: 'graph',
  graphType: 'undirected',
  pseudocode: [
    'check degree parity to determine start node',
    'stack = [start], circuit = []',
    'while stack not empty:',
    '  u = top of stack',
    '  if u has unused edges: push neighbor, remove edge',
    '  else: pop u from stack, add to circuit',
    'reverse circuit for final path',
  ],
  inputSchema: {
    type: 'array',
    constraints: { minLength: 2, maxLength: 20, minValue: 0, maxValue: 99 },
  },
};

export const defaultInput = [5, 0,1, 1,2, 2,0, 0,3, 3,4, 4,0];

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
  const degree = new Array(numNodes).fill(0);

  for (let i = 1; i < input.length; i += 2) {
    const u = input[i], v = input[i + 1];
    const idx = edgeList.length;
    edgeList.push({ from: u, to: v });
    adj[u].push({ node: v, edgeIdx: idx });
    adj[v].push({ node: u, edgeIdx: idx });
    degree[u]++;
    degree[v]++;
  }

  const edgeStates = edgeList.map(e => ({ ...e, state: 'default', directed: false }));
  const edgeUsed = new Array(edgeList.length).fill(false);
  const nodeStates = new Array(numNodes).fill('default');

  function makeSnapshot() {
    return {
      nodes: Array.from({ length: numNodes }, (_, i) => ({
        id: i, x: positions[i].x, y: positions[i].y,
        label: `${i}`,
        state: nodeStates[i],
      })),
      edges: edgeStates.map(e => ({ ...e })),
    };
  }

  recorder.add('message', [], -1, "Starting Hierholzer's algorithm for Euler path/circuit", makeSnapshot());

  // Check degree parity
  const oddNodes = [];
  for (let i = 0; i < numNodes; i++) {
    if (degree[i] % 2 !== 0) oddNodes.push(i);
  }

  let startNode = 0;
  if (oddNodes.length === 0) {
    recorder.add('message', [], 0, 'All vertices have even degree: Euler circuit exists', makeSnapshot());
  } else if (oddNodes.length === 2) {
    startNode = oddNodes[0];
    recorder.add('message', [], 0, `Vertices ${oddNodes[0]} and ${oddNodes[1]} have odd degree: Euler path exists (start from ${startNode})`, makeSnapshot());
  } else {
    recorder.add('message', [], -1, `${oddNodes.length} vertices have odd degree: no Euler path/circuit exists`, makeSnapshot());
    return recorder.getSteps();
  }

  // Hierholzer's algorithm
  const stack = [startNode];
  const circuit = [];
  // Track position in adjacency list for each node
  const adjIdx = new Array(numNodes).fill(0);

  nodeStates[startNode] = 'current';
  recorder.add('visit', [startNode], 1, `Push start node ${startNode} to stack`, makeSnapshot());

  while (stack.length > 0) {
    const u = stack[stack.length - 1];

    // Find next unused edge from u
    let foundEdge = false;
    while (adjIdx[u] < adj[u].length) {
      const { node: v, edgeIdx } = adj[u][adjIdx[u]];
      adjIdx[u]++;
      if (!edgeUsed[edgeIdx]) {
        edgeUsed[edgeIdx] = true;
        edgeStates[edgeIdx].state = 'highlighted';
        stack.push(v);
        nodeStates[v] = 'current';
        recorder.add('visit', [v], 4, `Follow edge ${u}-${v}, push ${v} to stack. Stack: [${stack.join(',')}]`, makeSnapshot());
        foundEdge = true;
        break;
      }
    }

    if (!foundEdge) {
      stack.pop();
      circuit.push(u);
      nodeStates[u] = 'visited';
      recorder.add('message', [u], 5, `No more edges from ${u}. Pop and add to circuit. Circuit: [${circuit.join(',')}]`, makeSnapshot());
    }
  }

  // Reverse for final path
  circuit.reverse();

  // Mark circuit edges as visited
  for (let i = 0; i < edgeStates.length; i++) {
    if (edgeUsed[i]) edgeStates[i].state = 'visited';
  }
  for (let i = 0; i < numNodes; i++) nodeStates[i] = 'sorted';

  recorder.add('message', [], 6, `Euler path/circuit: [${circuit.join(' -> ')}]`, makeSnapshot());
  return recorder.getSteps();
}
