import StepRecorder from '../../engine/StepRecorder';

export const meta = {
  name: 'Fibonacci Heap',
  slug: 'fibonacci-heap',
  category: 'heaps',
  timeComplexity: {
    best: 'O(1)',
    average: 'O(1) amortized',
    worst: 'O(log n)',
  },
  spaceComplexity: 'O(n)',
  description:
    'A Fibonacci Heap is a collection of min-heap-ordered trees. It supports insert and decrease-key in O(1) amortized time, and extract-min in O(log n) amortized time. This visualization shows insert into the root list, extract-min with tree consolidation, and decrease-key with cascading cuts.',
  rendererType: 'bar',
  pseudocode: [
    'insert(val): add node to root list, update min',
    'extractMin(): remove min, add children to root list',
    '  consolidate: merge trees of same degree',
    'decreaseKey(node, newVal):',
    '  if newVal < parent: cut node to root list',
    '  cascadingCut(parent)',
    '  update min if needed',
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

export const defaultInput = [7, 3, 17, 24, 1, 21, 10];

export function generateSteps(input) {
  const recorder = new StepRecorder();
  const values = [...input];

  // We simulate the Fibonacci heap using a flat array representation
  // The bar chart shows the current state of all nodes in the heap
  let heap = []; // flat array of all node values in insertion order
  let minIdx = -1;

  recorder.add(
    'message',
    [],
    -1,
    `Starting Fibonacci Heap operations with values: [${values.join(', ')}]`,
    [...heap],
    {}
  );

  // Phase 1: Insert all elements into root list
  recorder.add(
    'message',
    [],
    0,
    'Phase 1: Insert elements into the Fibonacci heap root list',
    [...heap],
    {}
  );

  for (let i = 0; i < values.length; i++) {
    const val = values[i];
    heap.push(val);
    const idx = heap.length - 1;

    recorder.add(
      'insert',
      [idx],
      0,
      `Insert ${val} into root list at position ${idx}`,
      [...heap],
      {}
    );

    // Update minimum
    if (minIdx === -1 || heap[idx] < heap[minIdx]) {
      minIdx = idx;

      recorder.add(
        'highlight',
        [minIdx],
        0,
        `New minimum found: ${heap[minIdx]} at index ${minIdx}`,
        [...heap],
        {}
      );
    } else {
      recorder.add(
        'compare',
        [idx, minIdx],
        0,
        `${val} >= current min ${heap[minIdx]}, min unchanged`,
        [...heap],
        {}
      );
    }
  }

  recorder.add(
    'message',
    [],
    -1,
    `All elements inserted. Root list: [${heap.join(', ')}], min = ${heap[minIdx]}`,
    [...heap],
    {}
  );

  // Phase 2: Extract-min with consolidation
  recorder.add(
    'message',
    [],
    1,
    'Phase 2: Extract-min operation with consolidation',
    [...heap],
    {}
  );

  // Find and remove the minimum
  const extractedMin = heap[minIdx];

  recorder.add(
    'highlight',
    [minIdx],
    1,
    `Extract minimum = ${extractedMin} at index ${minIdx}`,
    [...heap],
    {}
  );

  // Remove min from heap array
  heap.splice(minIdx, 1);

  recorder.add(
    'delete',
    [],
    1,
    `Removed ${extractedMin} from heap. Remaining: [${heap.join(', ')}]`,
    [...heap],
    {}
  );

  // Consolidation: simulate merging trees of same degree
  // In the bar visualization, we show this as sorting/rearranging to restore heap order
  recorder.add(
    'message',
    [],
    2,
    'Consolidate: merge trees of the same degree and find new minimum',
    [...heap],
    {}
  );

  if (heap.length > 0) {
    // Simulate consolidation by building a min-heap structure
    // This represents merging binomial trees of the same degree
    for (let i = Math.floor(heap.length / 2) - 1; i >= 0; i--) {
      let current = i;
      while (true) {
        const left = 2 * current + 1;
        const right = 2 * current + 2;
        let smallest = current;

        if (left < heap.length && heap[left] < heap[smallest]) {
          smallest = left;
        }
        if (right < heap.length && heap[right] < heap[smallest]) {
          smallest = right;
        }

        if (smallest !== current) {
          recorder.add(
            'compare',
            [current, smallest],
            2,
            `Consolidate: compare ${heap[current]} with ${heap[smallest]}`,
            [...heap],
            {}
          );

          [heap[current], heap[smallest]] = [heap[smallest], heap[current]];

          recorder.add(
            'swap',
            [current, smallest],
            2,
            `Merge: swap ${heap[smallest]} and ${heap[current]}`,
            [...heap],
            {}
          );

          current = smallest;
        } else {
          break;
        }
      }
    }

    // Find new minimum
    minIdx = 0;
    for (let i = 1; i < heap.length; i++) {
      if (heap[i] < heap[minIdx]) {
        minIdx = i;
      }
    }

    recorder.add(
      'highlight',
      [minIdx],
      2,
      `After consolidation: [${heap.join(', ')}], new min = ${heap[minIdx]}`,
      [...heap],
      {}
    );
  }

  // Phase 3: Decrease-key with cascading cut
  recorder.add(
    'message',
    [],
    3,
    'Phase 3: Decrease-key operation with cascading cut',
    [...heap],
    {}
  );

  if (heap.length >= 3) {
    // Pick a node to decrease (use a non-min node)
    let targetIdx = heap.length - 1;
    const oldVal = heap[targetIdx];
    const newVal = Math.max(0, heap[minIdx] - 1); // decrease to something smaller than min

    recorder.add(
      'highlight',
      [targetIdx],
      3,
      `Decrease key of node at index ${targetIdx}: ${oldVal} -> ${newVal}`,
      [...heap],
      {}
    );

    heap[targetIdx] = newVal;

    recorder.add(
      'compute',
      [targetIdx],
      3,
      `Updated value at index ${targetIdx} from ${oldVal} to ${newVal}`,
      [...heap],
      {}
    );

    // Check if we need to cut (if new value < parent)
    const parentIdx = Math.floor((targetIdx - 1) / 2);
    if (parentIdx >= 0 && heap[targetIdx] < heap[parentIdx]) {
      recorder.add(
        'compare',
        [targetIdx, parentIdx],
        4,
        `${heap[targetIdx]} < parent ${heap[parentIdx]}: cut needed`,
        [...heap],
        {}
      );

      // Cut: move node to root list (swap up to maintain structure)
      [heap[targetIdx], heap[parentIdx]] = [heap[parentIdx], heap[targetIdx]];

      recorder.add(
        'swap',
        [targetIdx, parentIdx],
        4,
        `Cut: move ${heap[parentIdx]} up (cascading cut from parent)`,
        [...heap],
        {}
      );

      // Continue cascading cut upward
      let cascadeIdx = parentIdx;
      while (cascadeIdx > 0) {
        const cascadeParent = Math.floor((cascadeIdx - 1) / 2);
        if (heap[cascadeIdx] < heap[cascadeParent]) {
          recorder.add(
            'compare',
            [cascadeIdx, cascadeParent],
            5,
            `Cascading cut: ${heap[cascadeIdx]} < ${heap[cascadeParent]}, continue cutting`,
            [...heap],
            {}
          );

          [heap[cascadeIdx], heap[cascadeParent]] = [heap[cascadeParent], heap[cascadeIdx]];

          recorder.add(
            'swap',
            [cascadeIdx, cascadeParent],
            5,
            `Cascading cut: swap index ${cascadeIdx} and ${cascadeParent}`,
            [...heap],
            {}
          );

          cascadeIdx = cascadeParent;
        } else {
          recorder.add(
            'message',
            [cascadeIdx],
            5,
            `Cascading cut stops: ${heap[cascadeIdx]} >= parent ${heap[cascadeParent]}`,
            [...heap],
            {}
          );
          break;
        }
      }
    }

    // Update minimum
    minIdx = 0;
    for (let i = 1; i < heap.length; i++) {
      if (heap[i] < heap[minIdx]) {
        minIdx = i;
      }
    }

    recorder.add(
      'highlight',
      [minIdx],
      6,
      `After decrease-key: min = ${heap[minIdx]}. Heap: [${heap.join(', ')}]`,
      [...heap],
      {}
    );
  }

  // Mark final state
  for (let i = 0; i < heap.length; i++) {
    recorder.add(
      'sorted',
      [i],
      -1,
      `Final heap node at index ${i}: ${heap[i]}`,
      [...heap],
      {}
    );
  }

  recorder.add('message', [], -1, 'Fibonacci Heap operations complete!', [...heap], {});

  return recorder.getSteps();
}
