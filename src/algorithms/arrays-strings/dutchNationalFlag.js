import StepRecorder from '../../engine/StepRecorder';

export const meta = {
  name: 'Dutch National Flag',
  slug: 'dutch-national-flag',
  category: 'arrays-strings',
  timeComplexity: { best: 'O(n)', average: 'O(n)', worst: 'O(n)' },
  spaceComplexity: 'O(1)',
  description:
    'The Dutch National Flag algorithm (3-way partition) sorts an array of 0s, 1s, and 2s in a single pass using three pointers: low, mid, and high.',
  rendererType: 'bar',
  pseudocode: [
    'low = 0, mid = 0, high = n - 1',
    'while mid <= high:',
    '  if arr[mid] == 0: swap(low, mid); low++; mid++',
    '  else if arr[mid] == 1: mid++',
    '  else: swap(mid, high); high--',
  ],
  inputSchema: {
    type: 'array',
    constraints: { minLength: 2, maxLength: 50, minValue: 0, maxValue: 2 },
  },
};

export const defaultInput = [2, 0, 1, 2, 1, 0, 0, 2, 1];

export function generateSteps(input) {
  const recorder = new StepRecorder();
  const arr = [...input];
  const n = arr.length;

  let low = 0, mid = 0, high = n - 1;

  recorder.add('message', [], 0,
    `Starting Dutch National Flag: sort 0s, 1s, 2s. low=${low}, mid=${mid}, high=${high}`,
    [...arr], { low, mid, high });

  while (mid <= high) {
    recorder.add('compare', [mid], 1,
      `Check arr[mid=${mid}] = ${arr[mid]}. low=${low}, mid=${mid}, high=${high}`,
      [...arr], { low, mid, high });

    if (arr[mid] === 0) {
      [arr[low], arr[mid]] = [arr[mid], arr[low]];
      recorder.add('swap', [low, mid], 2,
        `arr[mid]=0: swap arr[${low}] and arr[${mid}]. low++, mid++`,
        [...arr], { low: low + 1, mid: mid + 1, high });
      low++;
      mid++;
    } else if (arr[mid] === 1) {
      recorder.add('visit', [mid], 3,
        `arr[mid]=1: already in place, mid++`,
        [...arr], { low, mid: mid + 1, high });
      mid++;
    } else {
      [arr[mid], arr[high]] = [arr[high], arr[mid]];
      recorder.add('swap', [mid, high], 4,
        `arr[mid]=2: swap arr[${mid}] and arr[${high}]. high--`,
        [...arr], { low, mid, high: high - 1 });
      high--;
    }
  }

  recorder.add('sorted', Array.from({ length: n }, (_, i) => i), 0,
    `Dutch National Flag complete! Array sorted: [${arr.join(', ')}]`,
    [...arr], {});

  return recorder.getSteps();
}
