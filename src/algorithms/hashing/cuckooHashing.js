import StepRecorder from '../../engine/StepRecorder';

export const meta = {
  name: 'Cuckoo Hashing',
  slug: 'cuckoo-hashing',
  category: 'hashing',
  timeComplexity: { best: 'O(1)', average: 'O(1)', worst: 'O(1) amortized' },
  spaceComplexity: 'O(n)',
  description:
    'Uses two hash functions and two tables. On collision, the existing element is displaced to its alternate table position. This guarantees O(1) worst-case lookup time.',
  rendererType: 'bar',
  pseudocode: [
    'function insert(key):',
    '  if table1[h1(key)] is empty: place key',
    '  else: displace existing element',
    '  place displaced in table2[h2(key)]',
    '  repeat if needed (max iterations)',
    '  rehash if cycle detected',
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
  const table1 = new Array(tableSize).fill(0);
  const table2 = new Array(tableSize).fill(0);
  const maxLoop = tableSize * 2;

  function h1(k) { return k % tableSize; }
  function h2(k) { return Math.floor(k / tableSize) % tableSize; }

  // Combined snapshot: table1 followed by table2
  function snapshot() {
    return [...table1, ...table2];
  }

  recorder.add(
    'message',
    [],
    0,
    `Initialize two tables of size ${tableSize} each. h1(k) = k % ${tableSize}, h2(k) = floor(k / ${tableSize}) % ${tableSize}. Bars 0-${tableSize - 1} = Table1, bars ${tableSize}-${2 * tableSize - 1} = Table2.`,
    snapshot(),
    {}
  );

  for (let i = 0; i < arr.length; i++) {
    let key = arr[i];

    recorder.add(
      'compute',
      [h1(key)],
      0,
      `Insert ${key}: h1(${key}) = ${h1(key)}, h2(${key}) = ${h2(key)}`,
      snapshot(),
      { key, h1: h1(key), h2: h2(key) }
    );

    let useTable1 = true;
    let loopCount = 0;

    while (loopCount < maxLoop) {
      if (useTable1) {
        const idx = h1(key);
        if (table1[idx] === 0) {
          table1[idx] = key;
          recorder.add(
            'insert',
            [idx],
            1,
            `Table1[${idx}] is empty. Place ${key} there.`,
            snapshot(),
            { key, table: 1, index: idx }
          );
          break;
        } else {
          const displaced = table1[idx];
          table1[idx] = key;
          recorder.add(
            'swap',
            [idx],
            2,
            `Table1[${idx}] occupied by ${displaced}. Displace it, place ${key}. Now insert displaced ${displaced} into Table2.`,
            snapshot(),
            { key, displaced, table: 1, index: idx }
          );
          key = displaced;
          useTable1 = false;
        }
      } else {
        const idx = h2(key);
        const snapshotIdx = tableSize + idx;
        if (table2[idx] === 0) {
          table2[idx] = key;
          recorder.add(
            'insert',
            [snapshotIdx],
            3,
            `Table2[${idx}] is empty. Place ${key} there.`,
            snapshot(),
            { key, table: 2, index: idx }
          );
          break;
        } else {
          const displaced = table2[idx];
          table2[idx] = key;
          recorder.add(
            'swap',
            [snapshotIdx],
            3,
            `Table2[${idx}] occupied by ${displaced}. Displace it, place ${key}. Now insert displaced ${displaced} into Table1.`,
            snapshot(),
            { key, displaced, table: 2, index: idx }
          );
          key = displaced;
          useTable1 = true;
        }
      }
      loopCount++;
    }

    if (loopCount >= maxLoop) {
      recorder.add(
        'message',
        [],
        5,
        `Cycle detected while inserting ${key}! A rehash would be needed in practice.`,
        snapshot(),
        {}
      );
    }
  }

  recorder.add(
    'message',
    [],
    0,
    `All elements inserted. Bars 0-${tableSize - 1} show Table1, bars ${tableSize}-${2 * tableSize - 1} show Table2.`,
    snapshot(),
    {}
  );

  return recorder.getSteps();
}
