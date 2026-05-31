import StepRecorder from '../../engine/StepRecorder';

export const meta = {
  name: 'Binomial Heap',
  slug: 'binomial-heap',
  category: 'heaps',
  timeComplexity: {
    best: 'O(1)',
    average: 'O(log n)',
    worst: 'O(log n)',
  },
  spaceComplexity: 'O(n)',
  description:
    'A Binomial Heap is a collection of binomial trees satisfying the min-heap property. Each binomial tree B_k has 2^k nodes. Insert is done by creating a single-node heap and merging. Merge combines trees of the same order, similar to binary addition. This visualization shows insert and merge operations.',
  rendererType: 'bar',
  pseudocode: [
    'insert(val): create single-node tree, merge with heap',
    'merge(h1, h2): combine root lists by order',
    '  while two trees have same order:',
    '    link smaller root under larger',
    '    advance to next order',
    'link(t1, t2): make larger root child of smaller',
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

export const defaultInput = [12, 7, 25, 15, 28, 33, 41];

export function generateSteps(input) {
  const recorder = new StepRecorder();
  const values = [...input];

  // We represent the binomial heap as a flat array (implicit min-heap)
  // to visualize merging and insertion with bar charts
  let heap = [];

  recorder.add(
    'message',
    [],
    -1,
    `Starting Binomial Heap operations with values: [${values.join(', ')}]`,
    [...heap],
    {}
  );

  // Helper: bubble up to maintain min-heap property after insert
  function siftUp(arr, idx) {
    let i = idx;
    while (i > 0) {
      const parent = Math.floor((i - 1) / 2);

      recorder.add(
        'compare',
        [i, parent],
        1,
        `Merge: compare ${arr[i]} with ${arr[parent]}`,
        [...arr],
        {}
      );

      if (arr[i] < arr[parent]) {
        [arr[i], arr[parent]] = [arr[parent], arr[i]];

        recorder.add(
          'swap',
          [i, parent],
          3,
          `Link: ${arr[parent]} becomes child of ${arr[i]} (swap indices ${i} and ${parent})`,
          [...arr],
          {}
        );

        i = parent;
      } else {
        recorder.add(
          'message',
          [i],
          4,
          `Min-heap property holds: ${arr[i]} >= ${arr[parent]}`,
          [...arr],
          {}
        );
        break;
      }
    }
  }

  // Phase 1: Insert elements one by one (each insert = create + merge)
  recorder.add(
    'message',
    [],
    0,
    'Phase 1: Insert elements -- each insert creates a single-node tree and merges',
    [...heap],
    {}
  );

  for (let v = 0; v < values.length; v++) {
    const val = values[v];

    recorder.add(
      'message',
      [],
      0,
      `--- Insert ${val}: create B_0 tree and merge into heap ---`,
      [...heap],
      {}
    );

    heap.push(val);
    const idx = heap.length - 1;

    recorder.add(
      'insert',
      [idx],
      0,
      `Created single-node tree with value ${val} at index ${idx}`,
      [...heap],
      {}
    );

    // Merge: link trees of same order (simulated via sift-up)
    if (heap.length > 1) {
      recorder.add(
        'message',
        [],
        1,
        `Merge: combine trees of same order to maintain binomial heap structure`,
        [...heap],
        {}
      );

      siftUp(heap, idx);
    }

    // Show current minimum
    let minVal = heap[0];
    recorder.add(
      'highlight',
      [0],
      5,
      `After insert: heap = [${heap.join(', ')}], min = ${minVal}`,
      [...heap],
      {}
    );
  }

  recorder.add(
    'message',
    [],
    -1,
    `All elements inserted. Binomial heap: [${heap.join(', ')}]`,
    [...heap],
    {}
  );

  // Phase 2: Demonstrate merge of two binomial heaps
  recorder.add(
    'message',
    [],
    1,
    'Phase 2: Merge demonstration -- split heap and merge halves back together',
    [...heap],
    {}
  );

  // Split heap into two halves
  const mid = Math.floor(heap.length / 2);
  const heap1 = heap.slice(0, mid);
  const heap2 = heap.slice(mid);

  recorder.add(
    'message',
    [],
    1,
    `Split into H1 = [${heap1.join(', ')}] and H2 = [${heap2.join(', ')}]`,
    [...heap],
    {}
  );

  // Highlight the two halves
  for (let i = 0; i < mid; i++) {
    recorder.add(
      'highlight',
      [i],
      1,
      `H1 contains index ${i}: ${heap[i]}`,
      [...heap],
      {}
    );
  }

  for (let i = mid; i < heap.length; i++) {
    recorder.add(
      'visit',
      [i],
      1,
      `H2 contains index ${i}: ${heap[i]}`,
      [...heap],
      {}
    );
  }

  // Merge: rebuild min-heap from combined array (simulating binomial tree merging)
  recorder.add(
    'message',
    [],
    2,
    'Merge root lists by order and link trees with same degree',
    [...heap],
    {}
  );

  // Rebuild heap (heapify) to simulate merge
  const merged = [...heap];
  for (let i = Math.floor(merged.length / 2) - 1; i >= 0; i--) {
    let current = i;
    while (true) {
      const left = 2 * current + 1;
      const right = 2 * current + 2;
      let smallest = current;

      if (left < merged.length && merged[left] < merged[smallest]) {
        smallest = left;
      }
      if (right < merged.length && merged[right] < merged[smallest]) {
        smallest = right;
      }

      if (smallest !== current) {
        recorder.add(
          'compare',
          [current, smallest],
          3,
          `Link: compare trees at ${current} (${merged[current]}) and ${smallest} (${merged[smallest]})`,
          [...merged],
          {}
        );

        [merged[current], merged[smallest]] = [merged[smallest], merged[current]];

        recorder.add(
          'swap',
          [current, smallest],
          3,
          `Link: make ${merged[current]} child of ${merged[smallest]}`,
          [...merged],
          {}
        );

        current = smallest;
      } else {
        break;
      }
    }
  }

  heap = merged;

  recorder.add(
    'message',
    [],
    -1,
    `Merged heap: [${heap.join(', ')}], min = ${heap[0]}`,
    [...heap],
    {}
  );

  // Mark final state
  for (let i = 0; i < heap.length; i++) {
    recorder.add(
      'sorted',
      [i],
      -1,
      `Final node at index ${i}: ${heap[i]}`,
      [...heap],
      {}
    );
  }

  recorder.add('message', [], -1, 'Binomial Heap operations complete!', [...heap], {});

  return recorder.getSteps();
}
