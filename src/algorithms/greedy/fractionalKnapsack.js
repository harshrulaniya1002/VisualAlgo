import StepRecorder from '../../engine/StepRecorder';

export const meta = {
  name: 'Fractional Knapsack',
  slug: 'fractional-knapsack',
  category: 'greedy',
  timeComplexity: { best: 'O(n log n)', average: 'O(n log n)', worst: 'O(n log n)' },
  spaceComplexity: 'O(1)',
  description:
    'Maximizes knapsack value by greedily taking items with the highest value-to-weight ratio, allowing fractions. Input: [W, w1,v1, w2,v2, ...].',
  rendererType: 'bar',
  pseudocode: [
    'Compute ratio = value/weight for each item',
    'Sort items by ratio descending',
    'for each item',
    '  take min(remaining capacity, weight)',
    '  add proportional value',
  ],
  inputSchema: {
    type: 'array',
    constraints: { minLength: 3, maxLength: 15, minValue: 1, maxValue: 50 },
  },
};

// Input: [W, w1,v1, w2,v2, ...]
export const defaultInput = [50, 10, 60, 20, 100, 30, 120];

export function generateSteps(input) {
  const recorder = new StepRecorder();
  const W = input[0];
  const items = [];
  for (let i = 1; i < input.length; i += 2) {
    items.push({ weight: input[i], value: input[i + 1], ratio: input[i + 1] / input[i] });
  }

  const ratios = items.map(it => Math.round(it.ratio * 10) / 10);
  recorder.add('message', [], 0, `Fractional Knapsack: ${items.length} items, capacity W=${W}`, [...ratios], {});

  // Sort by value/weight ratio descending
  items.sort((a, b) => b.ratio - a.ratio);
  const sortedRatios = items.map(it => Math.round(it.ratio * 10) / 10);
  recorder.add('compute', [], 0, 'Sort items by value/weight ratio (descending)', [...sortedRatios], {});

  let remaining = W;
  let totalValue = 0;
  const takenFractions = items.map(() => 0);

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    recorder.add('compare', [i], 2, `Item (wt=${item.weight}, val=${item.value}, ratio=${item.ratio.toFixed(1)}). Remaining capacity=${remaining}`, [...takenFractions], {});

    if (remaining <= 0) {
      recorder.add('compute', [i], 2, 'Knapsack full, skip remaining items', [...takenFractions], {});
      break;
    }

    const take = Math.min(remaining, item.weight);
    const fraction = take / item.weight;
    const gained = fraction * item.value;
    totalValue += gained;
    remaining -= take;
    takenFractions[i] = Math.round(fraction * 100);

    if (fraction === 1) {
      recorder.add('sorted', [i], 3, `Take full item: +${gained.toFixed(1)} value. Total=${totalValue.toFixed(1)}`, [...takenFractions], {});
    } else {
      recorder.add('sorted', [i], 3, `Take ${(fraction * 100).toFixed(0)}% of item: +${gained.toFixed(1)} value. Total=${totalValue.toFixed(1)}`, [...takenFractions], {});
    }
  }

  recorder.add('message', [], 4, `Maximum value = ${totalValue.toFixed(1)}`, [...takenFractions], {});

  return recorder.getSteps();
}
