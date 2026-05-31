import StepRecorder from '../../engine/StepRecorder';

export const meta = {
  name: 'Quick Select',
  slug: 'quick-select',
  category: 'divide-conquer',
  timeComplexity: {
    best: 'O(n)',
    average: 'O(n)',
    worst: 'O(n^2)',
  },
  spaceComplexity: 'O(1)',
  description:
    'Quick Select finds the k-th smallest element in an unsorted array using the partition scheme from Quick Sort. Instead of recursing on both halves, it only recurses on the half that contains the target index, achieving linear average time.',
  rendererType: 'bar',
  pseudocode: [
    'quickSelect(arr, lo, hi, k)',
    '  if lo == hi: return arr[lo]',
    '  pivotIndex = partition(arr, lo, hi)',
    '  if k == pivotIndex: return arr[k]',
    '  else if k < pivotIndex:',
    '    return quickSelect(arr, lo, pivotIndex-1, k)',
    '  else:',
    '    return quickSelect(arr, pivotIndex+1, hi, k)',
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

export const defaultInput = [7, 10, 4, 3, 20, 15, 8];

export function generateSteps(input) {
  const recorder = new StepRecorder();
  const arr = [...input];
  const n = arr.length;
  const k = Math.floor(n / 2); // find the median (0-indexed)

  recorder.add(
    'message',
    [],
    -1,
    `Quick Select: find the ${k + 1}-th smallest element (index ${k}) in [${arr.join(', ')}]`,
    [...arr],
    { k }
  );

  function partition(lo, hi) {
    const pivot = arr[hi];

    recorder.add(
      'highlight',
      [hi],
      2,
      `Choose pivot = arr[${hi}] = ${pivot}`,
      [...arr],
      { pivot, lo, hi }
    );

    let i = lo - 1;

    for (let j = lo; j < hi; j++) {
      recorder.add(
        'compare',
        [j, hi],
        2,
        `Compare arr[${j}] = ${arr[j]} with pivot = ${pivot}`,
        [...arr],
        {}
      );

      if (arr[j] <= pivot) {
        i++;
        if (i !== j) {
          [arr[i], arr[j]] = [arr[j], arr[i]];
          recorder.add(
            'swap',
            [i, j],
            2,
            `arr[${j}] <= pivot, swap arr[${i}] and arr[${j}]`,
            [...arr],
            {}
          );
        } else {
          recorder.add(
            'highlight',
            [i],
            2,
            `arr[${j}] = ${arr[j]} <= pivot, already in place`,
            [...arr],
            {}
          );
        }
      }
    }

    [arr[i + 1], arr[hi]] = [arr[hi], arr[i + 1]];

    recorder.add(
      'swap',
      [i + 1, hi],
      2,
      `Place pivot ${pivot} at its correct position ${i + 1}`,
      [...arr],
      {}
    );

    return i + 1;
  }

  function quickSelect(lo, hi, target) {
    if (lo === hi) {
      recorder.add(
        'sorted',
        [lo],
        1,
        `Single element: arr[${lo}] = ${arr[lo]} is the answer`,
        [...arr],
        {}
      );
      return;
    }

    recorder.add(
      'divide',
      Array.from({ length: hi - lo + 1 }, (_, idx) => lo + idx),
      0,
      `DIVIDE: Partition subarray [${lo}..${hi}] to find position of pivot`,
      [...arr],
      { lo, hi, target }
    );

    const pivotIndex = partition(lo, hi);

    recorder.add(
      'sorted',
      [pivotIndex],
      3,
      `Pivot is at index ${pivotIndex}. Target index is ${target}.`,
      [...arr],
      { pivotIndex, target }
    );

    if (target === pivotIndex) {
      recorder.add(
        'message',
        [pivotIndex],
        3,
        `Found! The ${target + 1}-th smallest element is ${arr[pivotIndex]} at index ${pivotIndex}`,
        [...arr],
        { result: arr[pivotIndex] }
      );
    } else if (target < pivotIndex) {
      recorder.add(
        'message',
        Array.from({ length: pivotIndex - lo }, (_, idx) => lo + idx),
        4,
        `Target index ${target} < pivot index ${pivotIndex} — recurse on LEFT half [${lo}..${pivotIndex - 1}]`,
        [...arr],
        { phase: 'conquer-left' }
      );
      quickSelect(lo, pivotIndex - 1, target);
    } else {
      recorder.add(
        'message',
        Array.from({ length: hi - pivotIndex }, (_, idx) => pivotIndex + 1 + idx),
        6,
        `Target index ${target} > pivot index ${pivotIndex} — recurse on RIGHT half [${pivotIndex + 1}..${hi}]`,
        [...arr],
        { phase: 'conquer-right' }
      );
      quickSelect(pivotIndex + 1, hi, target);
    }
  }

  quickSelect(0, n - 1, k);

  recorder.add(
    'message',
    [],
    -1,
    `Quick Select complete! The ${k + 1}-th smallest element is ${arr[k]}`,
    [...arr],
    { result: arr[k] }
  );

  return recorder.getSteps();
}
