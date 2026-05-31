import StepRecorder from '../../engine/StepRecorder';

export const meta = {
  name: 'Optimal Merge Pattern',
  slug: 'optimal-merge-pattern',
  category: 'greedy',
  timeComplexity: { best: 'O(n log n)', average: 'O(n log n)', worst: 'O(n log n)' },
  spaceComplexity: 'O(n)',
  description:
    'Minimizes the total cost of merging sorted files by always merging the two smallest files first. Input: array of file sizes.',
  rendererType: 'bar',
  pseudocode: [
    'Insert all file sizes into a min-heap',
    'totalCost = 0',
    'while heap.size > 1',
    '  a = extractMin(), b = extractMin()',
    '  totalCost += a + b',
    '  insert (a + b) into heap',
  ],
  inputSchema: {
    type: 'array',
    constraints: { minLength: 2, maxLength: 10, minValue: 1, maxValue: 99 },
  },
};

export const defaultInput = [2, 3, 4, 5, 6, 7];

export function generateSteps(input) {
  const recorder = new StepRecorder();
  const files = [...input];

  recorder.add('message', [], 0, `Optimal Merge Pattern: ${files.length} files, sizes=[${files}]`, [...files], {});

  // Min-heap via sorted array
  let heap = [...files].sort((a, b) => a - b);
  recorder.add('compute', [], 0, 'Sort files into min-heap', [...heap], {});

  let totalCost = 0;

  while (heap.length > 1) {
    const a = heap.shift();
    const b = heap.shift();
    const merged = a + b;
    totalCost += merged;

    recorder.add('compare', [0, 1], 2, `Extract two smallest: ${a} and ${b}`, [a, b, ...heap], {});

    // Insert merged back in sorted position
    let inserted = false;
    for (let i = 0; i < heap.length; i++) {
      if (merged <= heap[i]) {
        heap.splice(i, 0, merged);
        inserted = true;
        break;
      }
    }
    if (!inserted) heap.push(merged);

    recorder.add('sorted', [0], 4, `Merge cost: ${a} + ${b} = ${merged}. Total cost = ${totalCost}. Heap: [${heap}]`, [...heap], {});
  }

  recorder.add('message', [], 5, `Total minimum merge cost = ${totalCost}`, [...heap], {});

  return recorder.getSteps();
}
