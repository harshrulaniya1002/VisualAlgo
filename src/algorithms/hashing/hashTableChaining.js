import StepRecorder from '../../engine/StepRecorder';

export const meta = {
  name: 'Hash Table (Chaining)',
  slug: 'hash-table-chaining',
  category: 'hashing',
  timeComplexity: { best: 'O(1)', average: 'O(1)', worst: 'O(n)' },
  spaceComplexity: 'O(n)',
  description:
    'Resolves hash collisions by storing multiple elements at the same index using linked lists (chains). Each slot in the table holds a chain of all elements that hash to that index.',
  rendererType: 'bar',
  pseudocode: [
    'function insert(key):',
    '  index = key % tableSize',
    '  append key to table[index] chain',
    '  if collision: chain grows',
    'Lookup: hash then traverse chain',
  ],
  inputSchema: {
    type: 'array',
    constraints: { minLength: 2, maxLength: 20, minValue: 0, maxValue: 99 },
  },
};

export const defaultInput = [10, 22, 31, 4, 15, 28, 17, 88, 59];

export function generateSteps(input) {
  const recorder = new StepRecorder();
  const arr = [...input];
  const tableSize = 11;

  // Each bucket stores an array (chain) of values
  const chains = Array.from({ length: tableSize }, () => []);
  // For bar renderer: show count of elements in each bucket
  const table = new Array(tableSize).fill(0);

  recorder.add(
    'message',
    [],
    0,
    `Initialize hash table with ${tableSize} empty buckets (using chaining). Hash function: h(k) = k % ${tableSize}`,
    [...table],
    {}
  );

  for (let i = 0; i < arr.length; i++) {
    const key = arr[i];
    const index = key % tableSize;

    // Show hash computation
    recorder.add(
      'compute',
      [index],
      1,
      `Compute hash: h(${key}) = ${key} % ${tableSize} = ${index}`,
      [...table],
      { key, hashIndex: index }
    );

    const hadCollision = chains[index].length > 0;

    // Insert into chain
    chains[index].push(key);
    table[index] = chains[index].length;

    if (hadCollision) {
      recorder.add(
        'insert',
        [index],
        3,
        `Collision at bucket ${index}! Append ${key} to chain. Bucket ${index} now has ${chains[index].length} elements: [${chains[index].join(', ')}]`,
        [...table],
        { key, chain: [...chains[index]] }
      );
    } else {
      recorder.add(
        'insert',
        [index],
        2,
        `Insert ${key} into empty bucket ${index}. Chain: [${key}]`,
        [...table],
        { key, chain: [...chains[index]] }
      );
    }
  }

  recorder.add(
    'message',
    [],
    4,
    `All ${arr.length} elements inserted. Bar heights show the number of elements chained at each bucket.`,
    [...table],
    { chains: chains.map(c => [...c]) }
  );

  return recorder.getSteps();
}
