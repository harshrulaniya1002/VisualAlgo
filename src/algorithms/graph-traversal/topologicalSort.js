import StepRecorder from '../../engine/StepRecorder';

export const meta = {
  name: 'Topological Sort',
  slug: 'topological-sort',
  category: 'graph-traversal',
  timeComplexity: { best: 'O(V + E)', average: 'O(V + E)', worst: 'O(V + E)' },
  spaceComplexity: 'O(V)',
  description:
    'Produces a linear ordering of vertices in a DAG such that for every directed edge u->v, u appears before v. Uses Kahn\'s algorithm with in-degree tracking and a queue.',
  rendererType: 'graph',
  graphType: 'dag',
  pseudocode: [
    'compute in-degree for each node',
    'enqueue all nodes with in-degree 0',
    'while queue not empty:',
    '  node = dequeue(), add to result',
    '  for each neighbor: decrement in-degree',
    '  if in-degree becomes 0, enqueue neighbor',
  ],
  inputSchema: {
    type: 'array',
    constraints: { minLength: 2, maxLength: 20, minValue: 0, maxValue: 99 },
  },
};

// DAG: 0->1, 0->2, 1->3, 2->3, 3->4, 4->5
export const defaultInput = [6, 0,1, 0,2, 1,3, 2,3, 3,4, 4,5];

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
  const inDegree = new Array(numNodes).fill(0);

  for (let i = 1; i < input.length; i += 2) {
    const u = input[i], v = input[i + 1];
    edgeList.push({ from: u, to: v, state: 'default', directed: true });
    adj[u].push(v);
    inDegree[v]++;
  }

  const processed = new Array(numNodes).fill(false);
  const edgeStates = edgeList.map(e => ({ ...e }));
  const result = [];

  function makeSnapshot(current) {
    return {
      nodes: Array.from({ length: numNodes }, (_, i) => ({
        id: i, x: positions[i].x, y: positions[i].y,
        label: `${i}(${inDegree[i]})`,
        state: i === current ? 'current' : processed[i] ? 'in-path' : 'default',
      })),
      edges: edgeStates.map(e => ({ ...e })),
    };
  }

  recorder.add('message', [], -1, 'Starting topological sort using Kahn\'s algorithm', makeSnapshot(-1));
  recorder.add('message', [], 0, `Computed in-degrees: [${inDegree.join(', ')}]`, makeSnapshot(-1));

  const queue = [];
  for (let i = 0; i < numNodes; i++) {
    if (inDegree[i] === 0) {
      queue.push(i);
    }
  }
  recorder.add('message', [], 1, `Nodes with in-degree 0: [${queue.join(', ')}]`, makeSnapshot(-1));

  while (queue.length > 0) {
    const node = queue.shift();
    processed[node] = true;
    result.push(node);
    recorder.add('visit', [node], 3, `Dequeue node ${node}. Order so far: [${result.join(', ')}]`, makeSnapshot(node));

    for (const neighbor of adj[node]) {
      inDegree[neighbor]--;
      const edgeIdx = edgeStates.findIndex(e => e.from === node && e.to === neighbor);
      if (edgeIdx !== -1) edgeStates[edgeIdx].state = 'visited';

      recorder.add('visit', [neighbor], 4, `Decrement in-degree of ${neighbor} to ${inDegree[neighbor]}`, makeSnapshot(neighbor));

      if (inDegree[neighbor] === 0) {
        queue.push(neighbor);
        recorder.add('message', [neighbor], 5, `In-degree of ${neighbor} is 0, enqueue it`, makeSnapshot(neighbor));
      }
    }
  }

  if (result.length === numNodes) {
    recorder.add('message', [], -1, `Topological order: [${result.join(', ')}]`, makeSnapshot(-1));
  } else {
    recorder.add('message', [], -1, 'Graph has a cycle! Topological sort not possible.', makeSnapshot(-1));
  }

  return recorder.getSteps();
}
