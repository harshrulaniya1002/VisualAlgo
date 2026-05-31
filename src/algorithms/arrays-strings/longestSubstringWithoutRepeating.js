import StepRecorder from '../../engine/StepRecorder';

export const meta = {
  name: 'Longest Substring Without Repeating Characters',
  slug: 'longest-substring-without-repeating',
  category: 'arrays-strings',
  timeComplexity: { best: 'O(n)', average: 'O(n)', worst: 'O(n)' },
  spaceComplexity: 'O(min(m, n))',
  description:
    'Finds the length of the longest substring without repeating characters using a sliding window with a set to track characters in the current window.',
  rendererType: 'bar',
  pseudocode: [
    'left = 0, maxLen = 0, charSet = {}',
    'for right = 0 to n - 1:',
    '  while arr[right] in charSet:',
    '    remove arr[left]; left++',
    '  add arr[right] to charSet',
    '  maxLen = max(maxLen, right-left+1)',
  ],
  inputSchema: {
    type: 'array',
    constraints: { minLength: 2, maxLength: 50, minValue: 65, maxValue: 122 },
  },
};

// Character codes for "abcabcbb"
export const defaultInput = [97, 98, 99, 97, 98, 99, 98, 98];

export function generateSteps(input) {
  const recorder = new StepRecorder();
  const arr = [...input];
  const n = arr.length;
  const chars = arr.map(c => String.fromCharCode(c));

  recorder.add('message', [], 0,
    `Finding longest substring without repeating chars in "${chars.join('')}"`,
    [...arr], { chars: [...chars] });

  let left = 0;
  let maxLen = 0;
  let bestLeft = 0, bestRight = -1;
  const charSet = new Set();

  for (let right = 0; right < n; right++) {
    recorder.add('visit', [right], 1,
      `Expand: check char '${chars[right]}' at index ${right}`,
      [...arr], { left, right, maxLen, window: chars.slice(left, right).join('') });

    while (charSet.has(arr[right])) {
      recorder.add('eliminate', [left], 3,
        `'${chars[right]}' already in window. Remove '${chars[left]}' at left=${left}`,
        [...arr], { left, right, removed: chars[left] });
      charSet.delete(arr[left]);
      left++;
    }

    charSet.add(arr[right]);
    const windowIndices = [];
    for (let k = left; k <= right; k++) windowIndices.push(k);

    recorder.add('highlight', windowIndices, 4,
      `Add '${chars[right]}'. Window: "${chars.slice(left, right + 1).join('')}" (length ${right - left + 1})`,
      [...arr], { left, right, windowStr: chars.slice(left, right + 1).join('') });

    if (right - left + 1 > maxLen) {
      maxLen = right - left + 1;
      bestLeft = left;
      bestRight = right;
      recorder.add('found', windowIndices, 5,
        `New maxLen = ${maxLen}: "${chars.slice(bestLeft, bestRight + 1).join('')}"`,
        [...arr], { maxLen, bestLeft, bestRight });
    }
  }

  const finalIndices = [];
  for (let k = bestLeft; k <= bestRight; k++) finalIndices.push(k);
  recorder.add('sorted', finalIndices, 0,
    `Complete! Longest substring = "${chars.slice(bestLeft, bestRight + 1).join('')}" (length ${maxLen})`,
    [...arr], { maxLen, bestLeft, bestRight });

  return recorder.getSteps();
}
