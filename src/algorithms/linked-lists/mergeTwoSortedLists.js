import StepRecorder from '../../engine/StepRecorder';

export const meta = {
  name: 'Merge Two Sorted Lists',
  slug: 'merge-two-sorted-lists',
  category: 'linked-lists',
  timeComplexity: { best: 'O(n + m)', average: 'O(n + m)', worst: 'O(n + m)' },
  spaceComplexity: 'O(1)',
  description:
    'Merges two sorted linked lists into one sorted list by comparing nodes from each list sequentially and linking them in order.',
  rendererType: 'bar',
  pseudocode: [
    'p1 = list1.head, p2 = list2.head',
    'while p1 != null and p2 != null:',
    '  if p1.val <= p2.val:',
    '    append p1; p1 = p1.next',
    '  else:',
    '    append p2; p2 = p2.next',
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

// Two sorted lists concatenated: [list1 | list2]
export const defaultInput = [5, 15, 30, 45, 10, 20, 25, 50];

export function generateSteps(input) {
  const recorder = new StepRecorder();
  const arr = [...input];
  const n = arr.length;

  // Split into two sorted lists
  const mid = Math.floor(n / 2);
  const list1 = arr.slice(0, mid).sort((a, b) => a - b);
  const list2 = arr.slice(mid).sort((a, b) => a - b);

  // Show both lists as a combined array for visualization
  const combined = [...list1, ...list2];

  recorder.add(
    'message',
    [],
    0,
    `Merging two sorted lists: List1 = [${list1.join(' -> ')}], List2 = [${list2.join(' -> ')}]`,
    [...combined],
    { list1Length: list1.length, list2Length: list2.length }
  );

  let p1 = 0;
  let p2 = 0;
  const merged = [];

  recorder.add(
    'highlight',
    [0, mid],
    0,
    `Initialize pointers: p1 at List1[0] = ${list1[0]}, p2 at List2[0] = ${list2[0]}`,
    [...combined],
    { p1: 0, p2: mid }
  );

  while (p1 < list1.length && p2 < list2.length) {
    const idx1 = p1;
    const idx2 = mid + p2;

    recorder.add(
      'compare',
      [idx1, idx2],
      1,
      `Compare List1[${p1}] = ${list1[p1]} with List2[${p2}] = ${list2[p2]}`,
      [...combined],
      { p1: idx1, p2: idx2 }
    );

    if (list1[p1] <= list2[p2]) {
      merged.push(list1[p1]);
      recorder.add(
        'insert',
        [idx1],
        3,
        `${list1[p1]} <= ${list2[p2]}: Append ${list1[p1]} from List1 to merged result`,
        [...combined],
        { merged: [...merged] }
      );
      p1++;
    } else {
      merged.push(list2[p2]);
      recorder.add(
        'insert',
        [idx2],
        5,
        `${list2[p2]} < ${list1[p1]}: Append ${list2[p2]} from List2 to merged result`,
        [...combined],
        { merged: [...merged] }
      );
      p2++;
    }
  }

  // Append remaining elements from list1
  while (p1 < list1.length) {
    merged.push(list1[p1]);
    recorder.add(
      'insert',
      [p1],
      3,
      `List2 exhausted. Append remaining ${list1[p1]} from List1`,
      [...combined],
      { merged: [...merged] }
    );
    p1++;
  }

  // Append remaining elements from list2
  while (p2 < list2.length) {
    merged.push(list2[p2]);
    recorder.add(
      'insert',
      [mid + p2],
      5,
      `List1 exhausted. Append remaining ${list2[p2]} from List2`,
      [...combined],
      { merged: [...merged] }
    );
    p2++;
  }

  // Show final merged list
  recorder.add(
    'message',
    [],
    0,
    `Merge complete!`,
    [...merged],
    {}
  );

  for (let i = 0; i < merged.length; i++) {
    recorder.add(
      'sorted',
      [i],
      0,
      `Merged[${i}] = ${merged[i]}`,
      [...merged],
      {}
    );
  }

  recorder.add(
    'message',
    [],
    0,
    `Merged sorted list: [${merged.join(' -> ')}]`,
    [...merged],
    {}
  );

  return recorder.getSteps();
}
