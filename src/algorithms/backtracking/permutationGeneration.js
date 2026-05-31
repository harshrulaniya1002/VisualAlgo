import StepRecorder from '../../engine/StepRecorder';

export const meta = {
  name: 'Permutation Generation',
  slug: 'permutation-generation',
  category: 'backtracking',
  timeComplexity: {
    best: 'O(n!)',
    average: 'O(n!)',
    worst: 'O(n!)',
  },
  spaceComplexity: 'O(n)',
  description:
    'Generates all permutations of a given array using backtracking. The algorithm fixes one element at each position by swapping it with subsequent elements, recursing on the remaining positions, and then swapping back (backtracking) to restore the original order before trying the next element.',
  rendererType: 'bar',
  pseudocode: [
    'function permute(start):',
    '  if start == n: record permutation',
    '  for i = start to n-1:',
    '    swap(arr[start], arr[i])',
    '    permute(start + 1)',
    '    swap(arr[start], arr[i]) // backtrack',
  ],
  inputSchema: {
    type: 'array',
    constraints: {
      minLength: 1,
      maxLength: 81,
      minValue: 0,
      maxValue: 999,
    },
  },
};

export const defaultInput = [1, 2, 3];

export function generateSteps(input) {
  const recorder = new StepRecorder();
  const arr = [...input];
  const n = arr.length;
  const permutations = [];

  function makeSnapshot() {
    return [...arr];
  }

  recorder.add(
    'message',
    [],
    -1,
    `Generating all permutations of [${arr.join(', ')}]. Total permutations: ${factorial(n)}.`,
    makeSnapshot(),
    {}
  );

  function factorial(num) {
    let result = 1;
    for (let i = 2; i <= num; i++) result *= i;
    return result;
  }

  function permute(start) {
    if (start === n) {
      permutations.push([...arr]);
      recorder.add(
        'sorted',
        Array.from({ length: n }, (_, i) => i),
        1,
        `Permutation ${permutations.length}: [${arr.join(', ')}]`,
        makeSnapshot(),
        {}
      );
      return;
    }

    recorder.add(
      'message',
      [start],
      0,
      `Fixing position ${start}. Try each remaining element here.`,
      makeSnapshot(),
      {}
    );

    for (let i = start; i < n; i++) {
      // Compare: consider swapping
      recorder.add(
        'compare',
        [start, i],
        2,
        `Consider placing arr[${i}] = ${arr[i]} at position ${start}`,
        makeSnapshot(),
        {}
      );

      // Swap arr[start] and arr[i]
      if (i !== start) {
        [arr[start], arr[i]] = [arr[i], arr[start]];
        recorder.add(
          'swap',
          [start, i],
          3,
          `Swap arr[${start}] and arr[${i}] -> [${arr.join(', ')}]`,
          makeSnapshot(),
          {}
        );
      } else {
        recorder.add(
          'visit',
          [start],
          3,
          `Keep arr[${start}] = ${arr[start]} in place`,
          makeSnapshot(),
          {}
        );
      }

      permute(start + 1);

      // Backtrack: swap back
      if (i !== start) {
        [arr[start], arr[i]] = [arr[i], arr[start]];
        recorder.add(
          'backtrack',
          [start, i],
          5,
          `Swap back arr[${start}] and arr[${i}] -> [${arr.join(', ')}] (backtrack)`,
          makeSnapshot(),
          {}
        );
      }
    }
  }

  permute(0);

  recorder.add(
    'message',
    [],
    -1,
    `Permutation Generation complete. Generated ${permutations.length} permutations.`,
    makeSnapshot(),
    {}
  );

  return recorder.getSteps();
}
