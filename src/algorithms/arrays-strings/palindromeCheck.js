import StepRecorder from '../../engine/StepRecorder';

export const meta = {
  name: 'Palindrome Check',
  slug: 'palindrome-check',
  category: 'arrays-strings',
  timeComplexity: { best: 'O(n)', average: 'O(n)', worst: 'O(n)' },
  spaceComplexity: 'O(1)',
  description:
    'Checks if an array (or string represented as character codes) reads the same forwards and backwards using two pointers converging from both ends.',
  rendererType: 'bar',
  pseudocode: [
    'left = 0, right = n - 1',
    'while left < right:',
    '  if arr[left] != arr[right]: not palindrome',
    '  left++; right--',
    'return true (is palindrome)',
  ],
  inputSchema: {
    type: 'array',
    constraints: { minLength: 1, maxLength: 50, minValue: 0, maxValue: 999 },
  },
};

export const defaultInput = [1, 2, 3, 4, 3, 2, 1];

export function generateSteps(input) {
  const recorder = new StepRecorder();
  const arr = [...input];
  const n = arr.length;

  let left = 0, right = n - 1;
  let isPalindrome = true;

  recorder.add('message', [], 0,
    `Checking if [${arr.join(', ')}] is a palindrome`,
    [...arr], { left, right });

  while (left < right) {
    recorder.add('compare', [left, right], 2,
      `Compare arr[${left}] = ${arr[left]} with arr[${right}] = ${arr[right]}`,
      [...arr], { left, right });

    if (arr[left] !== arr[right]) {
      isPalindrome = false;
      recorder.add('eliminate', [left, right], 2,
        `Mismatch! arr[${left}] = ${arr[left]} != arr[${right}] = ${arr[right]}. NOT a palindrome.`,
        [...arr], { left, right, isPalindrome: false });
      break;
    }

    recorder.add('found', [left, right], 3,
      `Match! arr[${left}] = ${arr[left]} == arr[${right}] = ${arr[right]}. Move inward.`,
      [...arr], { left, right });

    left++;
    right--;
  }

  if (isPalindrome) {
    if (left === right) {
      recorder.add('visit', [left], 3,
        `Middle element arr[${left}] = ${arr[left]} (no pair needed)`,
        [...arr], { left, right });
    }
    recorder.add('sorted', Array.from({ length: n }, (_, i) => i), 4,
      `The array IS a palindrome!`,
      [...arr], { isPalindrome: true });
  } else {
    recorder.add('message', [], 4,
      `The array is NOT a palindrome.`,
      [...arr], { isPalindrome: false });
  }

  return recorder.getSteps();
}
