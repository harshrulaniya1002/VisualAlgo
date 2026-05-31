import StepRecorder from '../../engine/StepRecorder';

export const meta = {
  name: 'Huffman Coding',
  slug: 'huffman-coding',
  category: 'greedy',
  timeComplexity: { best: 'O(n log n)', average: 'O(n log n)', worst: 'O(n log n)' },
  spaceComplexity: 'O(n)',
  description:
    'Builds an optimal prefix-free code for data compression by repeatedly merging the two least frequent symbols. Input: array of character frequencies.',
  rendererType: 'bar',
  pseudocode: [
    'Create leaf node for each symbol',
    'Insert all nodes into a min-heap',
    'while heap.size > 1',
    '  left = extractMin(), right = extractMin()',
    '  merged = new node(freq = left.freq + right.freq)',
    '  insert merged into heap',
  ],
  inputSchema: {
    type: 'array',
    constraints: { minLength: 2, maxLength: 10, minValue: 1, maxValue: 99 },
  },
};

export const defaultInput = [5, 9, 12, 13, 16, 45];

export function generateSteps(input) {
  const recorder = new StepRecorder();
  const freqs = [...input];
  const n = freqs.length;

  recorder.add('message', [], 0, `Huffman Coding: ${n} symbols with frequencies [${freqs}]`, [...freqs], {});

  // Simple priority queue using sorted array
  let heap = freqs.map((f, i) => ({ freq: f, label: `S${i}` }));
  heap.sort((a, b) => a.freq - b.freq);

  let vizArr = heap.map(h => h.freq);
  recorder.add('compute', [], 1, 'Initialize min-heap with all frequencies', [...vizArr], {});

  let step = 0;
  while (heap.length > 1) {
    const left = heap.shift();
    const right = heap.shift();
    const merged = { freq: left.freq + right.freq, label: `(${left.label}+${right.label})` };

    vizArr = heap.map(h => h.freq);
    recorder.add('compare', [0, 1], 2, `Extract two smallest: ${left.label}=${left.freq} and ${right.label}=${right.freq}`, [left.freq, right.freq, ...vizArr], {});

    // Insert merged back
    let inserted = false;
    for (let i = 0; i < heap.length; i++) {
      if (merged.freq <= heap[i].freq) {
        heap.splice(i, 0, merged);
        inserted = true;
        break;
      }
    }
    if (!inserted) heap.push(merged);

    vizArr = heap.map(h => h.freq);
    recorder.add('sorted', [step < vizArr.length ? step : 0], 4, `Merge: ${left.freq} + ${right.freq} = ${merged.freq}. Heap: [${vizArr}]`, [...vizArr], {});

    step++;
  }

  recorder.add('message', [], 5, `Huffman tree root frequency = ${heap[0].freq}. Coding complete!`, [heap[0].freq], {});

  return recorder.getSteps();
}
