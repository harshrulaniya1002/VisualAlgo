import StepRecorder from '../../engine/StepRecorder';

export const meta = {
  name: 'Clone Linked List with Random Pointer',
  slug: 'clone-random-pointer',
  category: 'linked-lists',
  timeComplexity: { best: 'O(n)', average: 'O(n)', worst: 'O(n)' },
  spaceComplexity: 'O(1)',
  description:
    'Creates a deep copy of a linked list where each node has a next and a random pointer. Uses the interleaving technique: insert cloned nodes between originals, copy random pointers, then separate the two lists.',
  rendererType: 'bar',
  pseudocode: [
    'Step 1: Interleave cloned nodes',
    '  insert clone of each node after original',
    'Step 2: Copy random pointers',
    '  clone.random = original.random.next',
    'Step 3: Separate lists',
    '  restore original and extract clone list',
  ],
  inputSchema: {
    type: 'array',
    constraints: {
      minLength: 2,
      maxLength: 50,
      minValue: 0,
      maxValue: 999,
    },
  },
};

export const defaultInput = [10, 20, 30, 40, 50];

export function generateSteps(input) {
  const recorder = new StepRecorder();
  const arr = [...input];
  const n = arr.length;

  // Generate random pointers: each node points to a random other node (or null)
  const randomPtrs = [];
  for (let i = 0; i < n; i++) {
    // Deterministic "random" pointers for visualization
    const target = (i * 3 + 1) % n;
    randomPtrs.push(target === i ? (i + 2) % n : target);
  }

  recorder.add(
    'message',
    [],
    0,
    `Clone linked list with random pointers. Original: [${arr.join(' -> ')}]`,
    [...arr],
    {}
  );

  // Show random pointers
  for (let i = 0; i < n; i++) {
    recorder.add(
      'highlight',
      [i, randomPtrs[i]],
      0,
      `Node ${arr[i]} (index ${i}) has random pointer to node ${arr[randomPtrs[i]]} (index ${randomPtrs[i]})`,
      [...arr],
      { node: i, randomTarget: randomPtrs[i] }
    );
  }

  // Phase 1: Interleave - insert clone after each original
  recorder.add(
    'message',
    [],
    0,
    `Phase 1: Interleave cloned nodes after each original`,
    [...arr],
    {}
  );

  const interleaved = [];
  for (let i = 0; i < n; i++) {
    interleaved.push(arr[i]);
    interleaved.push(arr[i]); // Clone

    recorder.add(
      'insert',
      [interleaved.length - 2, interleaved.length - 1],
      1,
      `Insert clone of node ${arr[i]} after original. List: [${interleaved.join(', ')}]`,
      [...interleaved],
      { original: i, clone: interleaved.length - 1 }
    );
  }

  recorder.add(
    'compute',
    [],
    1,
    `Interleaved list: [${interleaved.map((v, i) => i % 2 === 0 ? `O:${v}` : `C:${v}`).join(', ')}]`,
    [...interleaved],
    {}
  );

  // Phase 2: Copy random pointers
  recorder.add(
    'message',
    [],
    2,
    `Phase 2: Copy random pointers to cloned nodes`,
    [...interleaved],
    {}
  );

  for (let i = 0; i < n; i++) {
    const originalIdx = i * 2;
    const cloneIdx = i * 2 + 1;
    const randomTarget = randomPtrs[i];
    const cloneRandomTarget = randomTarget * 2 + 1; // Clone of the random target

    recorder.add(
      'compare',
      [cloneIdx, cloneRandomTarget],
      3,
      `Clone of node ${arr[i]}: set random pointer to clone of node ${arr[randomTarget]} (index ${cloneRandomTarget})`,
      [...interleaved],
      { clone: cloneIdx, randomClone: cloneRandomTarget }
    );
  }

  // Phase 3: Separate the two lists
  recorder.add(
    'message',
    [],
    4,
    `Phase 3: Separate original and cloned lists`,
    [...interleaved],
    {}
  );

  const originalList = [];
  const clonedList = [];

  for (let i = 0; i < interleaved.length; i++) {
    if (i % 2 === 0) {
      originalList.push(interleaved[i]);
    } else {
      clonedList.push(interleaved[i]);
    }
  }

  // Show separation
  for (let i = 0; i < n; i++) {
    recorder.add(
      'visit',
      [i * 2, i * 2 + 1],
      5,
      `Separate: original node ${originalList[i]} and clone node ${clonedList[i]}`,
      [...interleaved],
      { original: originalList[i], clone: clonedList[i] }
    );
  }

  // Show original restored
  recorder.add(
    'message',
    [],
    5,
    `Original list restored: [${originalList.join(' -> ')}]`,
    [...originalList],
    {}
  );

  // Show cloned list
  recorder.add(
    'message',
    [],
    5,
    `Cloned list: [${clonedList.join(' -> ')}]`,
    [...clonedList],
    {}
  );

  // Mark clone as complete
  for (let i = 0; i < clonedList.length; i++) {
    recorder.add(
      'sorted',
      [i],
      0,
      `Clone[${i}] = ${clonedList[i]}, random -> ${clonedList[randomPtrs[i]]}`,
      [...clonedList],
      {}
    );
  }

  recorder.add(
    'message',
    [],
    0,
    `Cloning complete! Deep copy with random pointers created successfully.`,
    [...clonedList],
    {}
  );

  return recorder.getSteps();
}
