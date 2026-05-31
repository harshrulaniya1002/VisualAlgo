import StepRecorder from '../../engine/StepRecorder';

export const meta = {
  name: 'Subset Generation',
  slug: 'subset-generation',
  category: 'backtracking',
  timeComplexity: {
    best: 'O(2^n)',
    average: 'O(2^n)',
    worst: 'O(2^n)',
  },
  spaceComplexity: 'O(n)',
  description:
    'Generates all subsets (power set) of a given set using backtracking. At each element the algorithm makes two choices: include the element in the current subset or exclude it. This creates a binary decision tree whose leaves are all possible subsets.',
  rendererType: 'bar',
  pseudocode: [
    'function generateSubsets(index, current):',
    '  if index == n: record current subset',
    '  include arr[index] in current',
    '  generateSubsets(index + 1, current)',
    '  exclude arr[index] from current (backtrack)',
    '  generateSubsets(index + 1, current)',
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
  const subsets = [];

  // The snapshot uses a copy of arr where included elements keep their values
  // and excluded elements are shown as 0. Also appends subset count.
  const included = new Array(n).fill(false);

  function makeSnapshot() {
    // Show the original array with highlights based on inclusion
    return arr.map((val, i) => (included[i] ? val : 0));
  }

  recorder.add(
    'message',
    [],
    -1,
    `Generating all subsets of [${arr.join(', ')}]. Total subsets: ${Math.pow(2, n)}.`,
    makeSnapshot(),
    {}
  );

  function generate(index, current) {
    if (index === n) {
      subsets.push([...current]);
      recorder.add(
        'sorted',
        current.length > 0
          ? current.map(v => arr.indexOf(v))
          : [],
        1,
        `Subset ${subsets.length}: {${current.length === 0 ? 'empty' : current.join(', ')}}`,
        makeSnapshot(),
        {}
      );
      return;
    }

    // Choice 1: Include arr[index]
    recorder.add(
      'compare',
      [index],
      2,
      `Decision point at index ${index}: include ${arr[index]}?`,
      makeSnapshot(),
      {}
    );

    included[index] = true;
    current.push(arr[index]);
    recorder.add(
      'visit',
      [index],
      2,
      `Include ${arr[index]} in current subset: {${current.join(', ')}}`,
      makeSnapshot(),
      {}
    );

    generate(index + 1, current);

    // Backtrack: exclude arr[index]
    current.pop();
    included[index] = false;
    recorder.add(
      'backtrack',
      [index],
      4,
      `Exclude ${arr[index]} from subset (backtrack)`,
      makeSnapshot(),
      {}
    );

    // Choice 2: Skip arr[index]
    recorder.add(
      'highlight',
      [index],
      5,
      `Skip ${arr[index]}, move to next element`,
      makeSnapshot(),
      {}
    );

    generate(index + 1, current);
  }

  generate(0, []);

  recorder.add(
    'message',
    [],
    -1,
    `Subset Generation complete. Generated ${subsets.length} subsets.`,
    makeSnapshot(),
    {}
  );

  return recorder.getSteps();
}
