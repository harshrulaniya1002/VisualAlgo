import StepRecorder from '../../engine/StepRecorder';

export const meta = {
  name: 'Next Greater Element',
  slug: 'next-greater-element',
  category: 'stacks-queues',
  timeComplexity: { best: 'O(n)', average: 'O(n)', worst: 'O(n)' },
  spaceComplexity: 'O(n)',
  description:
    'For each element in the array, finds the next element that is greater using a stack. Traverses from right to left, maintaining a stack of candidates.',
  rendererType: 'bar',
  pseudocode: [
    'for i = n-1 down to 0:',
    '  while stack not empty and stack.top <= arr[i]:',
    '    pop from stack',
    '  result[i] = stack empty ? -1 : stack.top',
    '  push arr[i] onto stack',
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

export const defaultInput = [4, 5, 2, 10, 8];

export function generateSteps(input) {
  const recorder = new StepRecorder();
  const arr = [...input];
  const n = arr.length;
  const stack = [];
  const result = new Array(n).fill(-1);

  recorder.add(
    'message',
    [],
    0,
    `Finding next greater element for each position. Scanning from right to left.`,
    [...arr],
    {}
  );

  for (let i = n - 1; i >= 0; i--) {
    recorder.add(
      'visit',
      [i],
      0,
      `Processing arr[${i}] = ${arr[i]}. Stack: [${stack.join(', ')}].`,
      [...arr],
      { stack: [...stack] }
    );

    // Pop elements that are not greater
    while (stack.length > 0 && stack[stack.length - 1] <= arr[i]) {
      const popped = stack.pop();
      recorder.add(
        'compare',
        [i],
        1,
        `Pop ${popped} from stack (${popped} <= ${arr[i]}, not a valid next greater). Stack: [${stack.join(', ')}].`,
        [...arr],
        { operation: 'pop', popped }
      );
    }

    // Determine result
    if (stack.length > 0) {
      result[i] = stack[stack.length - 1];
      recorder.add(
        'sorted',
        [i],
        3,
        `Next greater element for arr[${i}] = ${arr[i]} is ${result[i]}. Stack: [${stack.join(', ')}].`,
        [...arr],
        { result: [...result] }
      );
    } else {
      result[i] = -1;
      recorder.add(
        'eliminate',
        [i],
        3,
        `No next greater element for arr[${i}] = ${arr[i]}. Result = -1.`,
        [...arr],
        { result: [...result] }
      );
    }

    // Push current element
    stack.push(arr[i]);
    recorder.add(
      'insert',
      [i],
      4,
      `Push ${arr[i]} onto stack. Stack: [${stack.join(', ')}].`,
      [...arr],
      { stack: [...stack] }
    );
  }

  recorder.add(
    'message',
    [],
    0,
    `Next Greater Element complete. Result: [${result.join(', ')}].`,
    [...arr],
    { result }
  );

  return recorder.getSteps();
}
