import StepRecorder from '../../engine/StepRecorder';

export const meta = {
  name: 'Segment Tree',
  slug: 'segment-tree',
  category: 'trees',
  timeComplexity: { best: 'O(log n)', average: 'O(log n)', worst: 'O(log n)' },
  spaceComplexity: 'O(n)',
  description:
    'A tree structure for efficient range queries and point updates on an array. Each node stores the sum of a segment; leaves hold individual elements, and internal nodes store aggregate results.',
  rendererType: 'tree',
  pseudocode: [
    'function build(node, start, end):',
    '  if start == end: tree[node] = arr[start]',
    '  else: mid = (start+end)/2',
    '  build left child, build right child',
    '  tree[node] = tree[left] + tree[right]',
  ],
  inputSchema: {
    type: 'array',
    constraints: { minLength: 2, maxLength: 16, minValue: 1, maxValue: 99 },
  },
};

export const defaultInput = [1, 3, 5, 7, 9, 11];

export function generateSteps(input) {
  const recorder = new StepRecorder();
  const n = input.length;
  const size = 4 * n;
  const tree = new Array(size).fill(0);

  function getSnapshot(highlightNodes = [], insertedNode = null) {
    const nodes = [];
    const edges = [];
    function traverse(idx, start, end) {
      if (start > end || idx >= size) return;
      if (tree[idx] === 0 && start !== end && idx > 2 * n) return;
      let state = 'default';
      if (insertedNode === idx) state = 'inserted';
      else if (highlightNodes.includes(idx)) state = 'highlighted';
      const label = start === end ? `[${start}]=${tree[idx]}` : `[${start}-${end}]=${tree[idx]}`;
      const leftChild = 2 * idx + 1 < size && start < end ? 2 * idx + 1 : null;
      const rightChild = 2 * idx + 2 < size && start < end ? 2 * idx + 2 : null;
      nodes.push({ id: idx, value: label, left: leftChild, right: rightChild, state });
      const mid = Math.floor((start + end) / 2);
      if (start < end) {
        if (leftChild !== null) {
          edges.push({ from: idx, to: leftChild, state: highlightNodes.includes(leftChild) ? 'highlighted' : 'default' });
          traverse(leftChild, start, mid);
        }
        if (rightChild !== null) {
          edges.push({ from: idx, to: rightChild, state: highlightNodes.includes(rightChild) ? 'highlighted' : 'default' });
          traverse(rightChild, mid + 1, end);
        }
      }
    }
    traverse(0, 0, n - 1);
    return { nodes, edges };
  }

  function build(idx, start, end) {
    if (start === end) {
      tree[idx] = input[start];
      recorder.add('insert', [], 1, `Leaf node: tree[${idx}] = arr[${start}] = ${input[start]}`, getSnapshot([], idx), {});
      return;
    }
    const mid = Math.floor((start + end) / 2);
    recorder.add('visit', [], 2, `Building segment [${start}-${end}], splitting at mid=${mid}`, getSnapshot([idx]), {});
    build(2 * idx + 1, start, mid);
    build(2 * idx + 2, mid + 1, end);
    tree[idx] = tree[2 * idx + 1] + tree[2 * idx + 2];
    recorder.add('compute', [], 4, `tree[${idx}] = ${tree[2 * idx + 1]} + ${tree[2 * idx + 2]} = ${tree[idx]} (range [${start}-${end}])`, getSnapshot([idx], idx), {});
  }

  recorder.add('message', [], 0, `Building segment tree for array [${input.join(', ')}]`, { nodes: [], edges: [] }, {});

  build(0, 0, n - 1);

  recorder.add('message', [], 4, `Segment tree built! Root holds total sum = ${tree[0]}`, getSnapshot(), {});

  // Demonstrate a range query
  const ql = 1;
  const qr = Math.min(3, n - 1);
  recorder.add('message', [], 0, `Querying sum of range [${ql}, ${qr}]`, getSnapshot(), {});

  function query(idx, start, end, l, r) {
    if (r < start || end < l) {
      recorder.add('visit', [], 0, `Range [${start}-${end}] outside query [${l}-${r}], return 0`, getSnapshot([idx]), {});
      return 0;
    }
    if (l <= start && end <= r) {
      recorder.add('visit', [], 0, `Range [${start}-${end}] fully inside query, return ${tree[idx]}`, getSnapshot([idx]), {});
      return tree[idx];
    }
    const mid = Math.floor((start + end) / 2);
    recorder.add('visit', [], 2, `Partial overlap [${start}-${end}], split at ${mid}`, getSnapshot([idx]), {});
    const left = query(2 * idx + 1, start, mid, l, r);
    const right = query(2 * idx + 2, mid + 1, end, l, r);
    return left + right;
  }

  const result = query(0, 0, n - 1, ql, qr);
  recorder.add('message', [], 4, `Range sum [${ql}, ${qr}] = ${result}`, getSnapshot(), {});

  return recorder.getSteps();
}
