import StepRecorder from '../../engine/StepRecorder';

export const meta = {
  name: 'Segment Tree with Lazy Propagation',
  slug: 'segment-tree-lazy',
  category: 'trees',
  timeComplexity: { best: 'O(log n)', average: 'O(log n)', worst: 'O(log n)' },
  spaceComplexity: 'O(n)',
  description:
    'Extends segment tree to support range updates efficiently by deferring updates to children. Lazy values are propagated only when a node is accessed, keeping range update and query at O(log n).',
  rendererType: 'tree',
  pseudocode: [
    'function rangeUpdate(node, start, end, l, r, val):',
    '  propagate lazy to children if pending',
    '  if outside range: return',
    '  if fully inside: apply update, mark lazy',
    '  else: recurse on children, merge results',
  ],
  inputSchema: {
    type: 'array',
    constraints: { minLength: 2, maxLength: 16, minValue: 1, maxValue: 50 },
  },
};

export const defaultInput = [1, 3, 5, 7, 9, 11];

export function generateSteps(input) {
  const recorder = new StepRecorder();
  const n = input.length;
  const size = 4 * n;
  const tree = new Array(size).fill(0);
  const lazy = new Array(size).fill(0);

  function getSnapshot(highlightNodes = []) {
    const nodes = [];
    const edges = [];
    function traverse(idx, start, end) {
      if (start > end || idx >= size) return;
      let state = highlightNodes.includes(idx) ? 'highlighted' : 'default';
      const lazyStr = lazy[idx] !== 0 ? ` L:${lazy[idx]}` : '';
      const label = start === end ? `[${start}]=${tree[idx]}${lazyStr}` : `[${start}-${end}]=${tree[idx]}${lazyStr}`;
      const leftChild = start < end ? 2 * idx + 1 : null;
      const rightChild = start < end ? 2 * idx + 2 : null;
      nodes.push({ id: idx, value: label, left: leftChild, right: rightChild, state });
      const mid = Math.floor((start + end) / 2);
      if (start < end) {
        if (leftChild !== null) {
          edges.push({ from: idx, to: leftChild, state: 'default' });
          traverse(leftChild, start, mid);
        }
        if (rightChild !== null) {
          edges.push({ from: idx, to: rightChild, state: 'default' });
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
      return;
    }
    const mid = Math.floor((start + end) / 2);
    build(2 * idx + 1, start, mid);
    build(2 * idx + 2, mid + 1, end);
    tree[idx] = tree[2 * idx + 1] + tree[2 * idx + 2];
  }

  function propagate(idx, start, end) {
    if (lazy[idx] !== 0) {
      const mid = Math.floor((start + end) / 2);
      tree[idx] += lazy[idx] * (end - start + 1);
      if (start !== end) {
        lazy[2 * idx + 1] += lazy[idx];
        lazy[2 * idx + 2] += lazy[idx];
      }
      lazy[idx] = 0;
    }
  }

  function rangeUpdate(idx, start, end, l, r, val) {
    propagate(idx, start, end);
    if (r < start || end < l) {
      recorder.add('visit', [], 2, `Range [${start}-${end}] outside update [${l}-${r}], skip`, getSnapshot([idx]), {});
      return;
    }
    if (l <= start && end <= r) {
      recorder.add('visit', [], 3, `Range [${start}-${end}] fully inside [${l}-${r}], add ${val} lazily`, getSnapshot([idx]), {});
      lazy[idx] += val;
      propagate(idx, start, end);
      recorder.add('visit', [], 3, `Updated: tree[${idx}] = ${tree[idx]}`, getSnapshot([idx]), {});
      return;
    }
    const mid = Math.floor((start + end) / 2);
    recorder.add('visit', [], 4, `Partial overlap [${start}-${end}], recurse children`, getSnapshot([idx]), {});
    rangeUpdate(2 * idx + 1, start, mid, l, r, val);
    rangeUpdate(2 * idx + 2, mid + 1, end, l, r, val);
    tree[idx] = tree[2 * idx + 1] + tree[2 * idx + 2];
  }

  recorder.add('message', [], 0, `Building segment tree with lazy propagation for [${input.join(', ')}]`, { nodes: [], edges: [] }, {});

  build(0, 0, n - 1);
  recorder.add('message', [], 0, `Tree built. Root sum = ${tree[0]}`, getSnapshot(), {});

  // Range update: add 10 to range [1, 3]
  const ul = 1, ur = Math.min(3, n - 1), addVal = 10;
  recorder.add('message', [], 0, `Range update: add ${addVal} to indices [${ul}, ${ur}]`, getSnapshot(), {});
  rangeUpdate(0, 0, n - 1, ul, ur, addVal);
  recorder.add('message', [], 4, `Range update complete. Root sum = ${tree[0]}`, getSnapshot(), {});

  // Second update
  const ul2 = 0, ur2 = Math.min(2, n - 1), addVal2 = 5;
  recorder.add('message', [], 0, `Range update: add ${addVal2} to indices [${ul2}, ${ur2}]`, getSnapshot(), {});
  rangeUpdate(0, 0, n - 1, ul2, ur2, addVal2);
  recorder.add('message', [], 4, `All updates complete. Final root sum = ${tree[0]}`, getSnapshot(), {});

  return recorder.getSteps();
}
