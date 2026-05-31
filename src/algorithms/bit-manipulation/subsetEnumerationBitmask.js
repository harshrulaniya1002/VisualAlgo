import StepRecorder from '../../engine/StepRecorder';

export const meta = {
  name: 'Subset Enumeration (Bitmask)',
  slug: 'subset-enumeration-bitmask',
  category: 'bit-manipulation',
  timeComplexity: { best: 'O(2^n)', average: 'O(2^n)', worst: 'O(2^n)' },
  spaceComplexity: 'O(1)',
  description:
    'Enumerates all subsets of a set using bitmasks. For a set of n elements, iterates from 0 to 2^n - 1. Each integer encodes a subset: bit j being set means element j is included. This technique is widely used in competitive programming and combinatorial search.',
  rendererType: 'bar',
  pseudocode: [
    'for mask = 0 to 2^n - 1:',
    '  subset = []',
    '  for j = 0 to n - 1:',
    '    if mask & (1 << j):',
    '      subset.add(set[j])',
    '  output subset',
  ],
  inputSchema: {
    type: 'array',
    constraints: { minLength: 1, maxLength: 50, minValue: 0, maxValue: 999 },
  },
};

export const defaultInput = [1, 2, 3];

/**
 * Convert a number to its binary string padded to a given width.
 */
function toBin(n, width) {
  return n.toString(2).padStart(width, '0');
}

/**
 * Generate step-by-step visualization for subset enumeration using bitmasks.
 *
 * @param {number[]} input - The set of elements to enumerate subsets of.
 * @returns {Array} Recorded steps.
 */
export function generateSteps(input) {
  const recorder = new StepRecorder();
  const set = [...input];
  const n = set.length;
  const totalSubsets = 1 << n; // 2^n

  // The visual array shows the set elements
  recorder.add(
    'message', [], -1,
    `Enumerating all ${totalSubsets} subsets of {${set.join(', ')}} using bitmasks (0 to ${totalSubsets - 1})`,
    [...set],
    { n, totalSubsets }
  );

  for (let mask = 0; mask < totalSubsets; mask++) {
    const subset = [];
    const includedIndices = [];

    recorder.add(
      'visit', [], 0,
      `mask = ${mask} (${toBin(mask, n)} in binary)`,
      [...set],
      { mask, binary: toBin(mask, n) }
    );

    for (let j = 0; j < n; j++) {
      if (mask & (1 << j)) {
        subset.push(set[j]);
        includedIndices.push(j);

        recorder.add(
          'highlight', [j], 3,
          `Bit ${j} is set in ${toBin(mask, n)}: include element set[${j}] = ${set[j]}`,
          [...set],
          { mask, bit: j, element: set[j] }
        );
      }
    }

    const subsetStr = subset.length === 0 ? '{}' : '{' + subset.join(', ') + '}';
    recorder.add(
      'compute', includedIndices, 5,
      `mask ${mask} (${toBin(mask, n)}) -> subset: ${subsetStr}`,
      [...set],
      { mask, subset: [...subset], binary: toBin(mask, n) }
    );
  }

  recorder.add(
    'sorted', [], -1,
    `Enumeration complete. Total subsets: ${totalSubsets} (2^${n} = ${totalSubsets})`,
    [...set],
    { totalSubsets }
  );

  return recorder.getSteps();
}
