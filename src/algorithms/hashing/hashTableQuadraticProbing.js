import StepRecorder from '../../engine/StepRecorder';

export const meta = {
  name: 'Hash Table (Quadratic Probing)',
  slug: 'hash-table-quadratic-probing',
  category: 'hashing',
  timeComplexity: { best: 'O(1)', average: 'O(1)', worst: 'O(n)' },
  spaceComplexity: 'O(n)',
  description:
    'Resolves collisions by probing slots at quadratically increasing intervals from the hash index. Instead of checking index+1, index+2, it checks index+1^2, index+2^2, etc., which reduces primary clustering.',
  rendererType: 'bar',
  pseudocode: [
    'function insert(key):',
    '  index = key % tableSize',
    '  i = 1',
    '  while table[index] is occupied:',
    '    index = (hash + i*i) % tableSize; i++',
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

    let probeNum = 0;
    let index = homeIndex;

    while (table[index] !== 0) {
      recorder.add(
        'compare',
        [index],
        3,
        `Slot ${index} is occupied by ${table[index]}. Quadratic probe: try (${homeIndex} + ${probeNum + 1}^2) % ${tableSize}.`,
        [...table],
        { key, probeIndex: index, probeNum }
      );
      probeNum++;
      index = (homeIndex + probeNum * probeNum) % tableSize;

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
        `Found empty slot at index ${index} after ${probeNum} quadratic probe(s). Insert ${key}.`,
        [...table],
        { key, finalIndex: index, probes: probeNum }
      );
    }
  }

  recorder.add(
    'message',
    [],
    0,
    `All ${arr.length} elements inserted using quadratic probing. Each bar shows the value stored at that slot.`,
    [...table],
    {}
  );

  return recorder.getSteps();
}
