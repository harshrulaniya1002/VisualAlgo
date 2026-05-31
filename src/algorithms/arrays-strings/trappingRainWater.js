import StepRecorder from '../../engine/StepRecorder';

export const meta = {
  name: 'Trapping Rain Water',
  slug: 'trapping-rain-water',
  category: 'arrays-strings',
  timeComplexity: { best: 'O(n)', average: 'O(n)', worst: 'O(n)' },
  spaceComplexity: 'O(1)',
  description:
    'Calculates how much water can be trapped between elevation bars using two pointers. Water at each position is min(leftMax, rightMax) - height.',
  rendererType: 'bar',
  pseudocode: [
    'left = 0, right = n-1',
    'leftMax = 0, rightMax = 0, water = 0',
    'while left < right:',
    '  if arr[left] < arr[right]:',
    '    leftMax = max(leftMax, arr[left])',
    '    water += leftMax - arr[left]; left++',
  ],
  inputSchema: {
    type: 'array',
    constraints: { minLength: 2, maxLength: 50, minValue: 0, maxValue: 999 },
  },
};

export const defaultInput = [0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1];

export function generateSteps(input) {
  const recorder = new StepRecorder();
  const arr = [...input];
  const n = arr.length;

  let left = 0, right = n - 1;
  let leftMax = 0, rightMax = 0;
  let totalWater = 0;

  recorder.add('message', [], 0,
    `Calculating trapped rain water using two pointers`,
    [...arr], { left, right, leftMax, rightMax, totalWater });

  while (left < right) {
    recorder.add('compare', [left, right], 3,
      `Compare arr[left=${left}] = ${arr[left]} vs arr[right=${right}] = ${arr[right]}`,
      [...arr], { left, right, leftMax, rightMax, totalWater });

    if (arr[left] < arr[right]) {
      if (arr[left] >= leftMax) {
        leftMax = arr[left];
        recorder.add('visit', [left], 4,
          `arr[${left}] = ${arr[left]} >= leftMax. Update leftMax = ${leftMax}. No water trapped.`,
          [...arr], { left, right, leftMax, rightMax, totalWater });
      } else {
        const water = leftMax - arr[left];
        totalWater += water;
        recorder.add('compute', [left], 5,
          `Water at ${left}: leftMax(${leftMax}) - arr[${left}](${arr[left]}) = ${water}. Total = ${totalWater}`,
          [...arr], { left, right, leftMax, rightMax, totalWater, waterAt: left, waterAmount: water });
      }
      left++;
    } else {
      if (arr[right] >= rightMax) {
        rightMax = arr[right];
        recorder.add('visit', [right], 4,
          `arr[${right}] = ${arr[right]} >= rightMax. Update rightMax = ${rightMax}. No water trapped.`,
          [...arr], { left, right, leftMax, rightMax, totalWater });
      } else {
        const water = rightMax - arr[right];
        totalWater += water;
        recorder.add('compute', [right], 5,
          `Water at ${right}: rightMax(${rightMax}) - arr[${right}](${arr[right]}) = ${water}. Total = ${totalWater}`,
          [...arr], { left, right, leftMax, rightMax, totalWater, waterAt: right, waterAmount: water });
      }
      right--;
    }
  }

  recorder.add('sorted', Array.from({ length: n }, (_, i) => i), 0,
    `Complete! Total trapped water = ${totalWater} units`,
    [...arr], { totalWater });

  return recorder.getSteps();
}
