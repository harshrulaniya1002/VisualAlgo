import StepRecorder from '../../engine/StepRecorder';

export const meta = {
  name: 'Path Compression',
  slug: 'path-compression',
  category: 'union-find',
  timeComplexity: {
    best: 'O(1)',
    average: 'O(alpha(n))',
    worst: 'O(alpha(n))',
  },
  spaceComplexity: 'O(n)',
  description:
    'Path Compression optimizes find by making every node on the path point directly to the root. Combined with union by rank, this achieves nearly O(1) amortized time per operation (inverse Ackermann). After a find, the tree becomes nearly flat, dramatically speeding up future queries.',
  rendererType: 'bar',
  pseudocode: [
    'function find(x):',
    '  if parent[x] != x:',
    '    parent[x] = find(parent[x])',
    '  return parent[x]',
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

export const defaultInput = [8, 0, 1, 1, 2, 2, 3, 4, 5, 5, 6, 6, 7, 3, 7];

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
    `Initialize DSU with ${n} elements and path compression. parent[i] = i for all.`,
    [...parent],
    {}
  );

  recorder.add(
    'highlight',
    Array.from({ length: n }, (_, i) => i),
    -1,
    `Parent array: [${parent.join(', ')}]`,
    [...parent],
    {}
  );

  // Recursive find with path compression, recording each step
  function find(x) {
    recorder.add(
      'visit',
      [x],
      0,
      `find(${x}): checking if parent[${x}] = ${parent[x]} equals ${x}`,
      [...parent],
      {}
    );

    if (parent[x] !== x) {
      recorder.add(
        'compare',
        [x],
        1,
        `parent[${x}] = ${parent[x]} != ${x}, recurse into find(${parent[x]})`,
        [...parent],
        {}
      );

      const root = find(parent[x]);

      if (parent[x] !== root) {
        const oldParent = parent[x];
        parent[x] = root;

        recorder.add(
          'swap',
          [x, root],
          2,
          `Path compression: parent[${x}] changed from ${oldParent} to root ${root}`,
          [...parent],
          {}
        );
      }

      return root;
    }

    recorder.add(
      'found',
      [x],
      3,
      `parent[${x}] = ${x}, root found: ${x}`,
      [...parent],
      {}
    );

    return x;
  }

  // Union by rank (used alongside path compression)
  function union(a, b) {
    recorder.add(
      'message',
      [a, b],
      -1,
      `union(${a}, ${b}): connect components containing ${a} and ${b}`,
      [...parent],
      {}
    );

    const rootA = find(a);
    const rootB = find(b);

    recorder.add(
      'highlight',
      [rootA, rootB],
      -1,
      `find(${a}) = ${rootA}, find(${b}) = ${rootB}`,
      [...parent],
      {}
    );

    if (rootA === rootB) {
      recorder.add(
        'message',
        [rootA],
        -1,
        `${a} and ${b} already in the same component (root = ${rootA}). No union needed.`,
        [...parent],
        {}
      );
      return;
    }

    if (rank[rootA] < rank[rootB]) {
      parent[rootA] = rootB;

      recorder.add(
        'swap',
        [rootA, rootB],
        -1,
        `rank[${rootA}] (${rank[rootA]}) < rank[${rootB}] (${rank[rootB]}): parent[${rootA}] = ${rootB}`,
        [...parent],
        {}
      );
    } else if (rank[rootA] > rank[rootB]) {
      parent[rootB] = rootA;

      recorder.add(
        'swap',
        [rootB, rootA],
        -1,
        `rank[${rootA}] (${rank[rootA]}) > rank[${rootB}] (${rank[rootB]}): parent[${rootB}] = ${rootA}`,
        [...parent],
        {}
      );
    } else {
      parent[rootB] = rootA;
      rank[rootA]++;

      recorder.add(
        'swap',
        [rootB, rootA],
        -1,
        `Equal ranks: parent[${rootB}] = ${rootA}, rank[${rootA}] incremented to ${rank[rootA]}`,
        [...parent],
        {}
      );
    }
  }

  // Parse pairs and perform union operations
  let idx = 1;
  while (idx + 1 < data.length) {
    const a = data[idx];
    const b = data[idx + 1];
    idx += 2;

    union(a, b);

    recorder.add(
      'compute',
      [],
      -1,
      `After union(${a}, ${b}) - Parent: [${parent.join(', ')}]`,
      [...parent],
      {}
    );
  }

  // Demonstrate path compression by finding all elements
  recorder.add(
    'message',
    [],
    -1,
    'Now call find on every element to demonstrate full path compression.',
    [...parent],
    {}
  );

  for (let i = 0; i < n; i++) {
    find(i);
  }

  recorder.add(
    'message',
    [],
    -1,
    `Path Compression complete. Final parent array: [${parent.join(', ')}]. All paths are now flat.`,
    [...parent],
    {}
  );

  return recorder.getSteps();
}
