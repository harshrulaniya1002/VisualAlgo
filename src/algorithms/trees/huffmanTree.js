import StepRecorder from '../../engine/StepRecorder';

export const meta = {
  name: 'Huffman Tree',
  slug: 'huffman-tree',
  category: 'trees',
  timeComplexity: { best: 'O(n log n)', average: 'O(n log n)', worst: 'O(n log n)' },
  spaceComplexity: 'O(n)',
  description:
    'Builds an optimal prefix-free binary tree for data compression based on character frequencies. Repeatedly merges the two lowest-frequency nodes until a single tree remains.',
  rendererType: 'tree',
  pseudocode: [
    'function buildHuffman(frequencies):',
    '  create leaf for each character',
    '  while queue has > 1 node:',
    '    take two minimum frequency nodes',
    '    merge into new node (sum of freqs)',
    '    insert merged node back into queue',
  ],
  inputSchema: {
    type: 'array',
    constraints: { minLength: 2, maxLength: 10, minValue: 1, maxValue: 99 },
  },
};

// Frequencies for characters a, b, c, d, e, f
export const defaultInput = [5, 9, 12, 13, 16, 45];

export function generateSteps(input) {
  const recorder = new StepRecorder();
  const chars = 'abcdefghijklmnopqrstuvwxyz';

  class HuffNode {
    constructor(id, char, freq) {
      this.id = id;
      this.char = char;
      this.freq = freq;
      this.left = null;
      this.right = null;
    }
  }

  let nextId = 0;

  function getSnapshot(root, highlightIds = [], insertedId = null) {
    const nodes = [];
    const edges = [];
    function traverse(node) {
      if (!node) return;
      let state = 'default';
      if (insertedId === node.id) state = 'inserted';
      else if (highlightIds.includes(node.id)) state = 'highlighted';
      const label = node.char ? `${node.char}:${node.freq}` : `${node.freq}`;
      nodes.push({ id: node.id, value: label, left: node.left ? node.left.id : null, right: node.right ? node.right.id : null, state });
      if (node.left) {
        edges.push({ from: node.id, to: node.left.id, state: 'default' });
        traverse(node.left);
      }
      if (node.right) {
        edges.push({ from: node.id, to: node.right.id, state: 'default' });
        traverse(node.right);
      }
    }
    traverse(root);
    return { nodes, edges };
  }

  // Min-heap via array
  const heap = [];

  function heapPush(node) {
    heap.push(node);
    let i = heap.length - 1;
    while (i > 0) {
      const parent = Math.floor((i - 1) / 2);
      if (heap[parent].freq > heap[i].freq) {
        [heap[parent], heap[i]] = [heap[i], heap[parent]];
        i = parent;
      } else break;
    }
  }

  function heapPop() {
    if (heap.length === 1) return heap.pop();
    const top = heap[0];
    heap[0] = heap.pop();
    let i = 0;
    while (true) {
      let smallest = i;
      const left = 2 * i + 1;
      const right = 2 * i + 2;
      if (left < heap.length && heap[left].freq < heap[smallest].freq) smallest = left;
      if (right < heap.length && heap[right].freq < heap[smallest].freq) smallest = right;
      if (smallest !== i) {
        [heap[i], heap[smallest]] = [heap[smallest], heap[i]];
        i = smallest;
      } else break;
    }
    return top;
  }

  const charFreqs = input.map((freq, i) => ({ char: chars[i], freq }));
  recorder.add('message', [], 0, `Building Huffman tree from frequencies: ${charFreqs.map(c => `${c.char}:${c.freq}`).join(', ')}`, { nodes: [], edges: [] }, {});

  // Create leaf nodes
  for (const cf of charFreqs) {
    const node = new HuffNode(nextId++, cf.char, cf.freq);
    heapPush(node);
    recorder.add('insert', [], 1, `Create leaf node '${cf.char}' with frequency ${cf.freq}`, getSnapshot(node, [], node.id), {});
  }

  recorder.add('message', [], 0, `${heap.length} nodes in priority queue. Start merging.`, { nodes: [], edges: [] }, {});

  let finalRoot = null;

  while (heap.length > 1) {
    const left = heapPop();
    const right = heapPop();

    recorder.add('visit', [], 2, `Extract two minimum: '${left.char || left.freq}' (freq=${left.freq}) and '${right.char || right.freq}' (freq=${right.freq})`, getSnapshot(left, [left.id, right.id]), {});

    const merged = new HuffNode(nextId++, null, left.freq + right.freq);
    merged.left = left;
    merged.right = right;

    recorder.add('insert', [], 3, `Merge into new node with frequency ${merged.freq} = ${left.freq} + ${right.freq}`, getSnapshot(merged, [], merged.id), {});

    heapPush(merged);
    finalRoot = merged;
  }

  if (heap.length === 1) {
    finalRoot = heap[0];
  }

  recorder.add('message', [], 4, 'Huffman tree complete! Left edges = 0, right edges = 1.', getSnapshot(finalRoot), {});

  // Show codes
  const codes = [];
  function getCodes(node, prefix) {
    if (!node) return;
    if (node.char) {
      codes.push(`${node.char}: ${prefix || '0'}`);
      return;
    }
    getCodes(node.left, prefix + '0');
    getCodes(node.right, prefix + '1');
  }

  getCodes(finalRoot, '');
  recorder.add('message', [], 5, `Huffman codes: ${codes.join(', ')}`, getSnapshot(finalRoot), {});

  return recorder.getSteps();
}
