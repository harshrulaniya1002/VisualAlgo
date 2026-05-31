import StepRecorder from '../../engine/StepRecorder';

export const meta = {
  name: "Tarjan's SCC",
  slug: 'tarjan-scc',
  category: 'mst-connectivity',
  timeComplexity: { best: 'O(V + E)', average: 'O(V + E)', worst: 'O(V + E)' },
  spaceComplexity: 'O(V)',
  description:
    "Finds all Strongly Connected Components in a directed graph using a single DFS pass. Tracks discovery time (disc) and lowest reachable ancestor (low) for each node, using a stack to collect SCCs.",
  rendererType: 'graph',
  graphType: 'directed',
  pseudocode: [
    'for each unvisited node u: dfs(u)',
    'dfs(u): set disc[u] = low[u] = timer++, push u',
    '  for each neighbor v of u:',
    '    if v not visited: dfs(v), low[u] = min(low[u], low[v])',
    '    else if v on stack: low[u] = min(low[u], disc[v])',
    '  if low[u] == disc[u]: pop stack until u -> SCC',
  ],
  inputSchema: {
    type: 'array',
    constraints: { minLength: 2, maxLength: 20, minValue: 0, maxValue: 99 },
  },
};

export const defaultInput = [6, 0,1, 1,2, 2,0, 1,3, 3,4, 4,5, 5,3];

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
  }

  const edgeStates = edgeList.map(e => ({ ...e, state: 'default', directed: true }));
  const disc = new Array(numNodes).fill(-1);
  const low = new Array(numNodes).fill(-1);
  const onStack = new Array(numNodes).fill(false);
  const nodeStates = new Array(numNodes).fill('default');
  const stack = [];
  let timer = 0;
  const sccs = [];

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

  recorder.add('message', [], -1, "Starting Tarjan's SCC algorithm", makeSnapshot());

  function dfs(u) {
    disc[u] = low[u] = timer++;
    stack.push(u);
    onStack[u] = true;
    nodeStates[u] = 'current';

    recorder.add('visit', [u], 1, `DFS visit node ${u}: disc=${disc[u]}, low=${low[u]}. Push to stack [${stack.join(',')}]`, makeSnapshot());

    for (const { node: v, edgeIdx } of adj[u]) {
      if (disc[v] === -1) {
        edgeStates[edgeIdx].state = 'highlighted';
        recorder.add('message', [], 3, `Explore tree edge ${u} -> ${v}`, makeSnapshot());
        dfs(v);
        low[u] = Math.min(low[u], low[v]);
        nodeStates[u] = 'current';
        recorder.add('message', [], 3, `Back from ${v}: low[${u}] = min(${low[u]}, low[${v}]=${low[v]}) = ${low[u]}`, makeSnapshot());
      } else if (onStack[v]) {
        low[u] = Math.min(low[u], disc[v]);
        edgeStates[edgeIdx].state = 'highlighted';
        recorder.add('message', [], 4, `Back edge ${u} -> ${v} (on stack): low[${u}] = min(${low[u]}, disc[${v}]=${disc[v]}) = ${low[u]}`, makeSnapshot());
      } else {
        recorder.add('message', [], 4, `Cross edge ${u} -> ${v} (not on stack): skip`, makeSnapshot());
      }
    }

    // If u is a root of an SCC
    if (low[u] === disc[u]) {
      const scc = [];
      let w;
      do {
        w = stack.pop();
        onStack[w] = false;
        scc.push(w);
        nodeStates[w] = 'found';
      } while (w !== u);
      sccs.push(scc);
      recorder.add('visit', scc, 5, `SCC found (root=${u}): {${scc.join(', ')}}. Pop stack until ${u}.`, makeSnapshot());

      // Mark SCC edges as visited
      for (const node of scc) {
        for (const { edgeIdx, node: target } of adj[node]) {
          if (scc.includes(target)) {
            edgeStates[edgeIdx].state = 'visited';
          }
        }
      }
    } else {
      nodeStates[u] = 'visited';
    }
  }

  for (let i = 0; i < numNodes; i++) {
    if (disc[i] === -1) {
      recorder.add('message', [], 0, `Starting DFS from unvisited node ${i}`, makeSnapshot());
      dfs(i);
    }
  }

  recorder.add('message', [], -1, `Tarjan's complete. Found ${sccs.length} SCC(s): ${sccs.map(s => `{${s.join(',')}}`).join(', ')}`, makeSnapshot());
  return recorder.getSteps();
}
