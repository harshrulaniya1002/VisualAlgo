import StepRecorder from '../../engine/StepRecorder';

export const meta = {
  name: 'Merge Sort',
  slug: 'merge-sort',
  category: 'sorting',
  timeComplexity: {
    best: 'O(n log n)',
    average: 'O(n log n)',
    worst: 'O(n log n)',
  },
  spaceComplexity: 'O(n)',
  stable: true,
  description:
    'Merge Sort is a divide-and-conquer algorithm that divides the array into halves, recursively sorts each half, and then merges the sorted halves back together. It guarantees O(n log n) performance regardless of input.',
  rendererType: 'bar',
  pseudocode: [
    'mergeSort(arr, l, r)',
    '  if l < r',
    '    mid = floor((l + r) / 2)',
    '    mergeSort(arr, l, mid)',
    '    mergeSort(arr, mid + 1, r)',
    '    merge(arr, l, mid, r)',
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

  recorder.add(
    'message',
    [],
    0,
    `Starting Merge Sort on array of ${arr.length} elements`,
    [...arr],
    {}
  );

  function merge(left, mid, right) {
    recorder.add(
      'merge',
      Array.from({ length: right - left + 1 }, (_, k) => left + k),
      5,
      `Merge subarrays [${left}..${mid}] and [${mid + 1}..${right}]`,
      [...arr],
      { left, mid, right }
    );

    const leftArr = arr.slice(left, mid + 1);
    const rightArr = arr.slice(mid + 1, right + 1);

    let i = 0;
    let j = 0;
    let k = left;

    while (i < leftArr.length && j < rightArr.length) {
      recorder.add(
        'compare',
        [left + i, mid + 1 + j],
        5,
        `Compare left[${i}] = ${leftArr[i]} with right[${j}] = ${rightArr[j]}`,
        [...arr],
        {}
      );

      if (leftArr[i] <= rightArr[j]) {
        arr[k] = leftArr[i];

        recorder.add(
          'highlight',
          [k],
          5,
          `Place ${leftArr[i]} from left subarray at position ${k}`,
          [...arr],
          {}
        );

        i++;
      } else {
        arr[k] = rightArr[j];

        recorder.add(
          'highlight',
          [k],
          5,
          `Place ${rightArr[j]} from right subarray at position ${k}`,
          [...arr],
          {}
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
        `Place remaining ${leftArr[i]} from left subarray at position ${k}`,
        [...arr],
        {}
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
        `Place remaining ${rightArr[j]} from right subarray at position ${k}`,
        [...arr],
        {}
      );

      j++;
      k++;
    }

    recorder.add(
      'merge',
      Array.from({ length: right - left + 1 }, (_, idx) => left + idx),
      5,
      `Merged subarray [${left}..${right}]: [${arr.slice(left, right + 1).join(', ')}]`,
      [...arr],
      { left, mid, right }
    );
  }

  function mergeSort(left, right) {
    if (left >= right) return;

    const mid = Math.floor((left + right) / 2);

    // Show the split
    recorder.add(
      'partition',
      Array.from({ length: right - left + 1 }, (_, k) => left + k),
      2,
      `Split [${left}..${right}] into [${left}..${mid}] and [${mid + 1}..${right}]`,
      [...arr],
      { left, mid, right }
    );

    mergeSort(left, mid);
    mergeSort(mid + 1, right);
    merge(left, mid, right);
  }

  mergeSort(0, arr.length - 1);

  // Mark all as sorted
  for (let i = 0; i < arr.length; i++) {
    recorder.add(
      'sorted',
      [i],
      0,
      `Element ${arr[i]} is in its sorted position`,
      [...arr],
      {}
    );
  }

  recorder.add('message', [], 0, 'Merge Sort complete!', [...arr], {});

  return recorder.getSteps();
}
