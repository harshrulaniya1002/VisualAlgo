import StepRecorder from '../../engine/StepRecorder';

export const meta = {
  name: 'Graph Coloring',
  slug: 'graph-coloring',
  category: 'backtracking',
  timeComplexity: {
    best: 'O(m^V)',
    average: 'O(m^V)',
    worst: 'O(m^V)',
  },
  spaceComplexity: 'O(V)',
  description:
    'Graph Coloring assigns colors to vertices of a graph such that no two adjacent vertices share the same color, using at most m colors. The algorithm uses backtracking: for each vertex it tries all m colors, checks adjacency constraints, and backtracks if no valid color is found.',
  rendererType: 'graph',
  pseudocode: [
    'function graphColor(node):',
    '  if node == V: all nodes colored',
    '  for color = 1 to m:',
    '    if isSafe(node, color):',
    '      assign color to node',
    '      if graphColor(node + 1): return true',
    '      remove color (backtrack)',
  ],
  inputSchema: {
    type: 'array',
    constraints: {
      minLength: 1,
      maxLength: 81,
      minValue: 0,
      maxValue: 999,
    },
  },
};

// Format: [numNodes, u1, v1, u2, v2, ...]
export const defaultInput = [5, 0,1, 0,2, 1,2, 1,3, 2,3, 3,4];

export function generateSteps(input) {
  const recorder = new StepRecorder();
  const numNodes = input[0];
  const m = 3; // number of colors
  const colorNames = ['None', 'Red', 'Green', 'Blue'];

  // Parse edges
  const edgeList = [];
  const adj = Array.from({ length: numNodes }, () => []);
  for (let i = 1; i < input.length; i += 2) {
    const u = input[i];
    const v = input[i + 1];
    edgeList.push({ from: u, to: v, state: 'default', directed: false });
    adj[u].push(v);
    adj[v].push(u);
  }

  const colors = new Array(numNodes).fill(0); // 0 = uncolored

  // Arrange nodes in a circle
  function arrangeInCircle(n, cx, cy, r) {
    return Array.from({ length: n }, (_, i) => ({
      x: cx + r * Math.cos(2 * Math.PI * i / n - Math.PI / 2),
      y: cy + r * Math.sin(2 * Math.PI * i / n - Math.PI / 2),
    }));
  }

  const positions = arrangeInCircle(numNodes, 300, 200, 150);

  function colorToState(c) {
    if (c === 1) return 'color-red';
    if (c === 2) return 'color-green';
    if (c === 3) return 'color-blue';
    return 'default';
  }

  function makeSnapshot(currentNode) {
    const nodes = Array.from({ length: numNodes }, (_, i) => ({
      id: i,
      x: positions[i].x,
      y: positions[i].y,
      label: `${i}(${colorNames[colors[i]]})`,
      state: i === currentNode ? 'current' : colors[i] > 0 ? 'visited' : 'default',
    }));
    const edges = edgeList.map(e => ({ ...e }));
    return { nodes, edges };
  }

  function isSafe(node, color) {
    for (const neighbor of adj[node]) {
      if (colors[neighbor] === color) return false;
    }
    return true;
  }

  let solved = false;

  recorder.add(
    'message',
    [],
    -1,
    `Starting Graph Coloring with ${m} colors on a graph with ${numNodes} nodes.`,
    makeSnapshot(-1),
    {}
  );

  function solve(node) {
    if (solved) return true;

    if (node === numNodes) {
      solved = true;
      recorder.add(
        'sorted',
        Array.from({ length: numNodes }, (_, i) => i),
        1,
        `All ${numNodes} nodes colored successfully with ${m} colors!`,
        makeSnapshot(-1),
        {}
      );
      return true;
    }

    recorder.add(
      'visit',
      [node],
      0,
      `Try to color node ${node}`,
      makeSnapshot(node),
      {}
    );

    for (let c = 1; c <= m; c++) {
      if (solved) return true;

      recorder.add(
        'compare',
        [node],
        3,
        `Check if ${colorNames[c]} is safe for node ${node}`,
        makeSnapshot(node),
        {}
      );

      if (isSafe(node, c)) {
        colors[node] = c;
        recorder.add(
          'visit',
          [node],
          4,
          `Assign ${colorNames[c]} to node ${node}`,
          makeSnapshot(node),
          {}
        );

        if (solve(node + 1)) return true;

        if (!solved) {
          colors[node] = 0;
          recorder.add(
            'backtrack',
            [node],
            6,
            `Remove ${colorNames[c]} from node ${node} (backtrack)`,
            makeSnapshot(node),
            {}
          );
        }
      } else {
        const conflicting = adj[node].filter(nb => colors[nb] === c);
        recorder.add(
          'highlight',
          [node, ...conflicting],
          3,
          `${colorNames[c]} conflicts with neighbor(s) ${conflicting.join(', ')}`,
          makeSnapshot(node),
          {}
        );
      }
    }

    return false;
  }

  solve(0);

  if (!solved) {
    recorder.add(
      'message',
      [],
      -1,
      `No valid coloring found with ${m} colors.`,
      makeSnapshot(-1),
      {}
    );
  }

  recorder.add(
    'message',
    [],
    -1,
    'Graph Coloring complete.',
    makeSnapshot(-1),
    {}
  );

  return recorder.getSteps();
}
