import StepRecorder from '../../engine/StepRecorder';

export const meta = {
  name: 'Monotonic Stack',
  slug: 'monotonic-stack',
  category: 'stacks-queues',
  timeComplexity: { best: 'O(n)', average: 'O(n)', worst: 'O(n)' },
  spaceComplexity: 'O(n)',
  description:
    'Maintains a stack where elements are always in increasing order. For each new element, we pop all larger elements before pushing, resulting in a monotonically increasing stack.',
  rendererType: 'bar',
  pseudocode: [
    'for i = 0 to n - 1:',
    '  while stack not empty and stack.top > arr[i]:',
    '    pop from stack',
    '  push arr[i] onto stack',
    'return stack',
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

export const defaultInput = [3, 1, 4, 1, 5, 9, 2, 6];

export function generateSteps(input) {
  const recorder = new StepRecorder();
  const arr = [...input];
  const stack = []; // stores values

  recorder.add(
    'message',
    [],
    0,
    `Building a monotonic increasing stack from array of ${arr.length} elements.`,
    [...arr],
    {}
  );

  for (let i = 0; i < arr.length; i++) {
    recorder.add(
      'visit',
      [i],
      0,
      `Processing element arr[${i}] = ${arr[i]}.`,
      [...arr],
      { stack: [...stack] }
    );

    // Pop elements that violate monotonic increasing property
    while (stack.length > 0 && stack[stack.length - 1] > arr[i]) {
      const popped = stack.pop();
      recorder.add(
        'swap',
        [i],
        2,
        `Pop ${popped} from stack (${popped} > ${arr[i]} violates increasing order). Stack: [${stack.join(', ')}].`,
        [...arr],
        { operation: 'pop', popped, stack: [...stack] }
      );
    }

    // Push current element
    stack.push(arr[i]);
    recorder.add(
      'insert',
      [i],
      3,
      `Push ${arr[i]} onto stack. Stack: [${stack.join(', ')}].`,
      [...arr],
      { operation: 'push', value: arr[i], stack: [...stack] }
    );
  }

  recorder.add(
    'sorted',
    Array.from({ length: stack.length }, (_, k) => k),
    4,
    `Monotonic increasing stack complete: [${stack.join(', ')}].`,
    [...stack],
    { stack: [...stack] }
  );

  return recorder.getSteps();
}
