import StepRecorder from '../../engine/StepRecorder';

export const meta = {
  name: 'Suffix Array Construction',
  slug: 'suffix-array',
  category: 'string-algorithms',
  timeComplexity: { best: 'O(n log n)', average: 'O(n log n)', worst: 'O(n log n)' },
  spaceComplexity: 'O(n)',
  description:
    'A suffix array is a sorted array of all suffixes of a string. It enables efficient substring searches and is a space-efficient alternative to suffix trees. Construction uses a rank-and-sort approach with doubling step lengths.',
  rendererType: 'bar',
  pseudocode: [
    'Generate all suffixes with indices',
    'Initial rank = character code',
    'Sort suffixes by (rank, nextRank)',
    'Double the comparison length each iteration',
    'Repeat until all ranks are unique',
    'Output suffix array',
  ],
  inputSchema: {
    type: 'array',
    constraints: { minLength: 2, maxLength: 100, minValue: 0, maxValue: 999 },
  },
};

// String "BANANA" as char codes
export const defaultInput = [66, 65, 78, 65, 78, 65];

export function generateSteps(input) {
  const recorder = new StepRecorder();
  const arr = [...input];
  const n = arr.length;
  const chars = arr.map(c => String.fromCharCode(c));
  const str = chars.join('');

  recorder.add('message', [], 0,
    `Building suffix array for "${str}" (length ${n})`,
    [...arr], { string: str });

  // List all suffixes
  const suffixes = [];
  for (let i = 0; i < n; i++) {
    suffixes.push(i);
    recorder.add('visit', [i], 0,
      `Suffix ${i}: "${chars.slice(i).join('')}"`,
      [...arr], { index: i, suffix: chars.slice(i).join('') });
  }

  // Initialize ranks from character codes
  let rank = new Array(n);
  let tempRank = new Array(n);
  for (let i = 0; i < n; i++) {
    rank[i] = arr[i];
  }

  recorder.add('compute', [], 1,
    `Initial ranks based on character codes: [${rank.join(', ')}]`,
    [...rank], { rank: [...rank] });

  let k = 1;
  let iteration = 0;

  while (k < n) {
    iteration++;
    recorder.add('message', [], 2,
      `Iteration ${iteration}: sorting by (rank[i], rank[i + ${k}]) pairs, comparison length = ${k * 2}`,
      [...rank], { k, iteration });

    // Sort suffixes by (rank[i], rank[i+k])
    suffixes.sort((a, b) => {
      if (rank[a] !== rank[b]) return rank[a] - rank[b];
      const ra = a + k < n ? rank[a + k] : -1;
      const rb = b + k < n ? rank[b + k] : -1;
      return ra - rb;
    });

    // Display sorted order
    const sortedSuffixes = suffixes.map(i => chars.slice(i).join(''));
    recorder.add('compute', [], 2,
      `Sorted order: [${suffixes.join(', ')}] -> [${sortedSuffixes.map(s => '"' + s + '"').join(', ')}]`,
      [...suffixes], { suffixes: [...suffixes], sortedNames: sortedSuffixes });

    // Assign new ranks
    tempRank[suffixes[0]] = 0;
    for (let i = 1; i < n; i++) {
      const prev = suffixes[i - 1];
      const curr = suffixes[i];
      const prevNext = prev + k < n ? rank[prev + k] : -1;
      const currNext = curr + k < n ? rank[curr + k] : -1;
      tempRank[curr] = tempRank[prev] +
        (rank[prev] === rank[curr] && prevNext === currNext ? 0 : 1);
    }

    for (let i = 0; i < n; i++) rank[i] = tempRank[i];

    recorder.add('compute', [], 3,
      `Updated ranks: [${rank.join(', ')}]`,
      [...rank], { rank: [...rank] });

    // Check if all ranks are unique
    if (rank[suffixes[n - 1]] === n - 1) {
      recorder.add('compute', [], 4,
        `All ranks are unique. Suffix array construction complete.`,
        [...suffixes], {});
      break;
    }

    k *= 2;
  }

  // Final suffix array
  const sa = [...suffixes];
  const saSnapshot = [...sa];

  recorder.add('message', [], 5,
    `Suffix array for "${str}":`,
    [...saSnapshot], {});

  for (let i = 0; i < n; i++) {
    recorder.add('sorted', [i], 5,
      `SA[${i}] = ${sa[i]} -> "${chars.slice(sa[i]).join('')}"`,
      [...saSnapshot], { position: i, suffixIndex: sa[i], suffix: chars.slice(sa[i]).join('') });
  }

  recorder.add('sorted', [], 0,
    `Suffix array construction complete. SA = [${sa.join(', ')}]. Suffixes in sorted order: ${sa.map(i => '"' + chars.slice(i).join('') + '"').join(', ')}.`,
    [...saSnapshot], { suffixArray: sa });

  return recorder.getSteps();
}
