import StepRecorder from '../../engine/StepRecorder';

export const meta = {
  name: 'Heap Sort',
  slug: 'heap-sort',
  category: 'sorting',
  timeComplexity: {
    best: 'O(n log n)',
    average: 'O(n log n)',
    worst: 'O(n log n)',
  },
  spaceComplexity: 'O(1)',
  stable: false,
  description:
    'Heap Sort uses a binary max-heap data structure. It first builds a max-heap from the input, then repeatedly extracts the maximum element from the heap and places it at the end of the sorted portion of the array.',
  rendererType: 'bar',
  pseudocode: [
    'buildMaxHeap:',
    '  for i = n/2 - 1 down to 0',
    '    heapify(arr, n, i)',
    'for i = n - 1 down to 1',
    '  swap(arr[0], arr[i])',
    '  heapify(arr, i, 0)',
    'heapify(arr, size, root):',
    '  largest = root',
    '  left = 2 * root + 1',
    '  right = 2 * root + 2',
    '  if left < size and arr[left] > arr[largest]',
    '    largest = left',
    '  if right < size and arr[right] > arr[largest]',
    '    largest = right',
    '  if largest != root',
    '    swap(arr[root], arr[largest])',
    '    heapify(arr, size, largest)',
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

export const defaultInput = [12, 11, 13, 5, 6, 7];

export function generateSteps(input) {
  const recorder = new StepRecorder();
  const arr = [...input];
  const n = arr.length;

  recorder.add(
    'message',
    [],
    0,
    `Starting Heap Sort on array of ${n} elements`,
    [...arr],
    {}
  );

  function heapify(size, root) {
    let largest = root;
    const left = 2 * root + 1;
    const right = 2 * root + 2;

    recorder.add(
      'highlight',
      [root],
      7,
      `Heapify: check node at index ${root} (value ${arr[root]})`,
      [...arr],
      { root, left, right }
    );

    if (left < size) {
      recorder.add(
        'compare',
        [left, largest],
        10,
        `Compare left child arr[${left}] = ${arr[left]} with arr[${largest}] = ${arr[largest]}`,
        [...arr],
        {}
      );

      if (arr[left] > arr[largest]) {
        largest = left;

        recorder.add(
          'highlight',
          [largest],
          11,
          `Left child ${arr[largest]} is larger, update largest = ${largest}`,
          [...arr],
          {}
        );
      }
    }

    if (right < size) {
      recorder.add(
        'compare',
        [right, largest],
        12,
        `Compare right child arr[${right}] = ${arr[right]} with arr[${largest}] = ${arr[largest]}`,
        [...arr],
        {}
      );

      if (arr[right] > arr[largest]) {
        largest = right;

        recorder.add(
          'highlight',
          [largest],
          13,
          `Right child ${arr[largest]} is larger, update largest = ${largest}`,
          [...arr],
          {}
        );
      }
    }

    if (largest !== root) {
      [arr[root], arr[largest]] = [arr[largest], arr[root]];

      recorder.add(
        'swap',
        [root, largest],
        15,
        `Swap arr[${root}] and arr[${largest}] to maintain heap property`,
        [...arr],
        {}
      );

      heapify(size, largest);
    }
  }

  // Build max heap
  recorder.add(
    'message',
    [],
    0,
    'Phase 1: Building max-heap',
    [...arr],
    {}
  );

  for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
    recorder.add(
      'message',
      [i],
      1,
      `Heapify subtree rooted at index ${i}`,
      [...arr],
      {}
    );

    heapify(n, i);
  }

  recorder.add(
    'message',
    [],
    0,
    'Max-heap built! Phase 2: Extract elements',
    [...arr],
    {}
  );

  // Extract elements from heap one by one
  for (let i = n - 1; i > 0; i--) {
    // Move root (maximum) to end
    [arr[0], arr[i]] = [arr[i], arr[0]];

    recorder.add(
      'swap',
      [0, i],
      4,
      `Swap max element arr[0] = ${arr[i]} with arr[${i}] = ${arr[0]}`,
      [...arr],
      {}
    );

    recorder.add(
      'sorted',
      [i],
      4,
      `Element ${arr[i]} is now in its sorted position at index ${i}`,
      [...arr],
      {}
    );

    // Heapify reduced heap
    heapify(i, 0);
  }

  // Mark the first element as sorted
  recorder.add(
    'sorted',
    [0],
    0,
    `Element ${arr[0]} is in its sorted position`,
    [...arr],
    {}
  );

  recorder.add('message', [], 0, 'Heap Sort complete!', [...arr], {});

  return recorder.getSteps();
}
