import StepRecorder from '../../engine/StepRecorder';

export const meta = {
  name: 'Count Inversions',
  slug: 'count-inversions',
  category: 'divide-conquer',
  timeComplexity: {
    best: 'O(n log n)',
    average: 'O(n log n)',
    worst: 'O(n log n)',
  },
  spaceComplexity: 'O(n)',
  description:
    'Count the number of inversions in an array using a modified Merge Sort. An inversion is a pair (i, j) where i < j but arr[i] > arr[j]. During the merge step, whenever an element from the right half is placed before elements from the left half, those elements form inversions.',
  rendererType: 'bar',
  pseudocode: [
    'countInversions(arr, l, r)',
    '  if l >= r: return 0',
    '  mid = (l + r) / 2',
    '  inv = countInversions(arr, l, mid)',
    '  inv += countInversions(arr, mid+1, r)',
    '  inv += mergeCount(arr, l, mid, r)',
    '  return inv',
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

export const defaultInput = [8, 4, 2, 1, 6, 3, 5, 7];

export function generateSteps(input) {
  const recorder = new StepRecorder();
  const arr = [...input];
  const n = arr.length;
  let totalInversions = 0;

  recorder.add(
    'message',
    [],
    -1,
    `Count Inversions: find all pairs (i,j) where i < j but arr[i] > arr[j] in [${arr.join(', ')}]`,
    [...arr],
    {}
  );

  function mergeCount(left, mid, right, depth) {
    const leftArr = arr.slice(left, mid + 1);
    const rightArr = arr.slice(mid + 1, right + 1);
    let i = 0;
    let j = 0;
    let k = left;
    let inversions = 0;

    recorder.add(
      'merge',
      Array.from({ length: right - left + 1 }, (_, idx) => left + idx),
      5,
      `Merge and count: merging [${left}..${mid}] and [${mid + 1}..${right}]`,
      [...arr],
      { left, mid, right, depth, phase: 'combine' }
    );

    while (i < leftArr.length && j < rightArr.length) {
      recorder.add(
        'compare',
        [left + i, mid + 1 + j],
        5,
        `Compare left[${i}] = ${leftArr[i]} with right[${j}] = ${rightArr[j]}`,
        [...arr],
        { depth }
      );

      if (leftArr[i] <= rightArr[j]) {
        arr[k] = leftArr[i];
        recorder.add(
          'highlight',
          [k],
          5,
          `${leftArr[i]} <= ${rightArr[j]}: place ${leftArr[i]} — no inversions`,
          [...arr],
          { depth }
        );
        i++;
      } else {
        // All remaining elements in left subarray form inversions with rightArr[j]
        const newInv = leftArr.length - i;
        inversions += newInv;
        totalInversions += newInv;

        arr[k] = rightArr[j];
        recorder.add(
          'compute',
          [k],
          5,
          `${leftArr[i]} > ${rightArr[j]}: place ${rightArr[j]} — ${newInv} inversion(s) found! (${leftArr.length - i} remaining left elements > ${rightArr[j]}) Total: ${totalInversions}`,
          [...arr],
          { newInversions: newInv, totalInversions, depth }
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
        5,
        `Place remaining ${leftArr[i]} from left subarray`,
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
        5,
        `Place remaining ${rightArr[j]} from right subarray`,
        [...arr],
        { depth }
      );
      j++;
      k++;
    }

    recorder.add(
      'merge',
      Array.from({ length: right - left + 1 }, (_, idx) => left + idx),
      5,
      `Merged [${left}..${right}]: [${arr.slice(left, right + 1).join(', ')}] — ${inversions} split inversions in this merge`,
      [...arr],
      { inversions, totalInversions, depth }
    );

    return inversions;
  }

  function countInversions(left, right, depth) {
    if (left >= right) {
      recorder.add(
        'message',
        [left],
        1,
        `Base case: single element arr[${left}] = ${arr[left]}`,
        [...arr],
        { depth }
      );
      return 0;
    }

    const mid = Math.floor((left + right) / 2);

    // DIVIDE
    recorder.add(
      'divide',
      Array.from({ length: right - left + 1 }, (_, k) => left + k),
      2,
      `DIVIDE: Split [${left}..${right}] into [${left}..${mid}] and [${mid + 1}..${right}]`,
      [...arr],
      { left, mid, right, depth, phase: 'divide' }
    );

    // CONQUER left
    recorder.add(
      'message',
      Array.from({ length: mid - left + 1 }, (_, k) => left + k),
      3,
      `CONQUER: Count inversions in left half [${left}..${mid}]`,
      [...arr],
      { depth: depth + 1, phase: 'conquer' }
    );
    let inv = countInversions(left, mid, depth + 1);

    // CONQUER right
    recorder.add(
      'message',
      Array.from({ length: right - mid }, (_, k) => mid + 1 + k),
      4,
      `CONQUER: Count inversions in right half [${mid + 1}..${right}]`,
      [...arr],
      { depth: depth + 1, phase: 'conquer' }
    );
    inv += countInversions(mid + 1, right, depth + 1);

    // COMBINE
    inv += mergeCount(left, mid, right, depth);

    recorder.add(
      'compute',
      Array.from({ length: right - left + 1 }, (_, k) => left + k),
      5,
      `Inversions in [${left}..${right}]: ${inv}. Running total: ${totalInversions}`,
      [...arr],
      { inversions: inv, totalInversions, depth }
    );

    return inv;
  }

  const result = countInversions(0, n - 1, 0);

  // Mark all as sorted
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

  recorder.add(
    'message',
    [],
    -1,
    `Count Inversions complete! Total inversions: ${result}. Sorted array: [${arr.join(', ')}]`,
    [...arr],
    { totalInversions: result }
  );

  return recorder.getSteps();
}
