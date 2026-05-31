import StepRecorder from '../../engine/StepRecorder';

export const meta = {
  name: 'Monotonic Queue',
  slug: 'monotonic-queue',
  category: 'stacks-queues',
  timeComplexity: { best: 'O(n)', average: 'O(n)', worst: 'O(n)' },
  spaceComplexity: 'O(k)',
  description:
    'Maintains a monotonic deque to efficiently track the maximum in each sliding window of size k. Elements are removed from the back if they are smaller than the incoming element, and from the front if they fall outside the window.',
  rendererType: 'bar',
  pseudocode: [
    'for i = 0 to n - 1:',
    '  remove front if out of window',
    '  while deque.back < arr[i]: remove back',
    '  add i to deque',
    '  if i >= k-1: result.push(arr[deque.front])',
  ],
  inputSchema: {
    type: 'array',
    hasTarget: true,
    constraints: {
      minLength: 2,
      maxLength: 50,
      minValue: 0,
      maxValue: 999,
    },
  },
};

export const defaultInput = {
  array: [1, 3, -1, -3, 5, 3, 6, 7],
  target: 3,
};

export function generateSteps(input) {
  const recorder = new StepRecorder();
  const { array, target: k } = input;
  const arr = [...array];
  const n = arr.length;
  const deque = []; // stores indices
  const result = [];

  recorder.add(
    'message',
    [],
    0,
    `Finding maximum in each sliding window of size k=${k} using a monotonic deque.`,
    [...arr],
    { k }
  );

  for (let i = 0; i < n; i++) {
    recorder.add(
      'visit',
      [i],
      0,
      `Processing element arr[${i}] = ${arr[i]}.`,
      [...arr],
      { deque: [...deque], windowStart: Math.max(0, i - k + 1) }
    );

    // Remove front element if it's outside the window
    if (deque.length > 0 && deque[0] <= i - k) {
      const removed = deque.shift();
      recorder.add(
        'swap',
        [removed],
        1,
        `Remove index ${removed} from front of deque (outside window). Deque indices: [${deque.join(', ')}].`,
        [...arr],
        { operation: 'removeFront', removedIndex: removed }
      );
    }

    // Remove elements from back that are smaller than current
    while (deque.length > 0 && arr[deque[deque.length - 1]] <= arr[i]) {
      const removed = deque.pop();
      recorder.add(
        'compare',
        [removed, i],
        2,
        `Remove index ${removed} (value ${arr[removed]}) from back: ${arr[removed]} <= ${arr[i]}. Deque indices: [${deque.join(', ')}].`,
        [...arr],
        { operation: 'removeBack', removedIndex: removed }
      );
    }

    // Add current index to deque
    deque.push(i);
    recorder.add(
      'insert',
      [i],
      3,
      `Add index ${i} to deque. Deque indices: [${deque.join(', ')}], values: [${deque.map(d => arr[d]).join(', ')}].`,
      [...arr],
      { deque: [...deque] }
    );

    // Record window maximum when window is full
    if (i >= k - 1) {
      const maxVal = arr[deque[0]];
      result.push(maxVal);
      recorder.add(
        'sorted',
        [deque[0]],
        4,
        `Window [${i - k + 1}..${i}] maximum = ${maxVal} (at index ${deque[0]}). Results so far: [${result.join(', ')}].`,
        [...arr],
        { windowMax: maxVal, result: [...result] }
      );
    }
  }

  recorder.add(
    'message',
    [],
    4,
    `Monotonic queue complete. Window maximums: [${result.join(', ')}].`,
    [...arr],
    { result }
  );

  return recorder.getSteps();
}
