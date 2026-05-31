import StepRecorder from '../../engine/StepRecorder';

export const meta = {
  name: 'Rollback DSU',
  slug: 'rollback-dsu',
  category: 'union-find',
  timeComplexity: {
    best: 'O(log n)',
    average: 'O(log n)',
    worst: 'O(log n)',
  },
  spaceComplexity: 'O(n + q)',
  description:
    'DSU with rollback maintains a history stack of all union operations. Each union saves the previous parent and rank values before modification. A rollback operation pops the last entry and restores the DSU to its prior state. Uses union by rank (no path compression) to keep rollbacks valid.',
  rendererType: 'bar',
  pseudocode: [
    'function union(a, b):',
    '  rootA = find(a), rootB = find(b)',
    '  save (rootA, rootB) to history',
    '  attach smaller to larger',
    'function rollback():',
    '  pop from history',
    '  restore parent and rank',
  ],
  inputSchema: {
    type: 'array',
    constraints: {
      minLength: 1,
      maxLength: 50,
      minValue: -1,
      maxValue: 999,
    },
  },
};

export const defaultInput = [6, 0, 1, 2, 3, 4, 5, -1, -1, 0, 2];

export function generateSteps(input) {
  const recorder = new StepRecorder();
  const data = [...input];
  const n = data[0];

  // Initialize parent and rank arrays
  const parent = [];
  const rank = [];
  for (let i = 0; i < n; i++) {
    parent[i] = i;
    rank[i] = 0;
  }

  // History stack: each entry stores what changed so we can undo it
  const history = [];

  recorder.add(
    'message',
    [],
    -1,
    `Initialize Rollback DSU with ${n} elements. History stack is empty.`,
    [...parent],
    {}
  );

  recorder.add(
    'highlight',
    Array.from({ length: n }, (_, i) => i),
    -1,
    `Parent: [${parent.join(', ')}], Rank: [${rank.join(', ')}], History: []`,
    [...parent],
    {}
  );

  // find without path compression (required for valid rollback)
  function find(x) {
    recorder.add(
      'visit',
      [x],
      -1,
      `find(${x}): start at node ${x}`,
      [...parent],
      {}
    );

    let current = x;
    while (parent[current] !== current) {
      recorder.add(
        'compare',
        [current],
        -1,
        `parent[${current}] = ${parent[current]} != ${current}, follow chain`,
        [...parent],
        {}
      );

      current = parent[current];

      recorder.add(
        'visit',
        [current],
        -1,
        `Move to parent: x = ${current}`,
        [...parent],
        {}
      );
    }

    recorder.add(
      'found',
      [current],
      -1,
      `Root found: ${current}`,
      [...parent],
      {}
    );

    return current;
  }

  function formatHistory() {
    if (history.length === 0) return '[]';
    return '[' + history.map(h => `(node=${h.node}, oldParent=${h.oldParent}, oldRank=${h.oldRank})`).join(', ') + ']';
  }

  function unionOp(a, b) {
    recorder.add(
      'message',
      [a, b],
      0,
      `union(${a}, ${b}): connect components containing ${a} and ${b}`,
      [...parent],
      {}
    );

    const rootA = find(a);
    const rootB = find(b);

    recorder.add(
      'highlight',
      [rootA, rootB],
      1,
      `find(${a}) = ${rootA} (rank ${rank[rootA]}), find(${b}) = ${rootB} (rank ${rank[rootB]})`,
      [...parent],
      {}
    );

    if (rootA === rootB) {
      recorder.add(
        'message',
        [rootA],
        -1,
        `${a} and ${b} already in same component (root = ${rootA}). Pushing no-op to history.`,
        [...parent],
        {}
      );

      // Push a no-op so rollback count stays consistent with union count
      history.push({ node: -1, oldParent: -1, oldRank: -1 });

      recorder.add(
        'compute',
        [],
        2,
        `History stack: ${formatHistory()}`,
        [...parent],
        {}
      );
      return;
    }

    if (rank[rootA] < rank[rootB]) {
      // Save rootA's state before changing
      history.push({ node: rootA, oldParent: parent[rootA], oldRank: rank[rootA] });

      recorder.add(
        'compute',
        [rootA],
        2,
        `Save to history: node=${rootA}, oldParent=${rootA}, oldRank=${rank[rootA]}. History: ${formatHistory()}`,
        [...parent],
        {}
      );

      parent[rootA] = rootB;

      recorder.add(
        'swap',
        [rootA, rootB],
        3,
        `rank[${rootA}] < rank[${rootB}]: parent[${rootA}] = ${rootB}`,
        [...parent],
        {}
      );
    } else if (rank[rootA] > rank[rootB]) {
      // Save rootB's state before changing
      history.push({ node: rootB, oldParent: parent[rootB], oldRank: rank[rootB] });

      recorder.add(
        'compute',
        [rootB],
        2,
        `Save to history: node=${rootB}, oldParent=${rootB}, oldRank=${rank[rootB]}. History: ${formatHistory()}`,
        [...parent],
        {}
      );

      parent[rootB] = rootA;

      recorder.add(
        'swap',
        [rootB, rootA],
        3,
        `rank[${rootA}] > rank[${rootB}]: parent[${rootB}] = ${rootA}`,
        [...parent],
        {}
      );
    } else {
      // Save rootB's state and rootA's rank before changing
      history.push({ node: rootB, oldParent: parent[rootB], oldRank: rank[rootA] });

      recorder.add(
        'compute',
        [rootB, rootA],
        2,
        `Save to history: node=${rootB}, oldParent=${rootB}, oldRank=${rank[rootA]}. History: ${formatHistory()}`,
        [...parent],
        {}
      );

      parent[rootB] = rootA;
      rank[rootA]++;

      recorder.add(
        'swap',
        [rootB, rootA],
        3,
        `Equal ranks: parent[${rootB}] = ${rootA}, rank[${rootA}] = ${rank[rootA]}`,
        [...parent],
        {}
      );
    }

    recorder.add(
      'compute',
      [],
      -1,
      `After union: Parent: [${parent.join(', ')}], Rank: [${rank.join(', ')}]`,
      [...parent],
      {}
    );
  }

  function rollback() {
    if (history.length === 0) {
      recorder.add(
        'message',
        [],
        -1,
        'Rollback requested but history stack is empty. Nothing to undo.',
        [...parent],
        {}
      );
      return;
    }

    recorder.add(
      'message',
      [],
      4,
      `Rollback: undoing last union. Current history: ${formatHistory()}`,
      [...parent],
      {}
    );

    const entry = history.pop();

    recorder.add(
      'compute',
      [],
      5,
      `Popped from history: node=${entry.node}, oldParent=${entry.oldParent}, oldRank=${entry.oldRank}`,
      [...parent],
      {}
    );

    if (entry.node === -1) {
      recorder.add(
        'message',
        [],
        -1,
        'Popped a no-op entry (union was on same component). No state change needed.',
        [...parent],
        {}
      );
      return;
    }

    // Restore rank first (may need to decrement root's rank for equal-rank case)
    if (rank[parent[entry.node]] > entry.oldRank && parent[entry.node] !== entry.node) {
      const rootNode = parent[entry.node];
      rank[rootNode] = entry.oldRank;

      recorder.add(
        'compute',
        [rootNode],
        6,
        `Restore rank[${rootNode}] = ${entry.oldRank}`,
        [...parent],
        {}
      );
    }

    // Restore parent
    parent[entry.node] = entry.oldParent;

    recorder.add(
      'swap',
      [entry.node],
      6,
      `Restore parent[${entry.node}] = ${entry.oldParent}`,
      [...parent],
      {}
    );

    recorder.add(
      'compute',
      [],
      -1,
      `After rollback: Parent: [${parent.join(', ')}], Rank: [${rank.join(', ')}], History: ${formatHistory()}`,
      [...parent],
      {}
    );
  }

  // Parse operations: positive pairs = union, -1 = rollback
  let idx = 1;
  while (idx < data.length) {
    if (data[idx] === -1) {
      rollback();
      idx++;
    } else if (idx + 1 < data.length) {
      const a = data[idx];
      const b = data[idx + 1];
      unionOp(a, b);
      idx += 2;
    } else {
      // Odd trailing element, skip
      idx++;
    }
  }

  recorder.add(
    'message',
    [],
    -1,
    `Rollback DSU complete. Final parent: [${parent.join(', ')}], Rank: [${rank.join(', ')}], Remaining history: ${formatHistory()}`,
    [...parent],
    {}
  );

  return recorder.getSteps();
}
