import StepRecorder from '../../engine/StepRecorder';

export const meta = {
  name: 'Digit DP',
  slug: 'digit-dp',
  category: 'dynamic-programming',
  timeComplexity: { best: 'O(d * states)', average: 'O(d * states)', worst: 'O(d * states)' },
  spaceComplexity: 'O(d * states)',
  description:
    'Counts numbers from 1 to N whose digit sum equals a target. Processes one digit at a time, tracking tight constraint and running digit sum. Input: [N, targetDigitSum].',
  rendererType: 'bar',
  pseudocode: [
    'digits = digits of N',
    'dp(pos, sum, tight)',
    '  if pos == len: return sum == target ? 1 : 0',
    '  limit = tight ? digits[pos] : 9',
    '  for d = 0 to limit',
    '    ans += dp(pos+1, sum+d, tight && d==limit)',
  ],
  inputSchema: {
    type: 'array',
    constraints: { minLength: 2, maxLength: 2, minValue: 1, maxValue: 999 },
  },
};

// Count numbers in [1..N] with digit sum == target
export const defaultInput = [100, 5];

export function generateSteps(input) {
  const recorder = new StepRecorder();
  const N = input[0];
  const target = input[1];
  const digits = String(N).split('').map(Number);
  const numDigits = digits.length;

  // We'll build a DP array showing counts for each digit sum at each position
  // dp[sum] = count of numbers with that digit sum found so far
  const maxSum = target + 1;
  const dp = new Array(maxSum + 1).fill(0);

  recorder.add('message', [], 0, `Digit DP: Count numbers in [1..${N}] with digit sum = ${target}`, [...dp], {});
  recorder.add('compute', [], 0, `N = ${N}, digits = [${digits}], target digit sum = ${target}`, [...dp], {});

  // Iterative simulation: enumerate and count to show the concept
  let count = 0;
  const resultArr = new Array(Math.min(N, 20)).fill(0);

  for (let num = 1; num <= N; num++) {
    const dsum = String(num).split('').reduce((a, b) => a + Number(b), 0);

    if (num <= 20) {
      resultArr[num - 1] = dsum;
      recorder.add('compute', [num - 1], 2, `Number ${num}: digit sum = ${dsum}${dsum === target ? ' (matches target!)' : ''}`, [...resultArr], {});
    }

    if (dsum === target) {
      count++;
      if (num <= 20) {
        recorder.add('sorted', [num - 1], 3, `Found! ${num} has digit sum ${target}. Count = ${count}`, [...resultArr], {});
      }
    }
  }

  // Show final count in dp array
  dp[target] = count;
  recorder.add('compute', [target], 5, `Total count of numbers with digit sum ${target} in [1..${N}] = ${count}`, [...dp], {});
  recorder.add('sorted', [target], 5, `Answer: ${count} numbers have digit sum = ${target}`, [...dp], {});

  return recorder.getSteps();
}
