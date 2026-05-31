import StepRecorder from '../../engine/StepRecorder';

export const meta = {
  name: 'Min Stack',
  slug: 'min-stack',
  category: 'stacks-queues',
  timeComplexity: { best: 'O(1)', average: 'O(1)', worst: 'O(1)' },
  spaceComplexity: 'O(n)',
  description:
    'A stack that supports push, pop, top, and retrieving the minimum element all in constant time. Uses an auxiliary stack to track minimums.',
  rendererType: 'bar',
  pseudocode: [
    'push(x): stack.push(x); if x <= minStack.top: minStack.push(x)',
    'pop(): val = stack.pop(); if val == minStack.top: minStack.pop()',
    'top(): return stack[stack.length - 1]',
    'getMin(): return minStack[minStack.length - 1]',
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

export const defaultInput = [5, 3, 7, 2, 8, 1];

export function generateSteps(input) {
  const recorder = new StepRecorder();
  const arr = [...input];
  const stack = [];
  const minStack = [];

  recorder.add(
    'message',
    [],
    0,
    'Starting Min Stack demo. We maintain a main stack and an auxiliary min stack.',
    [],
    {}
  );

  // Phase 1: Push all elements
  for (let i = 0; i < arr.length; i++) {
    stack.push(arr[i]);

    if (minStack.length === 0 || arr[i] <= minStack[minStack.length - 1]) {
      minStack.push(arr[i]);
      recorder.add(
        'insert',
        [stack.length - 1],
        0,
        `Push ${arr[i]}. New minimum found! Min stack: [${minStack.join(', ')}]. Current min = ${minStack[minStack.length - 1]}.`,
        [...stack],
        { operation: 'push', value: arr[i], minStack: [...minStack], currentMin: minStack[minStack.length - 1] }
      );
    } else {
      recorder.add(
        'insert',
        [stack.length - 1],
        0,
        `Push ${arr[i]}. Min unchanged. Min stack: [${minStack.join(', ')}]. Current min = ${minStack[minStack.length - 1]}.`,
        [...stack],
        { operation: 'push', value: arr[i], minStack: [...minStack], currentMin: minStack[minStack.length - 1] }
      );
    }
  }

  // Phase 2: Show getMin
  recorder.add(
    'visit',
    [stack.length - 1],
    3,
    `getMin() = ${minStack[minStack.length - 1]}. Top = ${stack[stack.length - 1]}.`,
    [...stack],
    { operation: 'getMin', min: minStack[minStack.length - 1] }
  );

  // Phase 3: Pop all elements, showing min updates
  while (stack.length > 0) {
    const topIdx = stack.length - 1;
    const val = stack.pop();

    if (val === minStack[minStack.length - 1]) {
      minStack.pop();
      const newMin = minStack.length > 0 ? minStack[minStack.length - 1] : 'N/A';
      recorder.add(
        'swap',
        [topIdx],
        1,
        `Pop ${val} (was the current minimum). New min = ${newMin}. Min stack: [${minStack.join(', ')}].`,
        [...stack],
        { operation: 'pop', value: val, minStack: [...minStack], currentMin: newMin }
      );
    } else {
      recorder.add(
        'swap',
        [topIdx],
        1,
        `Pop ${val}. Min unchanged = ${minStack[minStack.length - 1]}. Min stack: [${minStack.join(', ')}].`,
        [...stack],
        { operation: 'pop', value: val, minStack: [...minStack], currentMin: minStack[minStack.length - 1] }
      );
    }
  }

  recorder.add(
    'message',
    [],
    0,
    'Min Stack operations complete. All push, pop, top, and getMin operations run in O(1).',
    [],
    {}
  );

  return recorder.getSteps();
}
