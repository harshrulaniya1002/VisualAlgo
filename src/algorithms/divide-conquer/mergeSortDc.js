import StepRecorder from '../../engine/StepRecorder';

export const meta = {
  name: 'Merge Sort (Divide & Conquer)',
  slug: 'merge-sort-dc',
  category: 'divide-conquer',
  timeComplexity: {
    best: 'O(n log n)',
    average: 'O(n log n)',
    worst: 'O(n log n)',
  },
  spaceComplexity: 'O(n)',
  description:
    'Merge Sort viewed through the Divide & Conquer paradigm: divide the array into two halves, conquer each half recursively, and combine by merging the sorted halves. This visualization emphasizes the three D&C stages at every recursion level.',
  rendererType: 'bar',
  pseudocode: [
    'if length <= 1: return',
    'mid = length / 2',
    'left = mergeSort(arr[0..mid])',
    'right = mergeSort(arr[mid..n])',
    'return merge(left, right)',
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

export const defaultInput = [38, 27, 43, 3, 9, 82, 10];

export function generateSteps(input) {
  const recorder = new StepRecorder();
  const arr = [...input];
  const n = arr.length;

  recorder.add(
    'message',
    [],
    -1,
    `Starting Merge Sort (D&C) on array of ${n} elements: [${arr.join(', ')}]`,
    [...arr],
    {}
  );

  function mergeSort(left, right, depth) {
    // Base case
    if (left >= right) {
      recorder.add(
        'message',
        [left],
        0,
        `Base case: subarray [${left}..${right}] has ${right < left ? 0 : 1} element — already sorted`,
        [...arr],
        { depth }
      );
      return;
    }

    const mid = Math.floor((left + right) / 2);

    // DIVIDE step
    recorder.add(
      'divide',
      Array.from({ length: right - left + 1 }, (_, k) => left + k),
      1,
      `DIVIDE: Split [${left}..${right}] into left [${left}..${mid}] and right [${mid + 1}..${right}]`,
      [...arr],
      { left, mid, right, depth, phase: 'divide' }
    );

    // CONQUER step — left half
    recorder.add(
      'message',
      Array.from({ length: mid - left + 1 }, (_, k) => left + k),
      2,
      `CONQUER: Recursively sort left half [${left}..${mid}]`,
      [...arr],
      { depth: depth + 1, phase: 'conquer' }
    );
    mergeSort(left, mid, depth + 1);

    // CONQUER step — right half
    recorder.add(
      'message',
      Array.from({ length: right - mid }, (_, k) => mid + 1 + k),
      3,
      `CONQUER: Recursively sort right half [${mid + 1}..${right}]`,
      [...arr],
      { depth: depth + 1, phase: 'conquer' }
    );
    mergeSort(mid + 1, right, depth + 1);

    // COMBINE step — merge the two sorted halves
    recorder.add(
      'merge',
      Array.from({ length: right - left + 1 }, (_, k) => left + k),
      4,
      `COMBINE: Merge sorted halves [${left}..${mid}] and [${mid + 1}..${right}]`,
      [...arr],
      { left, mid, right, depth, phase: 'combine' }
    );

    merge(left, mid, right, depth);
  }

  function merge(left, mid, right, depth) {
    const leftArr = arr.slice(left, mid + 1);
    const rightArr = arr.slice(mid + 1, right + 1);
    let i = 0;
    let j = 0;
    let k = left;

    while (i < leftArr.length && j < rightArr.length) {
      recorder.add(
        'compare',
        [left + i, mid + 1 + j],
        4,
        `Compare left[${i}] = ${leftArr[i]} with right[${j}] = ${rightArr[j]}`,
        [...arr],
        { depth }
      );

      if (leftArr[i] <= rightArr[j]) {
        arr[k] = leftArr[i];
        recorder.add(
          'highlight',
          [k],
          4,
          `Place ${leftArr[i]} from left subarray at position ${k}`,
          [...arr],
          { depth }
        );
        i++;
      } else {
        arr[k] = rightArr[j];
        recorder.add(
          'highlight',
          [k],
          4,
          `Place ${rightArr[j]} from right subarray at position ${k}`,
          [...arr],
          { depth }
        );
        j++;
      }
      k++;
    }

    while (i < leftArr.length) {
      arr[k] = leftArr[i];
      recorder.add(
        'highlight',
        [k],
        4,
        `Place remaining ${leftArr[i]} from left subarray at position ${k}`,
        [...arr],
        { depth }
      );
      i++;
      k++;
    }

    while (j < rightArr.length) {
      arr[k] = rightArr[j];
      recorder.add(
        'highlight',
        [k],
        4,
        `Place remaining ${rightArr[j]} from right subarray at position ${k}`,
        [...arr],
        { depth }
      );
      j++;
      k++;
    }

    recorder.add(
      'merge',
      Array.from({ length: right - left + 1 }, (_, idx) => left + idx),
      4,
      `Merged [${left}..${right}]: [${arr.slice(left, right + 1).join(', ')}]`,
      [...arr],
      { left, mid, right, depth, phase: 'combine-done' }
    );
  }

  mergeSort(0, n - 1, 0);

  // Mark all elements as sorted
  for (let i = 0; i < n; i++) {
    recorder.add(
      'sorted',
      [i],
      -1,
      `Element ${arr[i]} is in its sorted position`,
      [...arr],
      {}
    );
  }

  recorder.add('message', [], -1, 'Merge Sort (D&C) complete!', [...arr], {});

  return recorder.getSteps();
}
