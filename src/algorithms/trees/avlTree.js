import StepRecorder from '../../engine/StepRecorder';

export const meta = {
  name: 'AVL Tree',
  slug: 'avl-tree',
  category: 'trees',
  timeComplexity: { best: 'O(log n)', average: 'O(log n)', worst: 'O(log n)' },
  spaceComplexity: 'O(n)',
  description:
    'Self-balancing BST that maintains a height difference of at most 1 between subtrees using rotations. Shows balance factors and demonstrates left, right, left-right, and right-left rotations.',
  rendererType: 'tree',
  pseudocode: [
    'function insert(node, value):',
    '  BST insert, then update height',
    '  balance = height(left) - height(right)',
    '  if balance > 1: rotate right (or LR)',
    '  if balance < -1: rotate left (or RL)',
    '  return node',
  ],
  inputSchema: {
    type: 'array',
    constraints: { minLength: 2, maxLength: 15, minValue: 1, maxValue: 99 },
  },
};

export const defaultInput = [30, 20, 40, 10, 25, 35, 50];

export function generateSteps(input) {
  const recorder = new StepRecorder();

  class AVLNode {
    constructor(id, value) {
      this.id = id;
      this.value = value;
      this.left = null;
      this.right = null;
      this.height = 1;
    }
  }

  let nextId = 0;

  function height(node) {
    return node ? node.height : 0;
  }

  function balanceFactor(node) {
    return node ? height(node.left) - height(node.right) : 0;
  }

  function updateHeight(node) {
    node.height = 1 + Math.max(height(node.left), height(node.right));
  }

  function getSnapshot(root, highlightIds = [], insertedId = null) {
    const nodes = [];
    const edges = [];
    function traverse(node) {
      if (!node) return;
      let state = 'default';
      if (insertedId === node.id) state = 'inserted';
      else if (highlightIds.includes(node.id)) state = 'highlighted';
      nodes.push({ id: node.id, value: node.value, left: node.left ? node.left.id : null, right: node.right ? node.right.id : null, state });
      if (node.left) {
        edges.push({ from: node.id, to: node.left.id, state: highlightIds.includes(node.left.id) ? 'highlighted' : 'default' });
        traverse(node.left);
      }
      if (node.right) {
        edges.push({ from: node.id, to: node.right.id, state: highlightIds.includes(node.right.id) ? 'highlighted' : 'default' });
        traverse(node.right);
      }
    }
    traverse(root);
    return { nodes, edges };
  }

  function rightRotate(y) {
    const x = y.left;
    const t2 = x.right;
    x.right = y;
    y.left = t2;
    updateHeight(y);
    updateHeight(x);
    return x;
  }

  function leftRotate(x) {
    const y = x.right;
    const t2 = y.left;
    y.left = x;
    x.right = t2;
    updateHeight(x);
    updateHeight(y);
    return y;
  }

  let treeRoot = null;

  function insert(node, value) {
    if (!node) {
      const newNode = new AVLNode(nextId++, value);
      return newNode;
    }

    if (value < node.value) {
      node.left = insert(node.left, value);
    } else if (value > node.value) {
      node.right = insert(node.right, value);
    } else {
      return node;
    }

    updateHeight(node);
    const bf = balanceFactor(node);

    // Left Left
    if (bf > 1 && value < node.left.value) {
      recorder.add('visit', [], 4, `Node ${node.value} is unbalanced (BF=${bf}). Right rotation needed.`, getSnapshot(treeRoot, [node.id, node.left.id]), {});
      const rotated = rightRotate(node);
      recorder.add('visit', [], 4, `Right rotation at ${node.value} complete. New subtree root: ${rotated.value}`, getSnapshot(treeRoot, [rotated.id]), {});
      return rotated;
    }

    // Right Right
    if (bf < -1 && value > node.right.value) {
      recorder.add('visit', [], 4, `Node ${node.value} is unbalanced (BF=${bf}). Left rotation needed.`, getSnapshot(treeRoot, [node.id, node.right.id]), {});
      const rotated = leftRotate(node);
      recorder.add('visit', [], 4, `Left rotation at ${node.value} complete. New subtree root: ${rotated.value}`, getSnapshot(treeRoot, [rotated.id]), {});
      return rotated;
    }

    // Left Right
    if (bf > 1 && value > node.left.value) {
      recorder.add('visit', [], 4, `Node ${node.value} is unbalanced (BF=${bf}). Left-Right rotation needed.`, getSnapshot(treeRoot, [node.id, node.left.id]), {});
      node.left = leftRotate(node.left);
      const rotated = rightRotate(node);
      recorder.add('visit', [], 4, `Left-Right rotation at ${node.value} complete. New subtree root: ${rotated.value}`, getSnapshot(treeRoot, [rotated.id]), {});
      return rotated;
    }

    // Right Left
    if (bf < -1 && value < node.right.value) {
      recorder.add('visit', [], 4, `Node ${node.value} is unbalanced (BF=${bf}). Right-Left rotation needed.`, getSnapshot(treeRoot, [node.id, node.right.id]), {});
      node.right = rightRotate(node.right);
      const rotated = leftRotate(node);
      recorder.add('visit', [], 4, `Right-Left rotation at ${node.value} complete. New subtree root: ${rotated.value}`, getSnapshot(treeRoot, [rotated.id]), {});
      return rotated;
    }

    return node;
  }

  recorder.add('message', [], 0, `Building AVL tree from [${input.join(', ')}]`, { nodes: [], edges: [] }, {});

  for (const val of input) {
    recorder.add('insert', [], 0, `Inserting ${val} into AVL tree`, getSnapshot(treeRoot), {});
    treeRoot = insert(treeRoot, val);
    recorder.add('insert', [], 1, `Inserted ${val}. Tree is balanced.`, getSnapshot(treeRoot, [], nextId - 1), {});
  }

  recorder.add('message', [], 5, 'AVL tree construction complete! All nodes balanced.', getSnapshot(treeRoot), {});

  return recorder.getSteps();
}
