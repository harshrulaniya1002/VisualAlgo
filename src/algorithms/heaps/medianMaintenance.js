import StepRecorder from '../../engine/StepRecorder';

export const meta = {
  name: 'Median Maintenance',
  slug: 'median-maintenance',
  category: 'heaps',
  timeComplexity: {
    best: 'O(log n)',
    average: 'O(log n)',
    worst: 'O(log n)',
  },
  spaceComplexity: 'O(n)',
  description:
    'Median Maintenance uses two heaps to efficiently track the running median of a stream of numbers. A max-heap stores the smaller half and a min-heap stores the larger half. After each insertion, the heaps are rebalanced so their sizes differ by at most one, and the median is read from the top of the larger heap (or the average of both tops).',
  rendererType: 'bar',
  pseudocode: [
    'for each value in stream:',
    '  if val <= maxHeap.top: insert into maxHeap',
    '  else: insert into minHeap',
    '  rebalance heaps (sizes differ by at most 1)',
    '  if sizes equal: median = avg(maxHeap.top, minHeap.top)',
    '  else: median = larger heap\'s top',
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

export const defaultInput = [5, 15, 1, 3, 8, 7, 9, 10, 6, 2, 4];

export function generateSteps(input) {
  const recorder = new StepRecorder();
  const values = [...input];

  // Max-heap for lower half (stores values, largest at top)
  // Min-heap for upper half (stores values, smallest at top)
  const maxHeap = []; // lower half
  const minHeap = []; // upper half

  // Visualization: show combined state as [maxHeap... | minHeap...]
  // maxHeap shown in descending order, minHeap in ascending order
  function getSnapshot() {
    const maxSorted = [...maxHeap].sort((a, b) => b - a);
    const minSorted = [...minHeap].sort((a, b) => a - b);
    return [...maxSorted, ...minSorted];
  }

  // Max-heap operations
  function maxHeapPush(val) {
    maxHeap.push(val);
    let i = maxHeap.length - 1;
    while (i > 0) {
      const p = Math.floor((i - 1) / 2);
      if (maxHeap[i] > maxHeap[p]) {
        [maxHeap[i], maxHeap[p]] = [maxHeap[p], maxHeap[i]];
        i = p;
      } else {
        break;
      }
    }
  }

  function maxHeapPop() {
    const top = maxHeap[0];
    const last = maxHeap.pop();
    if (maxHeap.length > 0) {
      maxHeap[0] = last;
      let i = 0;
      while (true) {
        const l = 2 * i + 1;
        const r = 2 * i + 2;
        let largest = i;
        if (l < maxHeap.length && maxHeap[l] > maxHeap[largest]) largest = l;
        if (r < maxHeap.length && maxHeap[r] > maxHeap[largest]) largest = r;
        if (largest !== i) {
          [maxHeap[i], maxHeap[largest]] = [maxHeap[largest], maxHeap[i]];
          i = largest;
        } else {
          break;
        }
      }
    }
    return top;
  }

  function maxHeapTop() {
    return maxHeap.length > 0 ? maxHeap[0] : -Infinity;
  }

  // Min-heap operations
  function minHeapPush(val) {
    minHeap.push(val);
    let i = minHeap.length - 1;
    while (i > 0) {
      const p = Math.floor((i - 1) / 2);
      if (minHeap[i] < minHeap[p]) {
        [minHeap[i], minHeap[p]] = [minHeap[p], minHeap[i]];
        i = p;
      } else {
        break;
      }
    }
  }

  function minHeapPop() {
    const top = minHeap[0];
    const last = minHeap.pop();
    if (minHeap.length > 0) {
      minHeap[0] = last;
      let i = 0;
      while (true) {
        const l = 2 * i + 1;
        const r = 2 * i + 2;
        let smallest = i;
        if (l < minHeap.length && minHeap[l] < minHeap[smallest]) smallest = l;
        if (r < minHeap.length && minHeap[r] < minHeap[smallest]) smallest = r;
        if (smallest !== i) {
          [minHeap[i], minHeap[smallest]] = [minHeap[smallest], minHeap[i]];
          i = smallest;
        } else {
          break;
        }
      }
    }
    return top;
  }

  function minHeapTop() {
    return minHeap.length > 0 ? minHeap[0] : Infinity;
  }

  recorder.add(
    'message',
    [],
    -1,
    `Median Maintenance: process ${values.length} numbers using two heaps`,
    [],
    {}
  );

  recorder.add(
    'message',
    [],
    -1,
    'MaxHeap (lower half) on the left, MinHeap (upper half) on the right',
    [],
    {}
  );

  for (let v = 0; v < values.length; v++) {
    const val = values[v];

    recorder.add(
      'message',
      [],
      0,
      `--- Process element ${v + 1}: value = ${val} ---`,
      getSnapshot(),
      {}
    );

    // Decide which heap to insert into
    if (maxHeap.length === 0 || val <= maxHeapTop()) {
      recorder.add(
        'compare',
        [],
        1,
        maxHeap.length === 0
          ? `MaxHeap is empty, insert ${val} into MaxHeap (lower half)`
          : `${val} <= maxHeap top ${maxHeapTop()}, insert into MaxHeap (lower half)`,
        getSnapshot(),
        {}
      );

      maxHeapPush(val);

      const snap = getSnapshot();
      recorder.add(
        'insert',
        [Math.floor(maxHeap.length / 2) - (maxHeap.length > 1 ? 0 : 0)],
        1,
        `Inserted ${val} into MaxHeap. MaxHeap size = ${maxHeap.length}`,
        snap,
        {}
      );
    } else {
      recorder.add(
        'compare',
        [],
        2,
        `${val} > maxHeap top ${maxHeapTop()}, insert into MinHeap (upper half)`,
        getSnapshot(),
        {}
      );

      minHeapPush(val);

      const snap = getSnapshot();
      recorder.add(
        'insert',
        [maxHeap.length + Math.floor(minHeap.length / 2)],
        2,
        `Inserted ${val} into MinHeap. MinHeap size = ${minHeap.length}`,
        snap,
        {}
      );
    }

    // Rebalance: sizes should differ by at most 1
    if (maxHeap.length > minHeap.length + 1) {
      const moved = maxHeapPop();
      minHeapPush(moved);

      recorder.add(
        'swap',
        [],
        3,
        `Rebalance: move ${moved} from MaxHeap to MinHeap (MaxHeap was too large)`,
        getSnapshot(),
        {}
      );
    } else if (minHeap.length > maxHeap.length + 1) {
      const moved = minHeapPop();
      maxHeapPush(moved);

      recorder.add(
        'swap',
        [],
        3,
        `Rebalance: move ${moved} from MinHeap to MaxHeap (MinHeap was too large)`,
        getSnapshot(),
        {}
      );
    } else {
      recorder.add(
        'message',
        [],
        3,
        `Heaps balanced: MaxHeap size = ${maxHeap.length}, MinHeap size = ${minHeap.length}`,
        getSnapshot(),
        {}
      );
    }

    // Compute median
    let median;
    if (maxHeap.length === minHeap.length) {
      median = (maxHeapTop() + minHeapTop()) / 2;

      recorder.add(
        'compute',
        [],
        4,
        `Equal sizes: median = (${maxHeapTop()} + ${minHeapTop()}) / 2 = ${median}`,
        getSnapshot(),
        { median }
      );
    } else if (maxHeap.length > minHeap.length) {
      median = maxHeapTop();

      recorder.add(
        'compute',
        [],
        5,
        `MaxHeap larger: median = maxHeap top = ${median}`,
        getSnapshot(),
        { median }
      );
    } else {
      median = minHeapTop();

      recorder.add(
        'compute',
        [],
        5,
        `MinHeap larger: median = minHeap top = ${median}`,
        getSnapshot(),
        { median }
      );
    }

    recorder.add(
      'highlight',
      [],
      -1,
      `After ${v + 1} elements: median = ${median}. MaxHeap(lower) top = ${maxHeap.length > 0 ? maxHeapTop() : 'empty'}, MinHeap(upper) top = ${minHeap.length > 0 ? minHeapTop() : 'empty'}`,
      getSnapshot(),
      { median, step: v + 1 }
    );
  }

  // Final state
  const finalSnap = getSnapshot();
  for (let i = 0; i < finalSnap.length; i++) {
    recorder.add(
      'sorted',
      [i],
      -1,
      `Position ${i}: ${finalSnap[i]}${i < maxHeap.length ? ' (lower half)' : ' (upper half)'}`,
      finalSnap,
      {}
    );
  }

  const finalMedian = maxHeap.length === minHeap.length
    ? (maxHeapTop() + minHeapTop()) / 2
    : maxHeap.length > minHeap.length
      ? maxHeapTop()
      : minHeapTop();

  recorder.add(
    'message',
    [],
    -1,
    `Median Maintenance complete! Final median = ${finalMedian}`,
    finalSnap,
    {}
  );

  return recorder.getSteps();
}
