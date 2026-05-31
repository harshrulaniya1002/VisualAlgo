import StepRecorder from '../../engine/StepRecorder';

export const meta = {
  name: 'Cycle Detection in Graphs',
  slug: 'graph-cycle-detection',
  category: 'graph-traversal',
  timeComplexity: { best: 'O(V + E)', average: 'O(V + E)', worst: 'O(V + E)' },
  spaceComplexity: 'O(V)',
  description:
    'Detects cycles in a directed graph using DFS with three-color marking. Nodes are colored white (unvisited), gray (in current path), or black (fully processed). A back edge to a gray node indicates a cycle.',
  rendererType: 'graph',
  graphType: 'directed',
  pseudocode: [
    'color all nodes WHITE',
    'for each unvisited node: DFS(node)',
    'DFS(u): color u GRAY',
    '  for each neighbor v of u:',
    '    if v is GRAY -> cycle found!',
    '    if v is WHITE -> DFS(v); color u BLACK',
  ],
  inputSchema: {
    type: 'array',
    constraints: { minLength: 2, maxLength: 20, minValue: 0, maxValue: 99 },
  },
};

// Directed graph with a cycle: 0->1->2->3->1
export const defaultInput = [6, 0,1, 1,2, 2,3, 3,1, 3,4, 4,5];

function arrangeInCircle(n, cx, cy, r) {
  return Array.from({ length: n }, (_, i) => ({
    x: cx + r * Math.cos(2 * Math.PI * i / n - Math.PI / 2),
    y: cy + r * Math.sin(2 * Math.PI * i / n - Math.PI / 2),
  }));
}

const WHITE = 0, GRAY = 1, BLACK = 2;

export function generateSteps(input) {
  const recorder = new StepRecorder();
  const numNodes = input[0];
  const positions = arrangeInCircle(numNodes, 300, 200, 150);

  const edgeList = [];
  const adj = Array.from({ length: numNodes }, () => []);
  for (let i = 1; i < input.length; i += 2) {
    const u = input[i], v = input[i + 1];
    edgeList.push({ from: u, to: v, state: 'default', directed: true });
    adj[u].push(v);
  }

  const nodeColor = new Array(numNodes).fill(WHITE);
  const edgeStates = edgeList.map(e => ({ ...e }));

  function stateFromColor(c) {
    if (c === GRAY) return 'current';
    if (c === BLACK) return 'visited';
    return 'default';
  }

  function makeSnapshot(highlight) {
    return {
      nodes: Array.from({ length: numNodes }, (_, i) => ({
        id: i, x: positions[i].x, y: positions[i].y, label: String(i),
        state: i === highlight ? 'current' : stateFromColor(nodeColor[i]),
      })),
      edges: edgeStates.map(e => ({ ...e })),
    };
  }

  recorder.add('message', [], -1, 'Detecting cycles in directed graph using DFS coloring', makeSnapshot(-1));

  let cycleFound = false;

  function dfs(u) {
    if (cycleFound) return;
    nodeColor[u] = GRAY;
    recorder.add('visit', [u], 2, `Enter node ${u}, color GRAY (in current path)`, makeSnapshot(u));

    for (const v of adj[u]) {
      if (cycleFound) return;

      const edgeIdx = edgeStates.findIndex(e => e.from === u && e.to === v);

      if (nodeColor[v] === GRAY) {
        cycleFound = true;
        if (edgeIdx !== -1) edgeStates[edgeIdx].state = 'in-path';
        recorder.add('message', [], 4, `Back edge ${u} -> ${v} found! Node ${v} is GRAY. Cycle detected!`, makeSnapshot(u));
        return;
      }

      if (nodeColor[v] === WHITE) {
        if (edgeIdx !== -1) edgeStates[edgeIdx].state = 'visited';
        recorder.add('visit', [v], 5, `Neighbor ${v} is WHITE, recurse into it`, makeSnapshot(v));
        dfs(v);
      } else {
        recorder.add('message', [], 5, `Neighbor ${v} is BLACK (fully processed), skip`, makeSnapshot(u));
      }
    }

    if (!cycleFound) {
      nodeColor[u] = BLACK;
      recorder.add('visit', [u], 5, `Finished node ${u}, color BLACK`, makeSnapshot(u));
    }
  }

  for (let i = 0; i < numNodes && !cycleFound; i++) {
    if (nodeColor[i] === WHITE) {
      recorder.add('message', [i], 1, `Start DFS from unvisited node ${i}`, makeSnapshot(i));
      dfs(i);
    }
  }

  if (cycleFound) {
    recorder.add('message', [], -1, 'Cycle detected in the directed graph!', makeSnapshot(-1));
  } else {
    recorder.add('message', [], -1, 'No cycle found. The graph is a DAG.', makeSnapshot(-1));
  }

  return recorder.getSteps();
}
