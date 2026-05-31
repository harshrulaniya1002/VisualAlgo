import StepRecorder from '../../engine/StepRecorder';

export const meta = {
  name: "Floyd's Cycle Detection",
  slug: 'floyds-cycle-detection',
  category: 'linked-lists',
  timeComplexity: { best: 'O(n)', average: 'O(n)', worst: 'O(n)' },
  spaceComplexity: 'O(1)',
  description:
    'Detects a cycle in a linked list using two pointers: a slow pointer moving one step at a time and a fast pointer moving two steps. If they meet, a cycle exists.',
  rendererType: 'bar',
  pseudocode: [
    'slow = head, fast = head',
    'while fast != null and fast.next != null:',
    '  slow = slow.next',
    '  fast = fast.next.next',
    '  if slow == fast:',
    '    return "Cycle detected"',
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

// Array where last element "points back" to index 2, simulating a cycle
export const defaultInput = [10, 20, 30, 40, 50, 60];

export function generateSteps(input) {
  const recorder = new StepRecorder();
  const arr = [...input];
  const n = arr.length;

  // Simulate a cycle: the last node points back to index cycleStart
  const cycleStart = Math.min(2, n - 2);

  recorder.add(
    'message',
    [],
    0,
    `Linked list: [${arr.join(' -> ')}]. Last node (${arr[n - 1]}) points back to node[${cycleStart}] (value ${arr[cycleStart]}), creating a cycle.`,
    [...arr],
    { cycleStart }
  );

  let slow = 0;
  let fast = 0;
  let step = 0;
  let cycleDetected = false;

  recorder.add(
    'highlight',
    [0],
    0,
    `Initialize: slow = node[0] (value ${arr[0]}), fast = node[0] (value ${arr[0]})`,
    [...arr],
    { slow, fast }
  );

  // Simulate traversal with cycle
  // Build the traversal order considering the cycle
  const maxSteps = n * 3; // Limit to prevent infinite loops in visualization
  while (step < maxSteps) {
    step++;

    // Move slow one step
    const oldSlow = slow;
    if (slow === n - 1) {
      slow = cycleStart; // Cycle back
    } else {
      slow = slow + 1;
    }

    // Move fast two steps
    const oldFast = fast;
    for (let i = 0; i < 2; i++) {
      if (fast === n - 1) {
        fast = cycleStart; // Cycle back
      } else {
        fast = fast + 1;
      }
    }

    recorder.add(
      'compare',
      [slow, fast],
      2,
      `Step ${step}: Move slow to node[${slow}] (value ${arr[slow]}), fast to node[${fast}] (value ${arr[fast]})`,
      [...arr],
      { slow, fast, step }
    );

    if (slow === fast) {
      cycleDetected = true;
      recorder.add(
        'found',
        [slow],
        4,
        `Cycle detected! Slow and fast meet at node[${slow}] (value ${arr[slow]})`,
        [...arr],
        { slow, fast, meetingPoint: slow }
      );

      // Find cycle start
      recorder.add(
        'message',
        [],
        0,
        `Finding cycle start: reset one pointer to head`,
        [...arr],
        {}
      );

      let ptr1 = 0;
      let ptr2 = slow;

      recorder.add(
        'highlight',
        [ptr1, ptr2],
        0,
        `Set ptr1 = head (node[0]), ptr2 = meeting point (node[${ptr2}])`,
        [...arr],
        { ptr1, ptr2 }
      );

      while (ptr1 !== ptr2) {
        ptr1 = ptr1 === n - 1 ? cycleStart : ptr1 + 1;
        ptr2 = ptr2 === n - 1 ? cycleStart : ptr2 + 1;

        recorder.add(
          'compare',
          [ptr1, ptr2],
          0,
          `Move both one step: ptr1 = node[${ptr1}] (${arr[ptr1]}), ptr2 = node[${ptr2}] (${arr[ptr2]})`,
          [...arr],
          { ptr1, ptr2 }
        );
      }

      recorder.add(
        'found',
        [ptr1],
        5,
        `Cycle starts at node[${ptr1}] (value ${arr[ptr1]})`,
        [...arr],
        { cycleStart: ptr1 }
      );

      break;
    }
  }

  if (!cycleDetected) {
    recorder.add(
      'message',
      [],
      5,
      'No cycle detected in the linked list.',
      [...arr],
      {}
    );
  }

  recorder.add(
    'message',
    [],
    0,
    `Floyd's cycle detection complete.`,
    [...arr],
    {}
  );

  return recorder.getSteps();
}
