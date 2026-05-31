import StepRecorder from '../../engine/StepRecorder';

export const meta = {
  name: 'Sliding Window Maximum',
  slug: 'sliding-window-maximum',
  category: 'stacks-queues',
  timeComplexity: { best: 'O(n)', average: 'O(n)', worst: 'O(n)' },
  spaceComplexity: 'O(k)',
  description:
    'Finds the maximum element in each sliding window of size k using a monotonic deque. The deque stores indices in decreasing order of their values, so the front always holds the index of the current window maximum.',
  rendererType: 'bar',
  pseudocode: [
    'for i = 0 to n - 1:',
    '  remove indices outside window from front',
    '  while deque.back value <= arr[i]: remove back',
    '  add i to deque',
    '  if i >= k-1: max = arr[deque.front]',
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
  const deque = []; // stores indices, values in decreasing order
  const result = [];

  recorder.add(
    'message',
    [],
    0,
    `Finding the maximum in each sliding window of size k=${k}.`,
    [...arr],
    { k }
  );

  for (let i = 0; i < n; i++) {
    recorder.add(
      'visit',
      [i],
      0,
      `Processing arr[${i}] = ${arr[i]}. Window: [${Math.max(0, i - k + 1)}..${i}].`,
      [...arr],
      { deque: [...deque] }
    );

    // Remove indices that are out of the current window
    while (deque.length > 0 && deque[0] <= i - k) {
      const removed = deque.shift();
      recorder.add(
        'eliminate',
        [removed],
        1,
        `Remove index ${removed} from front (outside window [${i - k + 1}..${i}]).`,
        [...arr],
        { operation: 'removeFront', removedIndex: removed }
      );
    }

    // Remove indices with values smaller than or equal to current
    while (deque.length > 0 && arr[deque[deque.length - 1]] <= arr[i]) {
      const removed = deque.pop();
      recorder.add(
        'compare',
        [removed, i],
        2,
        `Remove index ${removed} from back: arr[${removed}]=${arr[removed]} <= arr[${i}]=${arr[i]}.`,
        [...arr],
        { operation: 'removeBack', removedIndex: removed }
      );
    }

    // Add current index
    deque.push(i);
    recorder.add(
      'insert',
      [i],
      3,
      `Add index ${i} to deque. Deque indices: [${deque.join(', ')}], values: [${deque.map(d => arr[d]).join(', ')}].`,
      [...arr],
      { deque: [...deque] }
    );

    // Record maximum when window is complete
    if (i >= k - 1) {
      const maxVal = arr[deque[0]];
      result.push(maxVal);

      // Highlight the window
      const windowIndices = [];
      for (let j = i - k + 1; j <= i; j++) windowIndices.push(j);

      recorder.add(
        'sorted',
        [deque[0]],
        4,
        `Window [${i - k + 1}..${i}]: maximum = ${maxVal} at index ${deque[0]}. Results: [${result.join(', ')}].`,
        [...arr],
        { windowMax: maxVal, windowIndices, result: [...result] }
      );
    }
  }

  recorder.add(
    'message',
    [],
    4,
    `Sliding Window Maximum complete. Results: [${result.join(', ')}].`,
    [...arr],
    { result }
  );

  return recorder.getSteps();
}
