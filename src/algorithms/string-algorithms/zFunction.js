import StepRecorder from '../../engine/StepRecorder';

export const meta = {
  name: 'Z-Function',
  slug: 'z-function',
  category: 'string-algorithms',
  timeComplexity: { best: 'O(n)', average: 'O(n)', worst: 'O(n)' },
  spaceComplexity: 'O(n)',
  description:
    'The Z-function for a string computes an array Z where Z[i] is the length of the longest substring starting at position i that matches a prefix of the string. It runs in linear time using a window [l, r] to avoid redundant comparisons.',
  rendererType: 'bar',
  pseudocode: [
    'Z[0] = n (or undefined, by convention)',
    'l = 0, r = 0',
    'for i = 1 to n-1:',
    '  if i < r: Z[i] = min(r - i, Z[i - l])',
    '  while i + Z[i] < n and s[Z[i]] == s[i + Z[i]]: Z[i]++',
    '  if i + Z[i] > r: l = i, r = i + Z[i]',
  ],
  inputSchema: {
    type: 'array',
    constraints: { minLength: 2, maxLength: 100, minValue: 0, maxValue: 999 },
  },
};

// String "AABAABAA" as char codes
export const defaultInput = [65, 65, 66, 65, 65, 66, 65, 65];

export function generateSteps(input) {
  const recorder = new StepRecorder();
  const arr = [...input];
  const n = arr.length;
  const chars = arr.map(c => String.fromCharCode(c));

  recorder.add('message', [], 0,
    `Computing Z-function for string "${chars.join('')}" (length ${n})`,
    [...arr], { string: chars.join('') });

  const Z = new Array(n).fill(0);
  Z[0] = n;

  recorder.add('compute', [0], 0,
    `Z[0] = ${n} (by convention, the entire string matches its own prefix)`,
    [...Z], { Z: [...Z] });

  let l = 0;
  let r = 0;

  recorder.add('compute', [], 1,
    `Initialize window boundaries: l = 0, r = 0`,
    [...Z], { l, r });

  for (let i = 1; i < n; i++) {
    recorder.add('visit', [i], 2,
      `Processing position i = ${i}, character '${chars[i]}'. Window [l=${l}, r=${r})`,
      [...Z], { i, l, r });

    if (i < r) {
      Z[i] = Math.min(r - i, Z[i - l]);
      recorder.add('compute', [i], 3,
        `i < r: Z[${i}] = min(r - i, Z[i - l]) = min(${r - i}, ${Z[i - l]}) = ${Z[i]}. Reuse previously computed values.`,
        [...Z], { i, Z: [...Z], reused: true });
    }

    // Try to extend
    let extended = false;
    while (i + Z[i] < n && arr[Z[i]] === arr[i + Z[i]]) {
      recorder.add('compare', [Z[i], i + Z[i]], 4,
        `Extend: s[${Z[i]}]='${chars[Z[i]]}' == s[${i + Z[i]}]='${chars[i + Z[i]]}'. Z[${i}] becomes ${Z[i] + 1}`,
        [...Z], { comparing: [Z[i], i + Z[i]] });
      Z[i]++;
      extended = true;
    }

    if (i + Z[i] < n && Z[i] > 0) {
      recorder.add('compare', [Z[i], i + Z[i]], 4,
        `Stop extending: s[${Z[i]}]='${chars[Z[i]]}' != s[${i + Z[i]}]='${chars[i + Z[i]]}'`,
        [...Z], {});
    }

    if (!extended && Z[i] === 0 && i >= r) {
      recorder.add('compute', [i], 4,
        `No match at position ${i}: s[0]='${chars[0]}' != s[${i}]='${chars[i]}'. Z[${i}] = 0`,
        [...Z], { i });
    }

    // Update window
    if (i + Z[i] > r) {
      const oldL = l;
      const oldR = r;
      l = i;
      r = i + Z[i];
      recorder.add('compute', [i], 5,
        `Update window: [l, r) changed from [${oldL}, ${oldR}) to [${l}, ${r})`,
        [...Z], { l, r });
    }

    recorder.add('highlight', [i], 2,
      `Z[${i}] = ${Z[i]}. Substring "${chars.slice(i, i + Z[i]).join('')}" matches prefix "${chars.slice(0, Z[i]).join('')}"`,
      [...Z], { Z: [...Z] });
  }

  recorder.add('sorted', [], 0,
    `Z-function complete: Z = [${Z.join(', ')}]. Each Z[i] gives the length of the longest prefix match starting at position i.`,
    [...Z], { Z: [...Z] });

  return recorder.getSteps();
}
