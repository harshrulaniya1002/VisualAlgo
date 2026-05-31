import StepRecorder from '../../engine/StepRecorder';

export const meta = {
  name: 'Union by Rank',
  slug: 'union-by-rank',
  category: 'union-find',
  timeComplexity: {
    best: 'O(1)',
    average: 'O(log n)',
    worst: 'O(log n)',
  },
  spaceComplexity: 'O(n)',
  description:
    'Union by Rank optimizes the naive DSU by always attaching the shorter tree under the taller tree during union. This keeps trees balanced, guaranteeing O(log n) height. A rank array tracks the upper bound on tree height for each root.',
  rendererType: 'bar',
  pseudocode: [
    'function union(a, b):',
    '  rootA = find(a), rootB = find(b)',
    '  if rank[rootA] < rank[rootB]:',
    '    parent[rootA] = rootB',
    '  else if rank[rootA] > rank[rootB]:',
    '    parent[rootB] = rootA',
    '  else:',
    '    parent[rootB] = rootA; rank[rootA]++',
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

export const defaultInput = [8, 0, 1, 2, 3, 4, 5, 6, 7, 0, 2, 4, 6, 0, 4];

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

  recorder.add(
    'message',
    [],
    -1,
    `Initialize DSU with ${n} elements. parent[i] = i, rank[i] = 0 for all.`,
    [...parent],
    {}
  );

  recorder.add(
    'highlight',
    Array.from({ length: n }, (_, i) => i),
    -1,
    `Parent array: [${parent.join(', ')}], Rank array: [${rank.join(', ')}]`,
    [...parent],
    {}
  );

  // find helper (basic, no path compression)
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

  // Parse pairs and perform union operations
  let idx = 1;
  while (idx + 1 < data.length) {
    const a = data[idx];
    const b = data[idx + 1];
    idx += 2;

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
        `${a} and ${b} are already in the same component (root = ${rootA}). No union needed.`,
        [...parent],
        {}
      );
    } else if (rank[rootA] < rank[rootB]) {
      parent[rootA] = rootB;

      recorder.add(
        'swap',
        [rootA, rootB],
        2,
        `rank[${rootA}] (${rank[rootA]}) < rank[${rootB}] (${rank[rootB]}): set parent[${rootA}] = ${rootB}`,
        [...parent],
        { ranks: [...rank] }
      );

      recorder.add(
        'compute',
        [rootA, rootB],
        3,
        `Ranks unchanged. Rank: [${rank.join(', ')}]`,
        [...parent],
        { ranks: [...rank] }
      );
    } else if (rank[rootA] > rank[rootB]) {
      parent[rootB] = rootA;

      recorder.add(
        'swap',
        [rootB, rootA],
        4,
        `rank[${rootA}] (${rank[rootA]}) > rank[${rootB}] (${rank[rootB]}): set parent[${rootB}] = ${rootA}`,
        [...parent],
        { ranks: [...rank] }
      );

      recorder.add(
        'compute',
        [rootA, rootB],
        5,
        `Ranks unchanged. Rank: [${rank.join(', ')}]`,
        [...parent],
        { ranks: [...rank] }
      );
    } else {
      parent[rootB] = rootA;
      rank[rootA]++;

      recorder.add(
        'swap',
        [rootB, rootA],
        6,
        `Equal ranks (${rank[rootA] - 1}): set parent[${rootB}] = ${rootA}`,
        [...parent],
        { ranks: [...rank] }
      );

      recorder.add(
        'compute',
        [rootA],
        7,
        `Increment rank[${rootA}] to ${rank[rootA]}. Rank: [${rank.join(', ')}]`,
        [...parent],
        { ranks: [...rank] }
      );
    }
  }

  recorder.add(
    'message',
    [],
    -1,
    `Union by Rank complete. Parent: [${parent.join(', ')}], Rank: [${rank.join(', ')}]`,
    [...parent],
    {}
  );

  return recorder.getSteps();
}
