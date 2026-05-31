import StepRecorder from '../../engine/StepRecorder';

export const meta = {
  name: 'Merge Sort on Linked List',
  slug: 'merge-sort-linked-list',
  category: 'linked-lists',
  timeComplexity: { best: 'O(n log n)', average: 'O(n log n)', worst: 'O(n log n)' },
  spaceComplexity: 'O(log n)',
  description:
    'Sorts a linked list using merge sort by recursively splitting the list at the midpoint using slow/fast pointers, then merging the sorted halves back together.',
  rendererType: 'bar',
  pseudocode: [
    'function mergeSort(head):',
    '  if head is null or single: return head',
    '  mid = findMiddle(head)',
    '  left = mergeSort(first half)',
    '  right = mergeSort(second half)',
    '  return merge(left, right)',
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
    0,
    `Starting merge sort on linked list: [${arr.join(' -> ')}]`,
    [...arr],
    {}
  );

  // Perform merge sort and record steps
  function mergeSortHelper(subArr, startIdx, depth) {
    if (subArr.length <= 1) {
      if (subArr.length === 1) {
        recorder.add(
          'visit',
          [startIdx],
          1,
          `${'  '.repeat(depth)}Base case: single node [${subArr[0]}]`,
          [...arr],
          { depth }
        );
      }
      return [...subArr];
    }

    const mid = Math.floor(subArr.length / 2);
    const leftPart = subArr.slice(0, mid);
    const rightPart = subArr.slice(mid);

    // Show split
    const leftIndices = [];
    const rightIndices = [];
    for (let i = 0; i < mid; i++) leftIndices.push(startIdx + i);
    for (let i = mid; i < subArr.length; i++) rightIndices.push(startIdx + i);

    recorder.add(
      'compare',
      [...leftIndices, ...rightIndices],
      2,
      `${'  '.repeat(depth)}Split [${subArr.join(', ')}] into [${leftPart.join(', ')}] and [${rightPart.join(', ')}]`,
      [...arr],
      { depth, left: leftPart, right: rightPart }
    );

    // Find middle using slow/fast pointer simulation
    recorder.add(
      'highlight',
      [startIdx + mid - 1, startIdx + mid],
      2,
      `${'  '.repeat(depth)}Middle found at index ${mid}: split after node ${subArr[mid - 1]}`,
      [...arr],
      { depth, midValue: subArr[mid - 1] }
    );

    // Recursively sort both halves
    const sortedLeft = mergeSortHelper(leftPart, startIdx, depth + 1);
    const sortedRight = mergeSortHelper(rightPart, startIdx + mid, depth + 1);

    // Merge the sorted halves
    recorder.add(
      'message',
      [],
      5,
      `${'  '.repeat(depth)}Merging [${sortedLeft.join(', ')}] and [${sortedRight.join(', ')}]`,
      [...arr],
      { depth }
    );

    const merged = [];
    let i = 0;
    let j = 0;

    while (i < sortedLeft.length && j < sortedRight.length) {
      recorder.add(
        'compare',
        [startIdx + merged.length],
        5,
        `${'  '.repeat(depth)}Compare ${sortedLeft[i]} vs ${sortedRight[j]}`,
        [...arr],
        { depth, left: sortedLeft[i], right: sortedRight[j] }
      );

      if (sortedLeft[i] <= sortedRight[j]) {
        merged.push(sortedLeft[i]);
        i++;
      } else {
        merged.push(sortedRight[j]);
        j++;
      }
    }

    while (i < sortedLeft.length) {
      merged.push(sortedLeft[i]);
      i++;
    }

    while (j < sortedRight.length) {
      merged.push(sortedRight[j]);
      j++;
    }

    // Update the main array to reflect this merge
    for (let k = 0; k < merged.length; k++) {
      arr[startIdx + k] = merged[k];
    }

    const mergedIndices = [];
    for (let k = 0; k < merged.length; k++) mergedIndices.push(startIdx + k);

    recorder.add(
      'insert',
      mergedIndices,
      5,
      `${'  '.repeat(depth)}Merged result: [${merged.join(', ')}]`,
      [...arr],
      { depth, merged }
    );

    return merged;
  }

  mergeSortHelper(arr, 0, 0);

  // Mark all as sorted
  for (let i = 0; i < n; i++) {
    recorder.add(
      'sorted',
      [i],
      0,
      `Node ${arr[i]} is in its sorted position at index ${i}`,
      [...arr],
      {}
    );
  }

  recorder.add(
    'message',
    [],
    0,
    `Merge sort complete! Sorted list: [${arr.join(' -> ')}]`,
    [...arr],
    {}
  );

  return recorder.getSteps();
}
