import StepRecorder from '../../engine/StepRecorder';

export const meta = {
  name: 'Naive Union-Find',
  slug: 'naive-union-find',
  category: 'union-find',
  timeComplexity: {
    best: 'O(1)',
    average: 'O(n)',
    worst: 'O(n)',
  },
  spaceComplexity: 'O(n)',
  description:
    'Basic Disjoint Set Union (DSU) using a parent array. Find follows the parent chain until reaching the root. Union connects two components by setting one root as the parent of the other. Without optimizations, find can degrade to O(n) on skewed trees.',
  rendererType: 'bar',
  pseudocode: [
    'function find(x):',
    '  while parent[x] != x:',
    '    x = parent[x]',
    '  return x',
    'function union(a, b):',
    '  rootA = find(a), rootB = find(b)',
    '  parent[rootA] = rootB',
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

export const defaultInput = [6, 0, 1, 1, 2, 3, 4, 4, 5, 0, 3];

export function generateSteps(input) {
  const recorder = new StepRecorder();
  const data = [...input];
  const n = data[0];

  // Initialize parent array: each element is its own parent
  const parent = [];
  for (let i = 0; i < n; i++) {
    parent[i] = i;
  }

  recorder.add(
    'message',
    [],
    -1,
    `Initialize DSU with ${n} elements. Each element is its own parent.`,
    [...parent],
    {}
  );

  recorder.add(
    'highlight',
    Array.from({ length: n }, (_, i) => i),
    -1,
    `Parent array initialized: parent[i] = i for all i in [0..${n - 1}]`,
    [...parent],
    {}
  );

  // find helper that records steps
  function find(x) {
    recorder.add(
      'visit',
      [x],
      0,
      `find(${x}): start at node ${x}`,
      [...parent],
      {}
    );

    let current = x;
    while (parent[current] !== current) {
      recorder.add(
        'compare',
        [current],
        1,
        `parent[${current}] = ${parent[current]} != ${current}, follow chain`,
        [...parent],
        {}
      );

      current = parent[current];

      recorder.add(
        'visit',
        [current],
        2,
        `Move to parent: x = ${current}`,
        [...parent],
        {}
      );
    }

    recorder.add(
      'found',
      [current],
      3,
      `parent[${current}] = ${current}, root found: ${current}`,
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
      4,
      `union(${a}, ${b}): connect components containing ${a} and ${b}`,
      [...parent],
      {}
    );

    const rootA = find(a);
    const rootB = find(b);

    recorder.add(
      'highlight',
      [rootA, rootB],
      5,
      `find(${a}) = ${rootA}, find(${b}) = ${rootB}`,
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
    } else {
      parent[rootA] = rootB;

      recorder.add(
        'swap',
        [rootA, rootB],
        6,
        `Set parent[${rootA}] = ${rootB}. Components merged.`,
        [...parent],
        {}
      );
    }
  }

  recorder.add(
    'message',
    [],
    -1,
    `Naive Union-Find complete. Final parent array: [${parent.join(', ')}]`,
    [...parent],
    {}
  );

  return recorder.getSteps();
}
