import StepRecorder from '../../engine/StepRecorder';

export const meta = {
  name: 'Minimum Platforms',
  slug: 'minimum-platforms',
  category: 'greedy',
  timeComplexity: { best: 'O(n log n)', average: 'O(n log n)', worst: 'O(n log n)' },
  spaceComplexity: 'O(1)',
  description:
    'Finds the minimum number of platforms needed at a station so no train waits. Input: [arr1,dep1, arr2,dep2, ...] arrival-departure time pairs.',
  rendererType: 'bar',
  pseudocode: [
    'Sort arrival times and departure times',
    'i = 0, j = 0, platforms = 0, maxPlatforms = 0',
    'while i < n',
    '  if arrival[i] <= departure[j]: platforms++, i++',
    '  else: platforms--, j++',
    'return maxPlatforms',
  ],
  inputSchema: {
    type: 'array',
    constraints: { minLength: 4, maxLength: 24, minValue: 0, maxValue: 24 },
  },
};

// arrival-departure pairs (hours)
export const defaultInput = [9, 12, 9, 14, 10, 11, 11, 13, 15, 19, 18, 20];

export function generateSteps(input) {
  const recorder = new StepRecorder();
  const arrivals = [];
  const departures = [];
  for (let i = 0; i < input.length; i += 2) {
    arrivals.push(input[i]);
    departures.push(input[i + 1]);
  }
  const n = arrivals.length;

  // Show arrivals as bar heights initially
  recorder.add('message', [], 0, `Minimum Platforms: ${n} trains`, [...arrivals], {});

  arrivals.sort((a, b) => a - b);
  departures.sort((a, b) => a - b);

  recorder.add('compute', [], 0, `Sorted arrivals: [${arrivals}], departures: [${departures}]`, [...arrivals], {});

  let i = 0, j = 0;
  let platforms = 0, maxPlatforms = 0;
  const platformHistory = [];

  while (i < n) {
    if (arrivals[i] <= departures[j]) {
      platforms++;
      if (platforms > maxPlatforms) maxPlatforms = platforms;
      platformHistory.push(platforms);

      recorder.add('compute', [platformHistory.length - 1], 3, `Train arrives at ${arrivals[i]}. Platforms needed: ${platforms}`, [...platformHistory], {});
      i++;
    } else {
      platforms--;
      platformHistory.push(platforms);

      recorder.add('compute', [platformHistory.length - 1], 4, `Train departs at ${departures[j]}. Platforms needed: ${platforms}`, [...platformHistory], {});
      j++;
    }

    if (platforms === maxPlatforms) {
      recorder.add('sorted', [platformHistory.length - 1], 3, `Peak platforms so far: ${maxPlatforms}`, [...platformHistory], {});
    }
  }

  recorder.add('message', [], 5, `Minimum platforms required = ${maxPlatforms}`, [...platformHistory], {});

  return recorder.getSteps();
}
