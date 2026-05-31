import StepRecorder from '../../engine/StepRecorder';

export const meta = {
  name: 'Hash Table (Linear Probing)',
  slug: 'hash-table-linear-probing',
  category: 'hashing',
  timeComplexity: { best: 'O(1)', average: 'O(1)', worst: 'O(n)' },
  spaceComplexity: 'O(n)',
  description:
    'Resolves hash collisions by probing the next available slot sequentially in the table. When a collision occurs, it checks index+1, index+2, and so on (wrapping around) until an empty slot is found.',
  rendererType: 'bar',
  pseudocode: [
    'function insert(key):',
    '  index = key % tableSize',
    '  while table[index] is occupied:',
    '    index = (index + 1) % tableSize',
    '  table[index] = key',
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
  const tableSize = 13;
  const table = new Array(tableSize).fill(0);

  recorder.add(
    'message',
    [],
    0,
    `Initialize hash table of size ${tableSize} (all slots empty = 0). Hash function: h(k) = k % ${tableSize}`,
    [...table],
    {}
  );

  for (let i = 0; i < arr.length; i++) {
    const key = arr[i];
    const homeIndex = key % tableSize;

    recorder.add(
      'compute',
      [homeIndex],
      1,
      `Compute hash: h(${key}) = ${key} % ${tableSize} = ${homeIndex}`,
      [...table],
      { key, hashIndex: homeIndex }
    );

    let index = homeIndex;
    let probeCount = 0;

    while (table[index] !== 0) {
      recorder.add(
        'compare',
        [index],
        2,
        `Slot ${index} is occupied by ${table[index]}. Probe next slot.`,
        [...table],
        { key, probeIndex: index, probeCount }
      );
      index = (index + 1) % tableSize;
      probeCount++;

      if (probeCount >= tableSize) {
        recorder.add(
          'message',
          [],
          0,
          `Table is full! Cannot insert ${key}.`,
          [...table],
          {}
        );
        return recorder.getSteps();
      }
    }

    table[index] = key;

    if (probeCount === 0) {
      recorder.add(
        'insert',
        [index],
        4,
        `Slot ${index} is empty. Insert ${key} directly (no collision).`,
        [...table],
        { key, finalIndex: index, probes: probeCount }
      );
    } else {
      recorder.add(
        'insert',
        [index],
        4,
        `Found empty slot at index ${index} after ${probeCount} probe(s). Insert ${key}.`,
        [...table],
        { key, finalIndex: index, probes: probeCount }
      );
    }
  }

  recorder.add(
    'message',
    [],
    0,
    `All ${arr.length} elements inserted using linear probing. Each bar shows the value stored at that slot.`,
    [...table],
    {}
  );

  return recorder.getSteps();
}
