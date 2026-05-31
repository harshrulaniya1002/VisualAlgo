import StepRecorder from '../../engine/StepRecorder';

export const meta = {
  name: 'Gas Station',
  slug: 'gas-station',
  category: 'greedy',
  timeComplexity: { best: 'O(n)', average: 'O(n)', worst: 'O(n)' },
  spaceComplexity: 'O(1)',
  description:
    'Finds the starting gas station for a circular tour by tracking the cumulative fuel surplus greedily. Input: [g1,c1, g2,c2, ...] gas-cost pairs.',
  rendererType: 'bar',
  pseudocode: [
    'totalSurplus = 0, currentSurplus = 0, start = 0',
    'for i = 0 to n-1',
    '  surplus = gas[i] - cost[i]',
    '  totalSurplus += surplus',
    '  currentSurplus += surplus',
    '  if currentSurplus < 0: start = i+1, currentSurplus = 0',
  ],
  inputSchema: {
    type: 'array',
    constraints: { minLength: 4, maxLength: 20, minValue: 0, maxValue: 20 },
  },
};

// gas-cost pairs
export const defaultInput = [1, 3, 2, 4, 3, 5, 4, 1, 5, 2];

export function generateSteps(input) {
  const recorder = new StepRecorder();
  const gas = [];
  const cost = [];
  for (let i = 0; i < input.length; i += 2) {
    gas.push(input[i]);
    cost.push(input[i + 1]);
  }
  const n = gas.length;

  // Show net surplus at each station
  const surplus = gas.map((g, i) => g - cost[i]);
  recorder.add('message', [], 0, `Gas Station: ${n} stations. Gas=[${gas}], Cost=[${cost}]`, [...surplus], {});
  recorder.add('compute', [], 0, `Net surplus at each station: [${surplus}]`, [...surplus], {});

  let totalSurplus = 0;
  let currentSurplus = 0;
  let start = 0;
  const cumSurplus = new Array(n).fill(0);

  for (let i = 0; i < n; i++) {
    const s = gas[i] - cost[i];
    totalSurplus += s;
    currentSurplus += s;
    cumSurplus[i] = currentSurplus;

    recorder.add('compute', [i], 1, `Station ${i}: gas=${gas[i]}, cost=${cost[i]}, surplus=${s}. Tank=${currentSurplus}`, [...cumSurplus], {});

    if (currentSurplus < 0) {
      recorder.add('compare', [i], 4, `Tank empty (${currentSurplus} < 0)! Reset start to ${i + 1}`, [...cumSurplus], {});
      start = i + 1;
      currentSurplus = 0;
      // Reset visualization
      for (let j = 0; j <= i; j++) cumSurplus[j] = 0;
    } else {
      recorder.add('sorted', [i], 3, `Station ${i} OK. Current start=${start}, tank=${currentSurplus}`, [...cumSurplus], {});
    }
  }

  if (totalSurplus >= 0) {
    recorder.add('sorted', [start], 5, `Answer: Start at station ${start} (total surplus=${totalSurplus} >= 0)`, [...cumSurplus], {});
  } else {
    recorder.add('message', [], 5, `No solution: total surplus = ${totalSurplus} < 0`, [...cumSurplus], {});
  }

  return recorder.getSteps();
}
