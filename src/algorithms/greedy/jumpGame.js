import StepRecorder from '../../engine/StepRecorder';

export const meta = {
  name: 'Jump Game',
  slug: 'jump-game',
  category: 'greedy',
  timeComplexity: { best: 'O(n)', average: 'O(n)', worst: 'O(n)' },
  spaceComplexity: 'O(1)',
  description:
    'Determines if the last index is reachable by greedily tracking the farthest reachable position. Each element represents the max jump length from that position.',
  rendererType: 'bar',
  pseudocode: [
    'farthest = 0',
    'for i = 0 to n-1',
    '  if i > farthest: return false',
    '  farthest = max(farthest, i + nums[i])',
    '  if farthest >= n-1: return true',
  ],
  inputSchema: {
    type: 'array',
    constraints: { minLength: 2, maxLength: 15, minValue: 0, maxValue: 10 },
  },
};

export const defaultInput = [2, 3, 1, 1, 4];

export function generateSteps(input) {
  const recorder = new StepRecorder();
  const nums = [...input];
  const n = nums.length;

  recorder.add('message', [], 0, `Jump Game: Can we reach index ${n - 1}? nums=[${nums}]`, [...nums], {});

  let farthest = 0;
  recorder.add('compute', [0], 0, 'Start: farthest reachable = 0', [...nums], {});

  for (let i = 0; i < n; i++) {
    if (i > farthest) {
      recorder.add('compute', [i], 2, `Index ${i} is beyond farthest reachable (${farthest}). Cannot proceed!`, [...nums], {});
      recorder.add('message', [], 2, 'Result: CANNOT reach the last index', [...nums], {});
      return recorder.getSteps();
    }

    const newFarthest = i + nums[i];
    recorder.add('compare', [i], 1, `At index ${i}, jump up to ${nums[i]}. Can reach ${newFarthest}. Current farthest=${farthest}`, [...nums], {});

    if (newFarthest > farthest) {
      farthest = newFarthest;
      recorder.add('compute', [i], 3, `farthest updated to ${farthest}`, [...nums], {});
    }

    if (farthest >= n - 1) {
      recorder.add('sorted', [n - 1], 4, `farthest=${farthest} >= last index ${n - 1}. Reachable!`, [...nums], {});
      recorder.add('message', [], 4, 'Result: CAN reach the last index', [...nums], {});
      return recorder.getSteps();
    }

    recorder.add('sorted', [i], 3, `Index ${i} processed. Farthest = ${farthest}`, [...nums], {});
  }

  recorder.add('message', [], 4, `Result: ${farthest >= n - 1 ? 'CAN' : 'CANNOT'} reach the last index`, [...nums], {});

  return recorder.getSteps();
}
