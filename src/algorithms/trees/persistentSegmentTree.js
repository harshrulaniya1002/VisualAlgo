import StepRecorder from '../../engine/StepRecorder';

export const meta = {
  name: 'Persistent Segment Tree',
  slug: 'persistent-segment-tree',
  category: 'trees',
  timeComplexity: { best: 'O(log n)', average: 'O(log n)', worst: 'O(log n)' },
  spaceComplexity: 'O(n log n)',
  description:
    'A segment tree that preserves previous versions after updates by creating new nodes on the modification path. Each update creates O(log n) new nodes while sharing unchanged subtrees.',
  rendererType: 'tree',
  pseudocode: [
    'function update(prevRoot, pos, val):',
    '  create new node copying prev',
    '  if leaf: set value',
    '  else if pos <= mid: recurse left (new)',
    '  else: recurse right (new)',
    '  return new root (new version)',
  ],
  inputSchema: {
    type: 'array',
    constraints: { minLength: 2, maxLength: 8, minValue: 1, maxValue: 50 },
  },
};

export const defaultInput = [1, 2, 3, 4, 5];

export function generateSteps(input) {
  const recorder = new StepRecorder();
  const n = input.length;
  let nextId = 0;

  class PSTNode {
    constructor(val) {
      this.id = nextId++;
      this.val = val;
      this.left = null;
      this.right = null;
    }
  }

  const versions = [];

  function getSnapshot(root, highlightIds = [], insertedId = null, versionLabel = '') {
    const nodes = [];
    const edges = [];
    function traverse(node) {
      if (!node) return;
      let state = 'default';
      if (insertedId === node.id) state = 'inserted';
      else if (highlightIds.includes(node.id)) state = 'highlighted';
      nodes.push({ id: node.id, value: node.val, left: node.left ? node.left.id : null, right: node.right ? node.right.id : null, state });
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

  function build(start, end) {
    if (start === end) {
      return new PSTNode(input[start]);
    }
    const node = new PSTNode(0);
    const mid = Math.floor((start + end) / 2);
    node.left = build(start, mid);
    node.right = build(mid + 1, end);
    node.val = node.left.val + node.right.val;
    return node;
  }

  function update(prev, start, end, pos, val) {
    const node = new PSTNode(prev.val);
    node.left = prev.left;
    node.right = prev.right;

    if (start === end) {
      node.val = val;
      recorder.add('insert', [], 1, `New leaf: position ${pos} updated to ${val}`, getSnapshot(node, [], node.id), {});
      return node;
    }

    const mid = Math.floor((start + end) / 2);
    if (pos <= mid) {
      recorder.add('visit', [], 3, `Position ${pos} <= mid ${mid}, create new left child`, getSnapshot(node, [node.id]), {});
      node.left = update(prev.left, start, mid, pos, val);
    } else {
      recorder.add('visit', [], 4, `Position ${pos} > mid ${mid}, create new right child`, getSnapshot(node, [node.id]), {});
      node.right = update(prev.right, mid + 1, end, pos, val);
    }
    node.val = node.left.val + node.right.val;
    return node;
  }

  recorder.add('message', [], 0, `Building persistent segment tree for [${input.join(', ')}]`, { nodes: [], edges: [] }, {});

  // Build initial version
  const root0 = build(0, n - 1);
  versions.push(root0);
  recorder.add('message', [], 0, `Version 0 built. Root sum = ${root0.val}`, getSnapshot(root0), {});

  // Perform updates creating new versions
  const updates = [
    { pos: 0, val: 10 },
    { pos: Math.min(2, n - 1), val: 20 },
  ];

  for (let i = 0; i < updates.length; i++) {
    const { pos, val } = updates[i];
    recorder.add('message', [], 0, `Creating version ${i + 1}: update position ${pos} to ${val}`, getSnapshot(versions[versions.length - 1]), {});
    const newRoot = update(versions[versions.length - 1], 0, n - 1, pos, val);
    versions.push(newRoot);
    recorder.add('message', [], 5, `Version ${i + 1} created. Root sum = ${newRoot.val}. Previous versions preserved.`, getSnapshot(newRoot), {});
  }

  recorder.add('message', [], 5, `Persistent segment tree complete! ${versions.length} versions stored.`, getSnapshot(versions[versions.length - 1]), {});

  return recorder.getSteps();
}
