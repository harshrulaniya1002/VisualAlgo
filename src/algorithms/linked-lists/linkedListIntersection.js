import StepRecorder from '../../engine/StepRecorder';

export const meta = {
  name: 'Linked List Intersection Detection',
  slug: 'linked-list-intersection',
  category: 'linked-lists',
  timeComplexity: { best: 'O(n + m)', average: 'O(n + m)', worst: 'O(n + m)' },
  spaceComplexity: 'O(1)',
  description:
    'Finds the node where two singly linked lists intersect by first computing their lengths, then aligning the starting points so both pointers reach the intersection simultaneously.',
  rendererType: 'bar',
  pseudocode: [
    'Compute len1 and len2',
    'Advance longer list by |len1 - len2| nodes',
    'Move both pointers one step at a time',
    'if p1 == p2: return intersection node',
    'if both reach null: no intersection',
    'return intersection point',
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

// Two lists that share a common tail
// List A: [4, 1] -> shared: [8, 10, 15]
// List B: [5, 6, 3] -> shared: [8, 10, 15]
// Encoded as: [listA_unique..., listB_unique..., shared...]
export const defaultInput = [4, 1, 5, 6, 3, 8, 10, 15];

export function generateSteps(input) {
  const recorder = new StepRecorder();
  const arr = [...input];
  const n = arr.length;

  // Split input into: list A unique, list B unique, shared tail
  const sharedLen = Math.max(2, Math.floor(n / 3));
  const remaining = n - sharedLen;
  const lenA = Math.max(1, Math.floor(remaining / 2));
  const lenB = Math.max(1, remaining - lenA);

  const listAUnique = arr.slice(0, lenA);
  const listBUnique = arr.slice(lenA, lenA + lenB);
  const shared = arr.slice(lenA + lenB);

  const listA = [...listAUnique, ...shared];
  const listB = [...listBUnique, ...shared];

  recorder.add(
    'message',
    [],
    0,
    `List A: [${listA.join(' -> ')}] (length ${listA.length})`,
    [...listA],
    { listA }
  );

  recorder.add(
    'message',
    [],
    0,
    `List B: [${listB.join(' -> ')}] (length ${listB.length})`,
    [...listB],
    { listB }
  );

  recorder.add(
    'message',
    [],
    0,
    `Shared tail starts at value ${shared[0]}. Lists intersect at this node.`,
    [...listA, ...listBUnique],
    {}
  );

  // Show combined view: [ListA | ListB_unique]
  const combined = [...listA, ...listBUnique];

  // Step 1: Compute lengths
  recorder.add(
    'compute',
    [],
    0,
    `Step 1: Compute lengths. List A length = ${listA.length}, List B length = ${listB.length}`,
    [...combined],
    { lenA: listA.length, lenB: listB.length }
  );

  const diff = Math.abs(listA.length - listB.length);

  recorder.add(
    'compute',
    [],
    0,
    `Length difference = |${listA.length} - ${listB.length}| = ${diff}`,
    [...combined],
    { diff }
  );

  // Step 2: Advance the longer list pointer
  let pA = 0;
  let pB = 0;
  const longerIsList = listA.length >= listB.length ? 'A' : 'B';

  recorder.add(
    'message',
    [],
    1,
    `Step 2: Advance pointer on the longer list (${longerIsList}) by ${diff} nodes`,
    [...combined],
    {}
  );

  if (listA.length >= listB.length) {
    for (let i = 0; i < diff; i++) {
      recorder.add(
        'visit',
        [pA],
        1,
        `Advance pA to node ${listA[pA]} (index ${pA}) in List A`,
        [...combined],
        { pA }
      );
      pA++;
    }
  } else {
    for (let i = 0; i < diff; i++) {
      recorder.add(
        'visit',
        [listA.length + pB],
        1,
        `Advance pB to node ${listB[pB]} (index ${pB}) in List B`,
        [...combined],
        { pB }
      );
      pB++;
    }
  }

  recorder.add(
    'highlight',
    [pA, listA.length + pB],
    1,
    `Pointers aligned: pA at List A[${pA}] = ${listA[pA]}, pB at List B[${pB}] = ${listB[pB]}`,
    [...combined],
    { pA, pB }
  );

  // Step 3: Move both pointers together
  recorder.add(
    'message',
    [],
    2,
    `Step 3: Move both pointers one step at a time until they meet`,
    [...combined],
    {}
  );

  let intersectionFound = false;

  while (pA < listA.length && pB < listB.length) {
    const valA = listA[pA];
    const valB = listB[pB];

    recorder.add(
      'compare',
      [pA, listA.length + pB],
      3,
      `Compare: List A[${pA}] = ${valA}, List B[${pB}] = ${valB}`,
      [...combined],
      { pA, pB, valA, valB }
    );

    // Check if they point to the same node (same value in shared section)
    if (pA >= lenA && pB >= lenB) {
      // Both are in the shared section
      recorder.add(
        'found',
        [pA],
        3,
        `Intersection found! Both pointers reach shared node with value ${valA} at positions A[${pA}], B[${pB}]`,
        [...combined],
        { intersection: valA, posA: pA, posB: pB }
      );
      intersectionFound = true;

      // Show the shared tail
      for (let i = pA; i < listA.length; i++) {
        recorder.add(
          'sorted',
          [i],
          0,
          `Shared node: ${listA[i]}`,
          [...combined],
          {}
        );
      }

      break;
    }

    pA++;
    pB++;
  }

  if (!intersectionFound) {
    recorder.add(
      'message',
      [],
      4,
      `No intersection found - lists do not share any nodes.`,
      [...combined],
      {}
    );
  }

  recorder.add(
    'message',
    [],
    0,
    `Intersection detection complete!`,
    [...combined],
    {}
  );

  return recorder.getSteps();
}
