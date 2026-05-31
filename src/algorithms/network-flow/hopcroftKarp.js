import StepRecorder from '../../engine/StepRecorder';

export const meta = {
  name: 'Hopcroft-Karp Algorithm',
  slug: 'hopcroft-karp',
  category: 'network-flow',
  timeComplexity: { best: 'O(E * sqrt(V))', average: 'O(E * sqrt(V))', worst: 'O(E * sqrt(V))' },
  spaceComplexity: 'O(V)',
  description:
    'Hopcroft-Karp finds maximum cardinality matching in a bipartite graph. It alternates between BFS phases (finding shortest augmenting paths) and DFS phases (augmenting along multiple vertex-disjoint paths simultaneously), achieving O(E * sqrt(V)) time.',
  rendererType: 'graph',
  graphType: 'undirected',
  pseudocode: [
    'while BFS finds augmenting paths:',
    '  BFS from free left vertices to build layers',
    '  stop BFS at shortest path to free right vertex',
    '  for each free left vertex:',
    '    DFS to find augmenting path in layer graph',
    '    if path found: flip matched/unmatched edges',
    '  matching size += number of augmenting paths',
  ],
  inputSchema: {
    type: 'array',
    constraints: { minLength: 2, maxLength: 20, minValue: 0, maxValue: 99 },
  },
};

// Format: [leftSize, rightSize, u, v, u, v, ...] where u is left vertex index, v is right vertex index
export const defaultInput = [4, 4, 0,0, 0,1, 1,1, 1,2, 2,2, 2,3, 3,3];

export function generateSteps(input) {
  const recorder = new StepRecorder();
  const leftSize = input[0];
  const rightSize = input[1];
  const totalNodes = leftSize + rightSize;

  // Layout: two columns for bipartite graph
  const leftX = 150;
  const rightX = 450;
  const centerY = 200;
  const spacing = 80;
  const positions = [];

  // Left vertices
  const leftStartY = centerY - (leftSize - 1) * spacing / 2;
  for (let i = 0; i < leftSize; i++) {
    positions.push({ x: leftX, y: leftStartY + i * spacing });
  }
  // Right vertices (indexed as leftSize + j)
  const rightStartY = centerY - (rightSize - 1) * spacing / 2;
  for (let j = 0; j < rightSize; j++) {
    positions.push({ x: rightX, y: rightStartY + j * spacing });
  }

  // Parse edges
  const adj = Array.from({ length: leftSize }, () => []);
  const edgeList = [];
  for (let i = 2; i < input.length; i += 2) {
    const u = input[i]; // left vertex
    const v = input[i + 1]; // right vertex (stored as index in right set)
    adj[u].push(v);
    edgeList.push({ leftNode: u, rightNode: v });
  }

  // Matching arrays: matchL[u] = right vertex matched to left u, matchR[v] = left vertex matched to right v
  const NIL = -1;
  const matchL = new Array(leftSize).fill(NIL);
  const matchR = new Array(rightSize).fill(NIL);

  function makeSnapshot(nodeStates, edgeHighlights) {
    const nodes = [];
    for (let i = 0; i < leftSize; i++) {
      nodes.push({
        id: i, x: positions[i].x, y: positions[i].y,
        label: `L${i}`,
        state: (nodeStates && nodeStates[i]) || 'default',
      });
    }
    for (let j = 0; j < rightSize; j++) {
      const nodeId = leftSize + j;
      nodes.push({
        id: nodeId, x: positions[nodeId].x, y: positions[nodeId].y,
        label: `R${j}`,
        state: (nodeStates && nodeStates[nodeId]) || 'default',
      });
    }

    const edges = edgeList.map(e => {
      const isMatched = matchL[e.leftNode] === e.rightNode;
      const key = `${e.leftNode}-${e.rightNode}`;
      return {
        from: e.leftNode,
        to: leftSize + e.rightNode,
        directed: true,
        label: isMatched ? 'matched' : '',
        state: (edgeHighlights && edgeHighlights[key]) || (isMatched ? 'visited' : 'default'),
      };
    });

    return { nodes, edges };
  }

  function makeNodeStates(opts = {}) {
    const states = {};
    for (let i = 0; i < totalNodes; i++) {
      if (opts.pathNodes && opts.pathNodes.has(i)) states[i] = 'current';
      else if (opts.bfsNodes && opts.bfsNodes.has(i)) states[i] = 'visited';
      else if (opts.freeLeft && i < leftSize && matchL[i] === NIL) states[i] = 'found';
      else states[i] = 'default';
    }
    return states;
  }

  recorder.add('message', [], -1,
    `Starting Hopcroft-Karp. Left vertices: ${leftSize}, Right vertices: ${rightSize}, Edges: ${edgeList.length}`,
    makeSnapshot(makeNodeStates({ freeLeft: true }), {}));

  let matchingSize = 0;
  let phase = 0;

  while (true) {
    phase++;
    // BFS phase: find shortest augmenting path layers
    const dist = new Array(leftSize).fill(Infinity);
    const queue = [];

    // Start BFS from all free left vertices
    for (let u = 0; u < leftSize; u++) {
      if (matchL[u] === NIL) {
        dist[u] = 0;
        queue.push(u);
      }
    }

    const bfsNodes = new Set(queue);
    recorder.add('visit', [...queue], 0,
      `Phase ${phase}: BFS from ${queue.length} free left vertices`,
      makeSnapshot(makeNodeStates({ bfsNodes, freeLeft: true }), {}));

    let foundAugmenting = false;
    let head = 0;
    while (head < queue.length) {
      const u = queue[head++];
      for (const v of adj[u]) {
        // v is right vertex; check its match
        const w = matchR[v]; // left vertex matched to right v
        if (w === NIL) {
          // Found free right vertex - augmenting path exists
          foundAugmenting = true;
        } else if (dist[w] === Infinity) {
          dist[w] = dist[u] + 1;
          queue.push(w);
          bfsNodes.add(w);
          bfsNodes.add(leftSize + v);
        }
      }
    }

    if (!foundAugmenting) {
      recorder.add('message', [], 0,
        `BFS found no augmenting paths. Algorithm terminates.`,
        makeSnapshot(makeNodeStates(), {}));
      break;
    }

    recorder.add('visit', [], 2,
      `BFS complete. Augmenting paths exist at distance layers.`,
      makeSnapshot(makeNodeStates({ bfsNodes }), {}));

    // DFS phase: find vertex-disjoint augmenting paths
    function dfs(u) {
      for (const v of adj[u]) {
        const w = matchR[v];
        if (w === NIL || (dist[w] === dist[u] + 1 && dfs(w))) {
          matchL[u] = v;
          matchR[v] = u;
          return true;
        }
      }
      dist[u] = Infinity; // Remove u from layer graph
      return false;
    }

    let augmentedCount = 0;
    for (let u = 0; u < leftSize; u++) {
      if (matchL[u] === NIL) {
        if (dfs(u)) {
          augmentedCount++;
          matchingSize++;

          // Show the new matching state
          const pathNodes = new Set();
          pathNodes.add(u);
          pathNodes.add(leftSize + matchL[u]);
          const edgeHighlights = {};
          edgeHighlights[`${u}-${matchL[u]}`] = 'highlighted';

          recorder.add('visit', [u, leftSize + matchL[u]], 5,
            `Augmented: L${u} matched with R${matchL[u]}. Matching size = ${matchingSize}`,
            makeSnapshot(makeNodeStates({ pathNodes }), edgeHighlights));
        }
      }
    }

    recorder.add('message', [], 6,
      `Phase ${phase} complete. Found ${augmentedCount} augmenting path(s). Total matching = ${matchingSize}`,
      makeSnapshot(makeNodeStates(), {}));
  }

  // Final state - show the matching
  const finalStates = {};
  for (let i = 0; i < leftSize; i++) {
    finalStates[i] = matchL[i] !== NIL ? 'sorted' : 'default';
  }
  for (let j = 0; j < rightSize; j++) {
    finalStates[leftSize + j] = matchR[j] !== NIL ? 'sorted' : 'default';
  }

  const matchDesc = [];
  for (let i = 0; i < leftSize; i++) {
    if (matchL[i] !== NIL) matchDesc.push(`L${i}-R${matchL[i]}`);
  }

  recorder.add('message', [], -1,
    `Hopcroft-Karp complete. Maximum matching size = ${matchingSize}. Matches: ${matchDesc.join(', ')}`,
    makeSnapshot(finalStates, {}));

  return recorder.getSteps();
}
