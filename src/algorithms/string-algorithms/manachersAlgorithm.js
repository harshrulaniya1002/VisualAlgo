import StepRecorder from '../../engine/StepRecorder';

export const meta = {
  name: "Manacher's Algorithm",
  slug: 'manachers-algorithm',
  category: 'string-algorithms',
  timeComplexity: { best: 'O(n)', average: 'O(n)', worst: 'O(n)' },
  spaceComplexity: 'O(n)',
  description:
    "Manacher's algorithm finds the longest palindromic substring in linear time. It maintains a center and right boundary of the rightmost palindrome found, using mirror positions to skip redundant comparisons when expanding around each center.",
  rendererType: 'bar',
  pseudocode: [
    'Transform: insert separators between chars',
    'P[0] = 0; center = 0, right = 0',
    'for i = 1 to len-1:',
    '  mirror = 2*center - i',
    '  if i < right: P[i] = min(right - i, P[mirror])',
    '  expand while chars match',
    '  if i + P[i] > right: center = i, right = i + P[i]',
  ],
  inputSchema: {
    type: 'array',
    constraints: { minLength: 2, maxLength: 100, minValue: 0, maxValue: 999 },
  },
};

// String "ABACABA" as char codes
export const defaultInput = [65, 66, 65, 67, 65, 66, 65];

export function generateSteps(input) {
  const recorder = new StepRecorder();
  const arr = [...input];
  const n = arr.length;
  const chars = arr.map(c => String.fromCharCode(c));
  const str = chars.join('');

  recorder.add('message', [], 0,
    `Manacher's Algorithm: find longest palindromic substring in "${str}" (length ${n})`,
    [...arr], { string: str });

  // Transform: insert '#' (code 35) separators
  // Transformed: # A # B # A # C # A # B # A #
  const SEP = 35; // '#'
  const t = [];
  t.push(SEP);
  for (let i = 0; i < n; i++) {
    t.push(arr[i]);
    t.push(SEP);
  }
  const tLen = t.length;
  const tChars = t.map(c => String.fromCharCode(c));

  recorder.add('compute', [], 0,
    `Transform string with separators: "${tChars.join('')}" (length ${tLen})`,
    [...t], { transformed: tChars.join('') });

  // Manacher's core
  const P = new Array(tLen).fill(0);
  let center = 0;
  let right = 0;

  recorder.add('compute', [], 1,
    `Initialize: center = 0, right = 0, P = [${P.join(', ')}]`,
    [...P], { center, right });

  for (let i = 0; i < tLen; i++) {
    const mirror = 2 * center - i;

    recorder.add('visit', [i], 2,
      `Position i = ${i} ('${tChars[i]}'). Center = ${center}, right boundary = ${right}, mirror = ${mirror}`,
      [...P], { i, center, right, mirror });

    if (i < right && mirror >= 0) {
      P[i] = Math.min(right - i, P[mirror]);
      recorder.add('compute', [i], 4,
        `i < right: P[${i}] = min(right - i, P[mirror]) = min(${right - i}, ${P[mirror]}) = ${P[i]}`,
        [...P], { i, reused: P[i] });
    }

    // Expand around center i
    let expanded = false;
    while (
      i + P[i] + 1 < tLen &&
      i - P[i] - 1 >= 0 &&
      t[i + P[i] + 1] === t[i - P[i] - 1]
    ) {
      P[i]++;
      expanded = true;
      recorder.add('compare', [i - P[i], i + P[i]], 5,
        `Expand: '${tChars[i - P[i]]}' == '${tChars[i + P[i]]}'. P[${i}] = ${P[i]}`,
        [...P], { left: i - P[i], right: i + P[i], radius: P[i] });
    }

    if (!expanded && P[i] === 0) {
      recorder.add('compute', [i], 5,
        `Cannot expand at position ${i}. P[${i}] = 0`,
        [...P], { i });
    }

    // Update center and right boundary
    if (i + P[i] > right) {
      const oldCenter = center;
      const oldRight = right;
      center = i;
      right = i + P[i];
      recorder.add('compute', [i], 6,
        `Update boundary: center ${oldCenter} -> ${center}, right ${oldRight} -> ${right}`,
        [...P], { center, right });
    }

    recorder.add('highlight', [i], 2,
      `P[${i}] = ${P[i]}. Palindrome around '${tChars[i]}' has radius ${P[i]}`,
      [...P], { P: [...P] });
  }

  // Find the longest palindrome
  let maxLen = 0;
  let maxCenter = 0;
  for (let i = 0; i < tLen; i++) {
    if (P[i] > maxLen) {
      maxLen = P[i];
      maxCenter = i;
    }
  }

  // Convert back to original string indices
  const origStart = Math.floor((maxCenter - maxLen) / 2);
  const origLen = maxLen;
  const longestPalin = chars.slice(origStart, origStart + origLen).join('');

  const palindromeIndices = [];
  for (let i = origStart; i < origStart + origLen; i++) {
    palindromeIndices.push(i);
  }

  recorder.add('found', palindromeIndices, 0,
    `Longest palindromic substring: "${longestPalin}" (length ${origLen}, starting at index ${origStart})`,
    [...arr], { longestPalindrome: longestPalin, start: origStart, length: origLen });

  recorder.add('sorted', palindromeIndices, 0,
    `Manacher's algorithm complete. P-array: [${P.join(', ')}]. Longest palindrome: "${longestPalin}".`,
    [...arr], { P: [...P] });

  return recorder.getSteps();
}
