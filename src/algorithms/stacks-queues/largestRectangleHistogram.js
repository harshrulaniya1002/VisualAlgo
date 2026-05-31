import StepRecorder from '../../engine/StepRecorder';

export const meta = {
  name: 'Largest Rectangle in Histogram',
  slug: 'largest-rectangle-histogram',
  category: 'stacks-queues',
  timeComplexity: { best: 'O(n)', average: 'O(n)', worst: 'O(n)' },
  spaceComplexity: 'O(n)',
  description:
    'Finds the largest rectangular area in a histogram. Uses a stack to track bar indices and computes areas when a shorter bar is encountered.',
  rendererType: 'bar',
  pseudocode: [
    'for i = 0 to n:',
    '  while stack not empty and h[stack.top] > h[i]:',
    '    height = h[stack.pop()]',
    '    width = stack empty ? i : i - stack.top - 1',
    '    maxArea = max(maxArea, height * width)',
    '  push i onto stack',
  ],
  inputSchema: {
    type: 'array',
    constraints: {
      minLength: 2,
      maxLength: 50,
      minValue: 0,
      maxValue: 999,
    },
  },
};

export const defaultInput = [2, 1, 5, 6, 2, 3];

export function generateSteps(input) {
  const recorder = new StepRecorder();
  const arr = [...input];
  const n = arr.length;
  const stack = []; // stores indices
  let maxArea = 0;
  let bestLeft = 0;
  let bestRight = 0;
  let bestHeight = 0;

  recorder.add(
    'message',
    [],
    0,
    `Finding the largest rectangle in a histogram with ${n} bars.`,
    [...arr],
    {}
  );

  for (let i = 0; i <= n; i++) {
    const currHeight = i < n ? arr[i] : 0;

    if (i < n) {
      recorder.add(
        'visit',
        [i],
        0,
        `Processing bar at index ${i} with height ${currHeight}. Stack indices: [${stack.join(', ')}].`,
        [...arr],
        { stack: [...stack], maxArea }
      );
    }

    while (stack.length > 0 && arr[stack[stack.length - 1]] > currHeight) {
      const topIdx = stack.pop();
      const height = arr[topIdx];
      const width = stack.length === 0 ? i : i - stack[stack.length - 1] - 1;
      const area = height * width;

      const leftBound = stack.length === 0 ? 0 : stack[stack.length - 1] + 1;
      const rightBound = i - 1;

      const indices = [];
      for (let j = leftBound; j <= rightBound; j++) indices.push(j);

      if (area > maxArea) {
        maxArea = area;
        bestLeft = leftBound;
        bestRight = rightBound;
        bestHeight = height;
      }

      recorder.add(
        'compare',
        indices,
        2,
        `Pop index ${topIdx} (height=${height}). Width=${width} (from ${leftBound} to ${rightBound}). Area=${area}. Max area so far=${maxArea}.`,
        [...arr],
        { operation: 'computeArea', height, width, area, maxArea }
      );
    }

    if (i < n) {
      stack.push(i);
      recorder.add(
        'insert',
        [i],
        5,
        `Push index ${i} onto stack. Stack indices: [${stack.join(', ')}].`,
        [...arr],
        { stack: [...stack] }
      );
    }
  }

  const bestIndices = [];
  for (let j = bestLeft; j <= bestRight; j++) bestIndices.push(j);

  recorder.add(
    'sorted',
    bestIndices,
    4,
    `Largest rectangle area = ${maxArea} (height=${bestHeight}, from index ${bestLeft} to ${bestRight}).`,
    [...arr],
    { maxArea, bestLeft, bestRight, bestHeight }
  );

  return recorder.getSteps();
}
