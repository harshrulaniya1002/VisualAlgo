import StepRecorder from '../../engine/StepRecorder';

export const meta = {
  name: 'Linked List Reversal',
  slug: 'linked-list-reversal',
  category: 'linked-lists',
  timeComplexity: { best: 'O(n)', average: 'O(n)', worst: 'O(n)' },
  spaceComplexity: 'O(1)',
  description:
    'Reverses a singly linked list in-place by re-pointing each node\'s next pointer. Uses three pointers (prev, curr, next) to iterate through the list and reverse links one at a time.',
  rendererType: 'bar',
  pseudocode: [
    'prev = null, curr = head',
    'while curr != null:',
    '  next = curr.next',
    '  curr.next = prev',
    '  prev = curr',
    '  curr = next',
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

  recorder.add(
    'message',
    [],
    0,
    `Starting linked list reversal on ${n} nodes: [${arr.join(' -> ')}]`,
    [...arr],
    {}
  );

  // Simulate reversal using array operations
  // prev starts as null, curr starts at index 0
  let prev = -1; // -1 means null
  let curr = 0;

  recorder.add(
    'highlight',
    [0],
    0,
    `Initialize: prev = null, curr = node[0] (value ${arr[0]})`,
    [...arr],
    { prev, curr }
  );

  const result = [];

  while (curr < n) {
    const next = curr + 1 < n ? curr + 1 : -1;

    // Show current pointers
    const indices = [curr];
    if (prev >= 0) indices.push(prev);
    if (next >= 0) indices.push(next);

    recorder.add(
      'visit',
      indices,
      2,
      `Save next: next = ${next >= 0 ? `node[${next}] (value ${arr[next]})` : 'null'}`,
      [...arr],
      { prev, curr, next }
    );

    // Reverse the link: curr.next = prev
    recorder.add(
      'swap',
      prev >= 0 ? [curr, prev] : [curr],
      3,
      `Reverse link: node[${curr}].next = ${prev >= 0 ? `node[${prev}] (value ${arr[prev]})` : 'null'}`,
      [...arr],
      { prev, curr, next }
    );

    // Move prev and curr forward
    const oldCurr = curr;
    prev = curr;
    curr = next >= 0 ? next : n;

    recorder.add(
      'compare',
      curr < n ? [prev, curr] : [prev],
      4,
      `Advance: prev = node[${prev}] (value ${arr[prev]}), curr = ${curr < n ? `node[${curr}] (value ${arr[curr]})` : 'null'}`,
      [...arr],
      { prev, curr: curr < n ? curr : -1 }
    );
  }

  // Now actually reverse the array to show final result
  const reversed = [...arr].reverse();

  recorder.add(
    'message',
    [],
    0,
    `Reversal complete. New head = node with value ${arr[n - 1]}`,
    [...reversed],
    {}
  );

  // Mark all as sorted/done
  for (let i = 0; i < n; i++) {
    recorder.add(
      'sorted',
      [i],
      0,
      `Node ${reversed[i]} is in position ${i}`,
      [...reversed],
      {}
    );
  }

  recorder.add(
    'message',
    [],
    0,
    `Reversed list: [${reversed.join(' -> ')}]`,
    [...reversed],
    {}
  );

  return recorder.getSteps();
}
