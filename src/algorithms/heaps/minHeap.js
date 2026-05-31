import StepRecorder from '../../engine/StepRecorder';

export const meta = {
  name: 'Min Heap',
  slug: 'min-heap',
  category: 'heaps',
  timeComplexity: {
    best: 'O(1)',
    average: 'O(log n)',
    worst: 'O(log n)',
  },
  spaceComplexity: 'O(n)',
  description:
    'A Min Heap is a complete binary tree where every parent node is smaller than or equal to its children. This visualization shows inserting elements one by one with heapify-up to restore the heap property, then extracting the minimum element repeatedly with heapify-down.',
  rendererType: 'bar',
  pseudocode: [
    'insert(val):',
    '  heap.push(val)',
    '  heapifyUp(heap.length - 1)',
    'heapifyUp(i):',
    '  while i > 0 and heap[i] < heap[parent(i)]',
    '    swap(heap[i], heap[parent(i)])',
    'extractMin():',
    '  swap(heap[0], heap[last])',
    '  heap.pop(); heapifyDown(0)',
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

export const defaultInput = [35, 33, 42, 10, 14, 19, 27, 44, 26, 31];

export function generateSteps(input) {
  const recorder = new StepRecorder();
  const values = [...input];
  const heap = [];

  recorder.add(
    'message',
    [],
    -1,
    `Starting Min Heap operations with ${values.length} elements`,
    [...heap],
    {}
  );

  // Phase 1: Insert elements one by one with heapify-up
  recorder.add(
    'message',
    [],
    0,
    'Phase 1: Insert elements into the min-heap one by one',
    [...heap],
    {}
  );

  for (let v = 0; v < values.length; v++) {
    const val = values[v];
    heap.push(val);
    const insertIdx = heap.length - 1;

    recorder.add(
      'insert',
      [insertIdx],
      1,
      `Insert ${val} at index ${insertIdx}`,
      [...heap],
      {}
    );

    // Heapify-up
    let i = insertIdx;
    while (i > 0) {
      const parent = Math.floor((i - 1) / 2);

      recorder.add(
        'compare',
        [i, parent],
        4,
        `Compare heap[${i}] = ${heap[i]} with parent heap[${parent}] = ${heap[parent]}`,
        [...heap],
        {}
      );

      if (heap[i] < heap[parent]) {
        [heap[i], heap[parent]] = [heap[parent], heap[i]];

        recorder.add(
          'swap',
          [i, parent],
          5,
          `Swap ${heap[parent]} (index ${i}) with ${heap[i]} (index ${parent}) -- child is smaller`,
          [...heap],
          {}
        );

        i = parent;
      } else {
        recorder.add(
          'message',
          [i],
          4,
          `Heap property satisfied: ${heap[i]} >= parent ${heap[parent]}`,
          [...heap],
          {}
        );
        break;
      }
    }

    if (i === 0 && heap.length > 1) {
      recorder.add(
        'message',
        [0],
        4,
        `Element ${heap[0]} reached the root`,
        [...heap],
        {}
      );
    }
  }

  recorder.add(
    'message',
    [],
    -1,
    `Min-heap built: [${heap.join(', ')}]. Minimum = ${heap[0]}`,
    [...heap],
    {}
  );

  // Phase 2: Extract-min operations
  recorder.add(
    'message',
    [],
    6,
    'Phase 2: Extract minimum elements one by one',
    [...heap],
    {}
  );

  while (heap.length > 1) {
    const min = heap[0];
    const last = heap.length - 1;

    recorder.add(
      'highlight',
      [0],
      6,
      `Extract min = ${min} from root`,
      [...heap],
      {}
    );

    // Swap root with last element
    [heap[0], heap[last]] = [heap[last], heap[0]];

    recorder.add(
      'swap',
      [0, last],
      7,
      `Swap root ${heap[last]} with last element ${heap[0]}`,
      [...heap],
      {}
    );

    heap.pop();

    recorder.add(
      'sorted',
      [],
      8,
      `Removed min = ${min}. Heap size is now ${heap.length}`,
      [...heap],
      {}
    );

    if (heap.length === 0) break;

    // Heapify-down from root
    let i = 0;
    while (true) {
      const left = 2 * i + 1;
      const right = 2 * i + 2;
      let smallest = i;

      if (left < heap.length) {
        recorder.add(
          'compare',
          [left, smallest],
          8,
          `Compare left child heap[${left}] = ${heap[left]} with heap[${smallest}] = ${heap[smallest]}`,
          [...heap],
          {}
        );

        if (heap[left] < heap[smallest]) {
          smallest = left;
        }
      }

      if (right < heap.length) {
        recorder.add(
          'compare',
          [right, smallest],
          8,
          `Compare right child heap[${right}] = ${heap[right]} with heap[${smallest}] = ${heap[smallest]}`,
          [...heap],
          {}
        );

        if (heap[right] < heap[smallest]) {
          smallest = right;
        }
      }

      if (smallest !== i) {
        [heap[i], heap[smallest]] = [heap[smallest], heap[i]];

        recorder.add(
          'swap',
          [i, smallest],
          8,
          `Swap heap[${i}] = ${heap[smallest]} with heap[${smallest}] = ${heap[i]} to restore min-heap`,
          [...heap],
          {}
        );

        i = smallest;
      } else {
        recorder.add(
          'message',
          [i],
          8,
          `Heap property restored at index ${i}`,
          [...heap],
          {}
        );
        break;
      }
    }
  }

  if (heap.length === 1) {
    recorder.add(
      'sorted',
      [0],
      -1,
      `Last element ${heap[0]} extracted. Min-heap is now empty`,
      [...heap],
      {}
    );
  }

  recorder.add('message', [], -1, 'Min Heap operations complete!', [], {});

  return recorder.getSteps();
}
