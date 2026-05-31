import StepRecorder from '../../engine/StepRecorder';

export const meta = {
  name: 'Stack Operations',
  slug: 'stack-operations',
  category: 'stacks-queues',
  timeComplexity: { best: 'O(1)', average: 'O(1)', worst: 'O(1)' },
  spaceComplexity: 'O(n)',
  description:
    'Demonstrates push, pop, peek, and isEmpty operations on a LIFO (Last In, First Out) data structure built from the input array.',
  rendererType: 'bar',
  pseudocode: [
    'push(x): stack[++top] = x',
    'pop(): return stack[top--]',
    'peek(): return stack[top]',
    'isEmpty(): return top == -1',
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

export const defaultInput = [4, 7, 2, 9, 1, 5];

export function generateSteps(input) {
  const recorder = new StepRecorder();
  const arr = [...input];
  const stack = [];

  recorder.add(
    'message',
    [],
    0,
    'Starting Stack Operations demo. We will push all elements, then peek and pop them.',
    [],
    {}
  );

  // Phase 1: Push all elements onto the stack
  for (let i = 0; i < arr.length; i++) {
    stack.push(arr[i]);
    recorder.add(
      'insert',
      [stack.length - 1],
      0,
      `Push ${arr[i]} onto the stack. Stack size = ${stack.length}.`,
      [...stack],
      { operation: 'push', value: arr[i] }
    );
  }

  // Phase 2: Peek at the top
  recorder.add(
    'visit',
    [stack.length - 1],
    2,
    `Peek: top of stack is ${stack[stack.length - 1]}.`,
    [...stack],
    { operation: 'peek', value: stack[stack.length - 1] }
  );

  // Phase 3: Pop all elements
  while (stack.length > 0) {
    const topIdx = stack.length - 1;
    const val = stack.pop();
    recorder.add(
      'swap',
      [topIdx],
      1,
      `Pop ${val} from the stack. Stack size = ${stack.length}.`,
      [...stack],
      { operation: 'pop', value: val }
    );
  }

  // Phase 4: isEmpty check
  recorder.add(
    'message',
    [],
    3,
    `isEmpty: stack is empty (size = 0). All operations complete.`,
    [],
    { operation: 'isEmpty', result: true }
  );

  return recorder.getSteps();
}
