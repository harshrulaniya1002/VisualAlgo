import StepRecorder from '../../engine/StepRecorder';

export const meta = {
  name: "Moore's Voting Algorithm",
  slug: 'moores-voting-algorithm',
  category: 'arrays-strings',
  timeComplexity: { best: 'O(n)', average: 'O(n)', worst: 'O(n)' },
  spaceComplexity: 'O(1)',
  description:
    "Boyer-Moore Voting Algorithm finds the majority element (appearing more than n/2 times) in linear time. It maintains a candidate and a count, updating the candidate when the count reaches zero.",
  rendererType: 'bar',
  pseudocode: [
    'candidate = null, count = 0',
    'for each element in arr:',
    '  if count == 0: candidate = element',
    '  count += (element == candidate) ? 1 : -1',
    'verify candidate appears > n/2 times',
  ],
  inputSchema: {
    type: 'array',
    constraints: { minLength: 2, maxLength: 50, minValue: 0, maxValue: 999 },
  },
};

export const defaultInput = [2, 2, 1, 1, 2, 2, 1, 2, 2];

export function generateSteps(input) {
  const recorder = new StepRecorder();
  const arr = [...input];
  const n = arr.length;

  let candidate = null;
  let count = 0;

  recorder.add('message', [], 0,
    `Starting Moore's Voting Algorithm on ${n} elements`,
    [...arr], { candidate, count });

  // Phase 1: Find candidate
  for (let i = 0; i < n; i++) {
    if (count === 0) {
      candidate = arr[i];
      recorder.add('highlight', [i], 2,
        `Count is 0: set candidate = ${arr[i]}`,
        [...arr], { candidate, count: 1 });
      count = 1;
    } else if (arr[i] === candidate) {
      count++;
      recorder.add('visit', [i], 3,
        `arr[${i}] = ${arr[i]} matches candidate ${candidate}. count++ = ${count}`,
        [...arr], { candidate, count });
    } else {
      count--;
      recorder.add('eliminate', [i], 3,
        `arr[${i}] = ${arr[i]} != candidate ${candidate}. count-- = ${count}`,
        [...arr], { candidate, count });
    }
  }

  recorder.add('message', [], 0,
    `Phase 1 complete. Candidate = ${candidate}. Now verifying...`,
    [...arr], { candidate });

  // Phase 2: Verify
  let actualCount = 0;
  const candidateIndices = [];
  for (let i = 0; i < n; i++) {
    if (arr[i] === candidate) {
      actualCount++;
      candidateIndices.push(i);
      recorder.add('visit', [i], 4,
        `arr[${i}] = ${candidate} (match). Count = ${actualCount}`,
        [...arr], { candidate, actualCount });
    } else {
      recorder.add('compare', [i], 4,
        `arr[${i}] = ${arr[i]} (no match)`,
        [...arr], { candidate, actualCount });
    }
  }

  if (actualCount > n / 2) {
    recorder.add('found', candidateIndices, 4,
      `Verified! ${candidate} appears ${actualCount} times (> ${n}/2 = ${Math.floor(n / 2)}). It is the majority element.`,
      [...arr], { candidate, actualCount });
  } else {
    recorder.add('message', [], 4,
      `${candidate} appears ${actualCount} times (<= ${n}/2). No majority element exists.`,
      [...arr], { candidate, actualCount });
  }

  return recorder.getSteps();
}
