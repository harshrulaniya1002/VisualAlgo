import StepRecorder from '../../engine/StepRecorder';

export const meta = {
  name: 'Bridges & Articulation Points',
  slug: 'bridges-articulation-points',
  category: 'mst-connectivity',
  timeComplexity: { best: 'O(V + E)', average: 'O(V + E)', worst: 'O(V + E)' },
  spaceComplexity: 'O(V)',
  description:
    'Finds bridges (edges whose removal disconnects the graph) and articulation points (vertices whose removal disconnects the graph) using a single DFS pass with disc and low values.',
  rendererType: 'graph',
  graphType: 'undirected',
  pseudocode: [
    'DFS from each unvisited node',
    'set disc[u] = low[u] = timer++',
    'for each neighbor v of u:',
    '  if v not visited: DFS(v), low[u] = min(low[u], low[v])',
    '    if low[v] > disc[u]: edge u-v is a bridge',
    '    if low[v] >= disc[u]: u is an articulation point',
    '  else: low[u] = min(low[u], disc[v])',
  ],
  inputSchema: {
    type: 'array',
    constraints: { minLength: 2, maxLength: 20, minValue: 0, maxValue: 99 },
  },
};

export const defaultInput = [7, 0,1, 1,2, 2,0, 1,3, 3,4, 4,5, 5,6, 6,4];

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
    edgeList.push({ from: u, to: v });
    adj[u].push({ node: v, edgeIdx: edgeList.length - 1 });
    adj[v].push({ node: u, edgeIdx: edgeList.length - 1 });
  }

  const edgeStates = edgeList.map(e => ({ ...e, state: 'default', directed: false }));
  const disc = new Array(numNodes).fill(-1);
  const low = new Array(numNodes).fill(-1);
  const nodeStates = new Array(numNodes).fill('default');
  const parentArr = new Array(numNodes).fill(-1);
  let timer = 0;
  const bridges = [];
  const articulationPoints = new Set();

  function makeSnapshot() {
    return {
      nodes: Array.from({ length: numNodes }, (_, i) => ({
        id: i, x: positions[i].x, y: positions[i].y,
        label: disc[i] === -1 ? `${i}` : `${i} d${disc[i]}/l${low[i]}`,
        state: nodeStates[i],
      })),
      edges: edgeStates.map(e => ({ ...e })),
    };
  }

  recorder.add('message', [], -1, 'Starting DFS to find bridges and articulation points', makeSnapshot());

  function dfs(u) {
    disc[u] = low[u] = timer++;
    nodeStates[u] = 'current';
    let children = 0;

    recorder.add('visit', [u], 1, `Visit node ${u}: disc=${disc[u]}, low=${low[u]}`, makeSnapshot());

    for (const { node: v, edgeIdx } of adj[u]) {
      if (disc[v] === -1) {
        children++;
        parentArr[v] = u;
        edgeStates[edgeIdx].state = 'highlighted';
        recorder.add('message', [], 2, `Explore tree edge ${u}-${v}`, makeSnapshot());
        dfs(v);

        low[u] = Math.min(low[u], low[v]);
        nodeStates[u] = 'current';
        recorder.add('message', [], 3, `Return from ${v}: low[${u}] = min(${low[u]}, low[${v}]=${low[v]}) = ${low[u]}`, makeSnapshot());

        // Check for bridge
        if (low[v] > disc[u]) {
          bridges.push([u, v]);
          edgeStates[edgeIdx].state = 'visited';
          recorder.add('visit', [u, v], 4, `Bridge found: edge ${u}-${v} (low[${v}]=${low[v]} > disc[${u}]=${disc[u]})`, makeSnapshot());
        }

        // Check for articulation point (non-root)
        if (parentArr[u] !== -1 && low[v] >= disc[u]) {
          articulationPoints.add(u);
          nodeStates[u] = 'found';
          recorder.add('visit', [u], 5, `Articulation point: node ${u} (low[${v}]=${low[v]} >= disc[${u}]=${disc[u]})`, makeSnapshot());
        }
      } else if (v !== parentArr[u]) {
        low[u] = Math.min(low[u], disc[v]);
        recorder.add('message', [], 6, `Back edge ${u}-${v}: low[${u}] = min(${low[u]}, disc[${v}]=${disc[v]}) = ${low[u]}`, makeSnapshot());
      }
    }

    // Root articulation point check
    if (parentArr[u] === -1 && children > 1) {
      articulationPoints.add(u);
      nodeStates[u] = 'found';
      recorder.add('visit', [u], 5, `Articulation point: root node ${u} has ${children} children in DFS tree`, makeSnapshot());
    }

    if (!articulationPoints.has(u)) {
      nodeStates[u] = 'visited';
    }
  }

  for (let i = 0; i < numNodes; i++) {
    if (disc[i] === -1) {
      recorder.add('message', [], 0, `Starting DFS from node ${i}`, makeSnapshot());
      dfs(i);
    }
  }

  const apList = [...articulationPoints].sort((a, b) => a - b);
  const bridgeStr = bridges.map(([u, v]) => `(${u}-${v})`).join(', ');
  recorder.add('message', [], -1, `Complete. Bridges: [${bridgeStr}]. Articulation points: [${apList.join(', ')}]`, makeSnapshot());
  return recorder.getSteps();
}
