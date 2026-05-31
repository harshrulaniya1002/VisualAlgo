import StepRecorder from '../../engine/StepRecorder';

export const meta = {
  name: 'K-Way Merge',
  slug: 'k-way-merge',
  category: 'heaps',
  timeComplexity: {
    best: 'O(n log k)',
    average: 'O(n log k)',
    worst: 'O(n log k)',
  },
  spaceComplexity: 'O(k)',
  description:
    'K-Way Merge combines k sorted arrays into a single sorted array using a min-heap of size k. The heap always holds one element from each array. We repeatedly extract the minimum, place it in the result, and insert the next element from the same source array.',
  rendererType: 'bar',
  pseudocode: [
    'parse k sorted arrays from input',
    'insert first element of each array into min-heap',
    'while heap is not empty:',
    '  min = extractMin(heap)',
    '  result.push(min)',
    '  if min\'s array has next element:',
    '    insert next element into heap',
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

// Format: k, then for each array: length followed by sorted elements
// k=3, arrays: [1,4,7], [2,5,8], [3,6,9]
export const defaultInput = [3, 3, 1, 4, 7, 3, 2, 5, 8, 3, 3, 6, 9];

export function generateSteps(input) {
  const recorder = new StepRecorder();
  const data = [...input];

  // Parse input: first element is k, then for each array: length followed by elements
  const k = data[0];
  const arrays = [];
  let pos = 1;
  for (let i = 0; i < k; i++) {
    const len = data[pos];
    pos++;
    const arr = data.slice(pos, pos + len);
    arrays.push(arr);
    pos += len;
  }

  const totalElements = arrays.reduce((sum, a) => sum + a.length, 0);
  const result = [];

  // Show initial arrays as the combined flat visualization
  const allElements = [];
  for (const arr of arrays) {
    for (const v of arr) {
      allElements.push(v);
    }
  }

  recorder.add(
    'message',
    [],
    0,
    `K-Way Merge: merging ${k} sorted arrays with ${totalElements} total elements`,
    [...allElements],
    {}
  );

  for (let i = 0; i < k; i++) {
    recorder.add(
      'message',
      [],
      0,
      `Array ${i + 1}: [${arrays[i].join(', ')}]`,
      [...allElements],
      {}
    );
  }

  // Min-heap: each entry is { value, arrayIdx, elementIdx }
  // We visualize the heap as a bar chart of current heap values
  const heap = [];
  const pointers = new Array(k).fill(0); // current index in each source array

  // Heap helper functions
  function heapParent(i) { return Math.floor((i - 1) / 2); }
  function heapLeft(i) { return 2 * i + 1; }
  function heapRight(i) { return 2 * i + 2; }

  function heapValues() {
    return heap.map(e => e.value);
  }

  function siftUp(idx) {
    let i = idx;
    while (i > 0) {
      const p = heapParent(i);
      const hv = heapValues();

      recorder.add(
        'compare',
        [i, p],
        1,
        `Heap: compare ${heap[i].value} (array ${heap[i].arrayIdx + 1}) with parent ${heap[p].value}`,
        [...hv],
        {}
      );

      if (heap[i].value < heap[p].value) {
        [heap[i], heap[p]] = [heap[p], heap[i]];

        recorder.add(
          'swap',
          [i, p],
          1,
          `Heap: swap ${heap[p].value} and ${heap[i].value}`,
          [...heapValues()],
          {}
        );

        i = p;
      } else {
        break;
      }
    }
  }

  function siftDown(idx) {
    let i = idx;
    while (true) {
      const l = heapLeft(i);
      const r = heapRight(i);
      let smallest = i;

      if (l < heap.length && heap[l].value < heap[smallest].value) {
        smallest = l;
      }
      if (r < heap.length && heap[r].value < heap[smallest].value) {
        smallest = r;
      }

      if (smallest !== i) {
        const hv = heapValues();

        recorder.add(
          'compare',
          [i, smallest],
          3,
          `Heap: ${heap[i].value} > ${heap[smallest].value}, need to swap`,
          [...hv],
          {}
        );

        [heap[i], heap[smallest]] = [heap[smallest], heap[i]];

        recorder.add(
          'swap',
          [i, smallest],
          3,
          `Heap: swap ${heap[smallest].value} down, ${heap[i].value} up`,
          [...heapValues()],
          {}
        );

        i = smallest;
      } else {
        break;
      }
    }
  }

  // Phase 1: Insert first element from each array
  recorder.add(
    'message',
    [],
    1,
    'Insert the first element of each sorted array into the min-heap',
    [...heapValues()],
    {}
  );

  for (let i = 0; i < k; i++) {
    if (arrays[i].length > 0) {
      const val = arrays[i][0];
      pointers[i] = 1; // next element to insert from this array
      heap.push({ value: val, arrayIdx: i, elementIdx: 0 });

      recorder.add(
        'insert',
        [heap.length - 1],
        1,
        `Insert ${val} from array ${i + 1} into heap`,
        [...heapValues()],
        {}
      );

      siftUp(heap.length - 1);
    }
  }

  recorder.add(
    'highlight',
    [0],
    1,
    `Initial heap: [${heapValues().join(', ')}], min = ${heap.length > 0 ? heap[0].value : 'empty'}`,
    [...heapValues()],
    {}
  );

  // Phase 2: Extract-min and insert next from same array
  recorder.add(
    'message',
    [],
    2,
    'Extract minimum from heap, then insert next element from the same source array',
    [...heapValues()],
    {}
  );

  while (heap.length > 0) {
    // Extract min (root)
    const minEntry = heap[0];

    recorder.add(
      'highlight',
      [0],
      3,
      `Extract min = ${minEntry.value} (from array ${minEntry.arrayIdx + 1})`,
      [...heapValues()],
      {}
    );

    result.push(minEntry.value);

    recorder.add(
      'sorted',
      [],
      4,
      `Add ${minEntry.value} to result: [${result.join(', ')}]`,
      [...heapValues()],
      { result: [...result] }
    );

    // Check if there is a next element in the same source array
    const srcIdx = minEntry.arrayIdx;
    const nextPos = pointers[srcIdx];

    if (nextPos < arrays[srcIdx].length) {
      // Replace root with next element from same array
      const nextVal = arrays[srcIdx][nextPos];
      pointers[srcIdx] = nextPos + 1;
      heap[0] = { value: nextVal, arrayIdx: srcIdx, elementIdx: nextPos };

      recorder.add(
        'insert',
        [0],
        6,
        `Insert next from array ${srcIdx + 1}: ${nextVal} (replaces extracted min at root)`,
        [...heapValues()],
        {}
      );

      siftDown(0);
    } else {
      // No more elements from this array, shrink heap
      if (heap.length === 1) {
        heap.pop();

        recorder.add(
          'delete',
          [],
          6,
          `Array ${srcIdx + 1} exhausted. Heap is now empty`,
          [...heapValues()],
          {}
        );
      } else {
        heap[0] = heap[heap.length - 1];
        heap.pop();

        recorder.add(
          'delete',
          [0],
          6,
          `Array ${srcIdx + 1} exhausted. Move last heap element to root`,
          [...heapValues()],
          {}
        );

        siftDown(0);
      }
    }

    if (heap.length > 0) {
      recorder.add(
        'message',
        [0],
        2,
        `Heap: [${heapValues().join(', ')}], current result: [${result.join(', ')}]`,
        [...heapValues()],
        {}
      );
    }
  }

  // Show final merged result
  recorder.add(
    'message',
    [],
    -1,
    `K-Way Merge complete! Result: [${result.join(', ')}]`,
    [...result],
    {}
  );

  for (let i = 0; i < result.length; i++) {
    recorder.add(
      'sorted',
      [i],
      -1,
      `Position ${i}: ${result[i]}`,
      [...result],
      {}
    );
  }

  return recorder.getSteps();
}
