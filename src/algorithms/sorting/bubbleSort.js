import StepRecorder from '../../engine/StepRecorder';

export const meta = {
  name: 'Bubble Sort',
  slug: 'bubble-sort',
  category: 'sorting',
  timeComplexity: {
    best: 'O(n)',
    average: 'O(n^2)',
    worst: 'O(n^2)',
  },
  spaceComplexity: 'O(1)',
  stable: true,
  description:
    'Bubble Sort repeatedly steps through the list, compares adjacent elements, and swaps them if they are in the wrong order. The pass through the list is repeated until the list is sorted. It is named for the way smaller or larger elements "bubble" to the top of the list.',
  rendererType: 'bar',
  pseudocode: [
    'for i = 0 to n - 1',
    '  for j = 0 to n - i - 2',
    '    if arr[j] > arr[j + 1]',
    '      swap(arr[j], arr[j + 1])',
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

export const defaultInput = [64, 34, 25, 12, 22, 11, 90];

export function generateSteps(input) {
  const recorder = new StepRecorder();
  const arr = [...input];
  const n = arr.length;

  recorder.add(
    'message',
    [],
    0,
    `Starting Bubble Sort on array of ${n} elements`,
    [...arr],
    {}
  );

  for (let i = 0; i < n - 1; i++) {
    recorder.add(
      'message',
      [],
      0,
      `Pass ${i + 1}: bubble the largest unsorted element to position ${n - 1 - i}`,
      [...arr],
      {}
    );

    let swapped = false;

    for (let j = 0; j < n - i - 1; j++) {
      // Compare adjacent elements
      recorder.add(
        'compare',
        [j, j + 1],
        2,
        `Compare arr[${j}] = ${arr[j]} with arr[${j + 1}] = ${arr[j + 1]}`,
        [...arr],
        {}
      );

      if (arr[j] > arr[j + 1]) {
        // Swap
        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
        swapped = true;

        recorder.add(
          'swap',
          [j, j + 1],
          3,
          `Swap arr[${j}] and arr[${j + 1}] -> ${arr[j]}, ${arr[j + 1]}`,
          [...arr],
          {}
        );
      }
    }

    // Mark the element that bubbled to its final position
    recorder.add(
      'sorted',
      [n - 1 - i],
      0,
      `Element ${arr[n - 1 - i]} is now in its sorted position at index ${n - 1 - i}`,
      [...arr],
      {}
    );

    // Early termination if no swaps occurred
    if (!swapped) {
      recorder.add(
        'message',
        [],
        0,
        'No swaps in this pass - array is already sorted!',
        [...arr],
        {}
      );
      // Mark all remaining elements as sorted
      for (let k = n - 2 - i; k >= 0; k--) {
        recorder.add('sorted', [k], 0, `Element ${arr[k]} is sorted`, [...arr], {});
      }
      break;
    }
  }

  // If no early termination, mark the first element as sorted
  if (n > 0) {
    recorder.add(
      'sorted',
      [0],
      0,
      `Element ${arr[0]} is in its sorted position`,
      [...arr],
      {}
    );
  }

  recorder.add('message', [], 0, 'Bubble Sort complete!', [...arr], {});

  return recorder.getSteps();
}
