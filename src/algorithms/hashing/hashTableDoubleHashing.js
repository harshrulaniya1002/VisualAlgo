import StepRecorder from '../../engine/StepRecorder';

export const meta = {
  name: 'Hash Table (Double Hashing)',
  slug: 'hash-table-double-hashing',
  category: 'hashing',
  timeComplexity: { best: 'O(1)', average: 'O(1)', worst: 'O(n)' },
  spaceComplexity: 'O(n)',
  description:
    'Uses a second hash function to determine the probe step size, reducing clustering. The probe sequence is: (h1(k) + i * h2(k)) % tableSize, where h2(k) = prime - (k % prime).',
  rendererType: 'bar',
  pseudocode: [
    'function insert(key):',
    '  h1 = key % tableSize',
    '  h2 = prime2 - (key % prime2)',
    '  while table[index] is occupied:',
    '    index = (h1 + i * h2) % tableSize',
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
  const prime2 = 7; // Second prime for h2, must be less than tableSize
  const table = new Array(tableSize).fill(0);

  recorder.add(
    'message',
    [],
    0,
    `Initialize hash table of size ${tableSize}. h1(k) = k % ${tableSize}, h2(k) = ${prime2} - (k % ${prime2})`,
    [...table],
    {}
  );

  for (let i = 0; i < arr.length; i++) {
    const key = arr[i];
    const h1 = key % tableSize;
    const h2 = prime2 - (key % prime2);

    recorder.add(
      'compute',
      [h1],
      1,
      `Compute h1(${key}) = ${key} % ${tableSize} = ${h1}, h2(${key}) = ${prime2} - (${key} % ${prime2}) = ${h2}`,
      [...table],
      { key, h1, h2 }
    );

    let probeNum = 0;
    let index = h1;

    while (table[index] !== 0) {
      recorder.add(
        'compare',
        [index],
        3,
        `Slot ${index} is occupied by ${table[index]}. Double-hash probe: (${h1} + ${probeNum + 1} * ${h2}) % ${tableSize}.`,
        [...table],
        { key, probeIndex: index, probeNum }
      );
      probeNum++;
      index = (h1 + probeNum * h2) % tableSize;

      if (probeNum >= tableSize) {
        recorder.add(
          'message',
          [],
          0,
          `Cannot find an empty slot for ${key} after ${tableSize} probes.`,
          [...table],
          {}
        );
        return recorder.getSteps();
      }
    }

    table[index] = key;

    if (probeNum === 0) {
      recorder.add(
        'insert',
        [index],
        5,
        `Slot ${index} is empty. Insert ${key} directly (no collision).`,
        [...table],
        { key, finalIndex: index, probes: probeNum }
      );
    } else {
      recorder.add(
        'insert',
        [index],
        5,
        `Found empty slot at index ${index} after ${probeNum} double-hash probe(s). Insert ${key}.`,
        [...table],
        { key, finalIndex: index, probes: probeNum }
      );
    }
  }

  recorder.add(
    'message',
    [],
    0,
    `All ${arr.length} elements inserted using double hashing. Each bar shows the value stored at that slot.`,
    [...table],
    {}
  );

  return recorder.getSteps();
}
