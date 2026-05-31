import StepRecorder from '../../engine/StepRecorder';

export const meta = {
  name: 'Merge Sort Tree',
  slug: 'merge-sort-tree',
  category: 'trees',
  timeComplexity: { best: 'O(n log^2 n)', average: 'O(n log^2 n)', worst: 'O(n log^2 n)' },
  spaceComplexity: 'O(n log n)',
  description:
    'A segment tree where each node stores a sorted list of its range, enabling order-statistic range queries. Built bottom-up by merging sorted lists from children.',
  rendererType: 'tree',
  pseudocode: [
    'function build(node, start, end):',
    '  if start == end: tree[node] = [arr[start]]',
    '  else: build left, build right',
    '  tree[node] = merge(tree[left], tree[right])',
    '  query: binary search in merged lists',
  ],
  inputSchema: {
    type: 'array',
    constraints: { minLength: 2, maxLength: 8, minValue: 1, maxValue: 99 },
  },
};

export const defaultInput = [3, 1, 5, 2, 7, 4];

export function generateSteps(input) {
  const recorder = new StepRecorder();
  const n = input.length;
  const size = 4 * n;
  const tree = new Array(size).fill(null).map(() => []);

  function getSnapshot(highlightNodes = [], insertedNode = null) {
    const nodes = [];
    const edges = [];
    function traverse(idx, start, end) {
      if (start > end || idx >= size || tree[idx].length === 0) return;
      let state = 'default';
      if (insertedNode === idx) state = 'inserted';
      else if (highlightNodes.includes(idx)) state = 'highlighted';
      const label = `[${tree[idx].join(',')}]`;
      const leftChild = start < end ? 2 * idx + 1 : null;
      const rightChild = start < end ? 2 * idx + 2 : null;
      nodes.push({ id: idx, value: label, left: leftChild, right: rightChild, state });
      const mid = Math.floor((start + end) / 2);
      if (start < end) {
        if (leftChild !== null && tree[leftChild] && tree[leftChild].length > 0) {
          edges.push({ from: idx, to: leftChild, state: 'default' });
          traverse(leftChild, start, mid);
        }
        if (rightChild !== null && tree[rightChild] && tree[rightChild].length > 0) {
          edges.push({ from: idx, to: rightChild, state: 'default' });
          traverse(rightChild, mid + 1, end);
        }
      }
    }
    traverse(0, 0, n - 1);
    return { nodes, edges };
  }

  function mergeSorted(a, b) {
    const result = [];
    let i = 0, j = 0;
    while (i < a.length && j < b.length) {
      if (a[i] <= b[j]) result.push(a[i++]);
      else result.push(b[j++]);
    }
    while (i < a.length) result.push(a[i++]);
    while (j < b.length) result.push(b[j++]);
    return result;
  }

  function build(idx, start, end) {
    if (start === end) {
      tree[idx] = [input[start]];
      recorder.add('insert', [], 1, `Leaf: tree[${idx}] = [${input[start]}] for index ${start}`, getSnapshot([], idx), {});
      return;
    }
    const mid = Math.floor((start + end) / 2);
    recorder.add('visit', [], 2, `Building range [${start}-${end}], split at ${mid}`, getSnapshot([idx]), {});
    build(2 * idx + 1, start, mid);
    build(2 * idx + 2, mid + 1, end);
    tree[idx] = mergeSorted(tree[2 * idx + 1], tree[2 * idx + 2]);
    recorder.add('compute', [], 3, `Merge: [${tree[2 * idx + 1].join(',')}] + [${tree[2 * idx + 2].join(',')}] = [${tree[idx].join(',')}]`, getSnapshot([idx], idx), {});
  }

  recorder.add('message', [], 0, `Building merge sort tree for [${input.join(', ')}]`, { nodes: [], edges: [] }, {});

  build(0, 0, n - 1);

  recorder.add('message', [], 3, `Merge sort tree built! Root has sorted array: [${tree[0].join(', ')}]`, getSnapshot(), {});

  // Demonstrate a query: count elements <= k in range [l, r]
  const l = 0, r = Math.min(3, n - 1), k = 4;
  recorder.add('message', [], 0, `Query: count elements <= ${k} in range [${l}, ${r}]`, getSnapshot(), {});

  function query(idx, start, end, ql, qr, val) {
    if (qr < start || end < ql) return 0;
    if (ql <= start && end <= qr) {
      // Binary search for count of elements <= val
      let lo = 0, hi = tree[idx].length;
      while (lo < hi) {
        const mid2 = Math.floor((lo + hi) / 2);
        if (tree[idx][mid2] <= val) lo = mid2 + 1;
        else hi = mid2;
      }
      recorder.add('visit', [], 4, `Range [${start}-${end}] fully inside. ${lo} elements <= ${val}`, getSnapshot([idx]), {});
      return lo;
    }
    const mid = Math.floor((start + end) / 2);
    return query(2 * idx + 1, start, mid, ql, qr, val) + query(2 * idx + 2, mid + 1, end, ql, qr, val);
  }

  const count = query(0, 0, n - 1, l, r, k);
  recorder.add('message', [], 4, `Count of elements <= ${k} in range [${l}, ${r}] = ${count}`, getSnapshot(), {});

  return recorder.getSteps();
}
