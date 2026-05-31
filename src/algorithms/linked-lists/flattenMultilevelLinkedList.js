import StepRecorder from '../../engine/StepRecorder';

export const meta = {
  name: 'Flatten Multilevel Doubly Linked List',
  slug: 'flatten-multilevel-linked-list',
  category: 'linked-lists',
  timeComplexity: { best: 'O(n)', average: 'O(n)', worst: 'O(n)' },
  spaceComplexity: 'O(d)',
  description:
    'Flattens a multilevel doubly linked list where some nodes have child lists. Uses a stack-based approach to process child lists inline, inserting child nodes between the current node and its next node.',
  rendererType: 'bar',
  pseudocode: [
    'curr = head',
    'while curr != null:',
    '  if curr has child:',
    '    push curr.next onto stack',
    '    curr.next = curr.child',
    '  if curr.next is null and stack not empty:',
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

// Simulated multilevel list: main list with "child" sublists
// Format: values represent a multilevel structure flattened for input
export const defaultInput = [1, 2, 3, 7, 8, 4, 5, 6, 9, 10];

export function generateSteps(input) {
  const recorder = new StepRecorder();
  const arr = [...input];
  const n = arr.length;

  // Simulate a multilevel linked list:
  // Level 0: [1, 2, 3, 4, 5, 6]
  // Level 1 (child of 3): [7, 8]
  // Level 1 (child of 5): [9, 10]
  const mainList = [];
  const childMap = new Map(); // Maps main list index to child list

  // Build a simple structure from the input
  const level0Count = Math.ceil(n * 0.6);
  const level0 = arr.slice(0, level0Count);
  const remaining = arr.slice(level0Count);

  // Split remaining into child lists
  const childLists = [];
  if (remaining.length > 0) {
    const childMid = Math.ceil(remaining.length / 2);
    if (childMid > 0) childLists.push(remaining.slice(0, childMid));
    if (childMid < remaining.length) childLists.push(remaining.slice(childMid));
  }

  // Assign children to specific nodes in level 0
  const childPositions = [];
  if (childLists.length > 0 && level0.length > 1) {
    childPositions.push(Math.min(2, level0.length - 1));
    if (childLists.length > 1 && level0.length > 3) {
      childPositions.push(Math.min(4, level0.length - 1));
    }
  }

  recorder.add(
    'message',
    [],
    0,
    `Multilevel linked list: Main = [${level0.join(' -> ')}]`,
    [...level0],
    {}
  );

  for (let i = 0; i < childLists.length && i < childPositions.length; i++) {
    recorder.add(
      'message',
      [],
      0,
      `  Child of node ${level0[childPositions[i]]} (index ${childPositions[i]}): [${childLists[i].join(' -> ')}]`,
      [...level0],
      { childOf: childPositions[i], childList: childLists[i] }
    );
  }

  // Flatten process
  const result = [];
  const stack = []; // Stack for remaining parts after child insertion
  let displayArr = [...level0];
  let currIdx = 0;

  // Build the work queue: process main list, inserting children when found
  recorder.add(
    'highlight',
    [0],
    0,
    `Start at head: node ${level0[0]}`,
    [...displayArr],
    {}
  );

  let mainIdx = 0;
  while (mainIdx < level0.length || stack.length > 0) {
    if (mainIdx < level0.length) {
      const val = level0[mainIdx];
      result.push(val);

      recorder.add(
        'visit',
        [result.length - 1],
        1,
        `Visit node ${val}. Flattened so far: [${result.join(', ')}]`,
        [...result],
        { current: val }
      );

      // Check if this node has a child
      const childIdx = childPositions.indexOf(mainIdx);
      if (childIdx !== -1 && childIdx < childLists.length) {
        const childList = childLists[childIdx];

        recorder.add(
          'highlight',
          [result.length - 1],
          2,
          `Node ${val} has a child list: [${childList.join(' -> ')}]`,
          [...result],
          { childList }
        );

        // Push remaining main list onto stack
        const remainingMain = level0.slice(mainIdx + 1);
        if (remainingMain.length > 0) {
          stack.push(remainingMain);
          recorder.add(
            'compute',
            [],
            3,
            `Push remaining main nodes [${remainingMain.join(', ')}] onto stack. Stack depth: ${stack.length}`,
            [...result],
            { stack: stack.map(s => s.join(',')) }
          );
        }

        // Process child list
        recorder.add(
          'insert',
          [result.length],
          4,
          `Inserting child list [${childList.join(' -> ')}] after node ${val}`,
          [...result],
          {}
        );

        for (let c = 0; c < childList.length; c++) {
          result.push(childList[c]);
          recorder.add(
            'insert',
            [result.length - 1],
            4,
            `Insert child node ${childList[c]}. Flattened: [${result.join(', ')}]`,
            [...result],
            { current: childList[c] }
          );
        }

        // Continue from stack if this was the end of current traversal segment
        mainIdx = level0.length; // Skip to stack processing
        continue;
      }

      mainIdx++;
    } else if (stack.length > 0) {
      // Pop from stack and continue
      const resumed = stack.pop();

      recorder.add(
        'compute',
        [result.length],
        5,
        `No more nodes at this level. Pop [${resumed.join(', ')}] from stack. Stack depth: ${stack.length}`,
        [...result],
        {}
      );

      // Process the resumed list
      for (let r = 0; r < resumed.length; r++) {
        result.push(resumed[r]);

        recorder.add(
          'insert',
          [result.length - 1],
          5,
          `Resume: append node ${resumed[r]}. Flattened: [${result.join(', ')}]`,
          [...result],
          {}
        );
      }

      break; // Only one level of stack for this simplified simulation
    }
  }

  // Process any remaining stack items
  while (stack.length > 0) {
    const resumed = stack.pop();
    for (let r = 0; r < resumed.length; r++) {
      result.push(resumed[r]);
      recorder.add(
        'insert',
        [result.length - 1],
        5,
        `Resume from stack: append node ${resumed[r]}`,
        [...result],
        {}
      );
    }
  }

  // Mark all as complete
  for (let i = 0; i < result.length; i++) {
    recorder.add(
      'sorted',
      [i],
      0,
      `Position ${i}: node ${result[i]}`,
      [...result],
      {}
    );
  }

  recorder.add(
    'message',
    [],
    0,
    `Flattening complete! Result: [${result.join(' -> ')}]`,
    [...result],
    {}
  );

  return recorder.getSteps();
}
