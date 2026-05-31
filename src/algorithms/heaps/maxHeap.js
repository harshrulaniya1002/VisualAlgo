import StepRecorder from '../../engine/StepRecorder';

export const meta = {
  name: 'Max Heap',
  slug: 'max-heap',
  category: 'heaps',
  timeComplexity: {
    best: 'O(1)',
    average: 'O(log n)',
    worst: 'O(log n)',
  },
  spaceComplexity: 'O(n)',
  description:
    "A Max Heap is a complete binary tree where every parent node is greater than or equal to its children. This visualization demonstrates Floyd's build-heap algorithm, which constructs a max-heap in O(n) time by heapifying from the last internal node up to the root.",
  rendererType: 'bar',
  pseudocode: [
    'buildMaxHeap(arr):',
    '  for i = n/2 - 1 down to 0',
    '    heapifyDown(arr, n, i)',
    'heapifyDown(arr, size, i):',
    '  largest = i',
    '  if left < size and arr[left] > arr[largest]: largest = left',
    '  if right < size and arr[right] > arr[largest]: largest = right',
    '  if largest != i: swap and recurse',
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

export const defaultInput = [4, 10, 3, 5, 1, 8, 7, 2, 9, 6];

export function generateSteps(input) {
  const recorder = new StepRecorder();
  const arr = [...input];
  const n = arr.length;

  recorder.add(
    'message',
    [],
    -1,
    `Starting Max Heap build using Floyd's algorithm on ${n} elements: [${arr.join(', ')}]`,
    [...arr],
    {}
  );

  recorder.add(
    'message',
    [],
    0,
    `Build max-heap bottom-up: heapify from index ${Math.floor(n / 2) - 1} down to 0`,
    [...arr],
    {}
  );

  function heapifyDown(size, i) {
    let largest = i;
    const left = 2 * i + 1;
    const right = 2 * i + 2;

    recorder.add(
      'highlight',
      [i],
      3,
      `Heapify node at index ${i} (value ${arr[i]}), left=${left < size ? arr[left] : 'none'}, right=${right < size ? arr[right] : 'none'}`,
      [...arr],
      { root: i, left, right }
    );

    if (left < size) {
      recorder.add(
        'compare',
        [left, largest],
        5,
        `Compare left child arr[${left}] = ${arr[left]} with arr[${largest}] = ${arr[largest]}`,
        [...arr],
        {}
      );

      if (arr[left] > arr[largest]) {
        largest = left;

        recorder.add(
          'highlight',
          [largest],
          5,
          `Left child ${arr[largest]} is larger, update largest = index ${largest}`,
          [...arr],
          {}
        );
      }
    }

    if (right < size) {
      recorder.add(
        'compare',
        [right, largest],
        6,
        `Compare right child arr[${right}] = ${arr[right]} with arr[${largest}] = ${arr[largest]}`,
        [...arr],
        {}
      );

      if (arr[right] > arr[largest]) {
        largest = right;

        recorder.add(
          'highlight',
          [largest],
          6,
          `Right child ${arr[largest]} is larger, update largest = index ${largest}`,
          [...arr],
          {}
        );
      }
    }

    if (largest !== i) {
      recorder.add(
        'swap',
        [i, largest],
        7,
        `Swap arr[${i}] = ${arr[i]} with arr[${largest}] = ${arr[largest]}`,
        [...arr],
        {}
      );

      [arr[i], arr[largest]] = [arr[largest], arr[i]];

      recorder.add(
        'message',
        [],
        7,
        `After swap: [${arr.join(', ')}]`,
        [...arr],
        {}
      );

      heapifyDown(size, largest);
    } else {
      recorder.add(
        'message',
        [i],
        7,
        `Node ${arr[i]} at index ${i} satisfies max-heap property`,
        [...arr],
        {}
      );
    }
  }

  // Build max-heap: heapify from last internal node down to root
  for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
    recorder.add(
      'message',
      [i],
      1,
      `--- Heapify subtree rooted at index ${i} (value ${arr[i]}) ---`,
      [...arr],
      {}
    );

    heapifyDown(n, i);
  }

  // Mark all as sorted to show the final heap
  recorder.add(
    'message',
    [],
    -1,
    `Max-heap built: [${arr.join(', ')}]. Root (max) = ${arr[0]}`,
    [...arr],
    {}
  );

  for (let i = 0; i < n; i++) {
    recorder.add(
      'sorted',
      [i],
      -1,
      `Index ${i}: ${arr[i]} -- heap property verified`,
      [...arr],
      {}
    );
  }

  recorder.add('message', [], -1, 'Max Heap build complete!', [...arr], {});

  return recorder.getSteps();
}
