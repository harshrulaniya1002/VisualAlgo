import StepRecorder from '../../engine/StepRecorder';

export const meta = {
  name: 'Activity Selection',
  slug: 'activity-selection',
  category: 'greedy',
  timeComplexity: { best: 'O(n log n)', average: 'O(n log n)', worst: 'O(n log n)' },
  spaceComplexity: 'O(1)',
  description:
    'Selects the maximum number of non-overlapping activities by greedily choosing the earliest finishing ones. Input: [s1,f1, s2,f2, ...] start-finish pairs.',
  rendererType: 'bar',
  pseudocode: [
    'Sort activities by finish time',
    'Select first activity',
    'for each remaining activity',
    '  if start >= lastFinish',
    '    select it, update lastFinish',
  ],
  inputSchema: {
    type: 'array',
    constraints: { minLength: 4, maxLength: 20, minValue: 0, maxValue: 20 },
  },
};

// start-finish pairs
export const defaultInput = [1, 4, 3, 5, 0, 6, 5, 7, 3, 9, 5, 9, 6, 10, 8, 11, 8, 12, 2, 14, 12, 16];

export function generateSteps(input) {
  const recorder = new StepRecorder();
  const activities = [];
  for (let i = 0; i < input.length; i += 2) {
    activities.push({ start: input[i], end: input[i + 1], idx: i / 2 });
  }

  // Show finish times as bar heights
  const finishTimes = activities.map(a => a.end);
  recorder.add('message', [], 0, `Activity Selection: ${activities.length} activities`, [...finishTimes], {});

  // Sort by finish time
  activities.sort((a, b) => a.end - b.end);
  const sorted = activities.map(a => a.end);
  recorder.add('compute', [], 0, 'Sort activities by finish time', [...sorted], {});

  const selected = [];
  let lastFinish = -1;

  for (let i = 0; i < activities.length; i++) {
    const act = activities[i];
    recorder.add('compare', [i], 2, `Activity ${act.idx} [${act.start}, ${act.end}): start=${act.start} >= lastFinish=${lastFinish}?`, [...sorted], {});

    if (act.start >= lastFinish) {
      selected.push(act);
      lastFinish = act.end;
      recorder.add('sorted', [i], 4, `Selected! Activity [${act.start}, ${act.end}). Count=${selected.length}`, [...sorted], {});
    } else {
      recorder.add('compute', [i], 3, `Skipped (overlaps). start=${act.start} < lastFinish=${lastFinish}`, [...sorted], {});
    }
  }

  recorder.add('message', [], 4, `Maximum activities selected: ${selected.length}`, [...sorted], {});

  return recorder.getSteps();
}
