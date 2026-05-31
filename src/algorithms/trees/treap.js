import StepRecorder from '../../engine/StepRecorder';

export const meta = {
  name: 'Treap',
  slug: 'treap',
  category: 'trees',
  timeComplexity: { best: 'O(log n)', average: 'O(log n)', worst: 'O(n)' },
  spaceComplexity: 'O(n)',
  description:
    'Combines BST ordering on keys with heap ordering on random priorities. Each node has a key (BST property) and a random priority (max-heap property). Rotations maintain both properties.',
  rendererType: 'tree',
  pseudocode: [
    'function insert(node, key):',
    '  assign random priority to new node',
    '  BST insert by key',
    '  if left child priority > node priority: rotate right',
    '  if right child priority > node priority: rotate left',
  ],
  inputSchema: {
    type: 'array',
    constraints: { minLength: 2, maxLength: 15, minValue: 1, maxValue: 99 },
  },
};

export const defaultInput = [50, 30, 70, 20, 40, 60, 80];

export function generateSteps(input) {
  const recorder = new StepRecorder();

  // Seeded pseudo-random for reproducibility
  let seed = 42;
  function pseudoRandom() {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    return seed % 100;
  }

  class TreapNode {
    constructor(id, key, priority) {
      this.id = id;
      this.key = key;
      this.priority = priority;
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
      nodes.push({ id: node.id, value: `${node.key}(p${node.priority})`, left: node.left ? node.left.id : null, right: node.right ? node.right.id : null, state });
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

  function rightRotate(node) {
    const y = node.left;
    node.left = y.right;
    y.right = node;
    return y;
  }

  function leftRotate(node) {
    const y = node.right;
    node.right = y.left;
    y.left = node;
    return y;
  }

  function insert(node, key) {
    if (!node) {
      const priority = pseudoRandom();
      const newNode = new TreapNode(nextId++, key, priority);
      recorder.add('insert', [], 1, `Create node key=${key}, priority=${priority}`, getSnapshot(treeRoot, [], newNode.id), {});
      return newNode;
    }

    if (key < node.key) {
      recorder.add('visit', [], 2, `${key} < ${node.key}, go left`, getSnapshot(treeRoot, [node.id]), {});
      node.left = insert(node.left, key);
      if (node.left.priority > node.priority) {
        recorder.add('visit', [], 3, `Left child priority ${node.left.priority} > ${node.priority}, rotate right`, getSnapshot(treeRoot, [node.id, node.left.id]), {});
        node = rightRotate(node);
      }
    } else if (key > node.key) {
      recorder.add('visit', [], 2, `${key} > ${node.key}, go right`, getSnapshot(treeRoot, [node.id]), {});
      node.right = insert(node.right, key);
      if (node.right.priority > node.priority) {
        recorder.add('visit', [], 4, `Right child priority ${node.right.priority} > ${node.priority}, rotate left`, getSnapshot(treeRoot, [node.id, node.right.id]), {});
        node = leftRotate(node);
      }
    }

    return node;
  }

  let treeRoot = null;

  recorder.add('message', [], 0, `Building Treap from [${input.join(', ')}] with random priorities`, { nodes: [], edges: [] }, {});

  for (const val of input) {
    recorder.add('message', [], 0, `Inserting key ${val}`, getSnapshot(treeRoot), {});
    treeRoot = insert(treeRoot, val);
    recorder.add('visit', [], 0, `Tree after inserting ${val}`, getSnapshot(treeRoot), {});
  }

  recorder.add('message', [], 4, 'Treap construction complete! BST on keys, max-heap on priorities.', getSnapshot(treeRoot), {});

  return recorder.getSteps();
}
