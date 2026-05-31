import StepRecorder from '../../engine/StepRecorder';

export const meta = {
  name: 'Coin Change',
  slug: 'coin-change',
  category: 'dynamic-programming',
  timeComplexity: { best: 'O(n * amount)', average: 'O(n * amount)', worst: 'O(n * amount)' },
  spaceComplexity: 'O(amount)',
  description:
    'Finds the minimum number of coins needed to make a given amount using a bottom-up DP approach. Input: [amount, coin1, coin2, ...].',
  rendererType: 'bar',
  hasTarget: true,
  pseudocode: [
    'dp[0] = 0',
    'for i = 1 to amount',
    '  for each coin',
    '    if coin <= i: dp[i] = min(dp[i], dp[i-coin] + 1)',
    'return dp[amount]',
  ],
  inputSchema: {
    type: 'array',
    constraints: { minLength: 2, maxLength: 15, minValue: 1, maxValue: 20 },
  },
};

// Input: [amount, coin1, coin2, ...]
export const defaultInput = [11, 1, 5, 6];

export function generateSteps(input) {
  const recorder = new StepRecorder();
  const amount = input[0];
  const coins = input.slice(1);
  const INF = amount + 1;

  const dp = new Array(amount + 1).fill(INF);
  dp[0] = 0;

  recorder.add('message', [], 0, `Coin Change: amount=${amount}, coins=[${coins}]`, [...dp], {});
  recorder.add('compute', [0], 0, 'Base case: dp[0] = 0 (0 coins needed for amount 0)', [...dp], {});

  for (let i = 1; i <= amount; i++) {
    recorder.add('compute', [i], 1, `Computing dp[${i}] - minimum coins for amount ${i}`, [...dp], {});

    for (const coin of coins) {
      if (coin <= i) {
        recorder.add('compare', [i, i - coin], 2, `Try coin ${coin}: dp[${i - coin}] + 1 = ${dp[i - coin] + 1} vs current dp[${i}] = ${dp[i] === INF ? 'INF' : dp[i]}`, [...dp], {});

        if (dp[i - coin] + 1 < dp[i]) {
          dp[i] = dp[i - coin] + 1;
          recorder.add('compute', [i], 3, `dp[${i}] = ${dp[i]} (using coin ${coin})`, [...dp], {});
        }
      }
    }

    recorder.add('sorted', [i], 3, `dp[${i}] = ${dp[i] === INF ? 'impossible' : dp[i]}`, [...dp], {});
  }

  const result = dp[amount] >= INF ? -1 : dp[amount];
  recorder.add('message', [], 4, `Minimum coins for amount ${amount} = ${result === -1 ? 'impossible' : result}`, [...dp], {});

  return recorder.getSteps();
}
