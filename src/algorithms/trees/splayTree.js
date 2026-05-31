import StepRecorder from '../../engine/StepRecorder';

export const meta = {
  name: 'Splay Tree',
  slug: 'splay-tree',
  category: 'trees',
  timeComplexity: { best: 'O(1)', average: 'O(log n)', worst: 'O(log n) amortized' },
  spaceComplexity: 'O(n)',
  description:
    'A self-adjusting BST that moves recently accessed elements to the root via splaying operations. Uses zig, zig-zig, and zig-zag rotations to bring the accessed node to root.',
  rendererType: 'tree',
  pseudocode: [
    'function splay(node, key):',
    '  if key == node: return node',
    '  zig: single rotation if parent is root',
    '  zig-zig: two rotations same direction',
    '  zig-zag: two rotations different direction',
  ],
  inputSchema: {
    type: 'array',
    constraints: { minLength: 2, maxLength: 15, minValue: 1, maxValue: 99 },
  },
};

export const defaultInput = [40, 20, 50, 10, 30, 45, 60];

export function generateSteps(input) {
  const recorder = new StepRecorder();

  class SplayNode {
    constructor(id, value) {
      this.id = id;
      this.value = value;
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
      nodes.push({ id: node.id, value: node.value, left: node.left ? node.left.id : null, right: node.right ? node.right.id : null, state });
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

  function rightRotate(x) {
    const y = x.left;
    x.left = y.right;
    y.right = x;
    return y;
  }

  function leftRotate(x) {
    const y = x.right;
    x.right = y.left;
    y.left = x;
    return y;
  }

  function splay(root, key) {
    if (!root || root.value === key) return root;

    if (key < root.value) {
      if (!root.left) return root;

      if (key < root.left.value) {
        // Zig-Zig (left-left)
        root.left.left = splay(root.left.left, key);
        recorder.add('visit', [], 3, `Zig-Zig: rotating right at ${root.value}`, getSnapshot(root, [root.id]), {});
        root = rightRotate(root);
      } else if (key > root.left.value) {
        // Zig-Zag (left-right)
        root.left.right = splay(root.left.right, key);
        if (root.left.right) {
          recorder.add('visit', [], 4, `Zig-Zag: rotating left at ${root.left.value}`, getSnapshot(root, [root.left.id]), {});
          root.left = leftRotate(root.left);
        }
      }

      if (!root.left) return root;
      recorder.add('visit', [], 2, `Zig: rotating right at ${root.value}`, getSnapshot(root, [root.id]), {});
      return rightRotate(root);
    } else {
      if (!root.right) return root;

      if (key > root.right.value) {
        // Zig-Zig (right-right)
        root.right.right = splay(root.right.right, key);
        recorder.add('visit', [], 3, `Zig-Zig: rotating left at ${root.value}`, getSnapshot(root, [root.id]), {});
        root = leftRotate(root);
      } else if (key < root.right.value) {
        // Zig-Zag (right-left)
        root.right.left = splay(root.right.left, key);
        if (root.right.left) {
          recorder.add('visit', [], 4, `Zig-Zag: rotating right at ${root.right.value}`, getSnapshot(root, [root.right.id]), {});
          root.right = rightRotate(root.right);
        }
      }

      if (!root.right) return root;
      recorder.add('visit', [], 2, `Zig: rotating left at ${root.value}`, getSnapshot(root, [root.id]), {});
      return leftRotate(root);
    }
  }

  function insert(root, key) {
    if (!root) {
      return new SplayNode(nextId++, key);
    }

    root = splay(root, key);

    if (root.value === key) return root;

    const newNode = new SplayNode(nextId++, key);

    if (key < root.value) {
      newNode.right = root;
      newNode.left = root.left;
      root.left = null;
    } else {
      newNode.left = root;
      newNode.right = root.right;
      root.right = null;
    }

    return newNode;
  }

  let treeRoot = null;

  recorder.add('message', [], 0, `Building Splay tree from [${input.join(', ')}]`, { nodes: [], edges: [] }, {});

  for (const val of input) {
    recorder.add('message', [], 0, `Inserting ${val} and splaying to root`, getSnapshot(treeRoot), {});
    treeRoot = insert(treeRoot, val);
    recorder.add('insert', [], 0, `${val} is now the root after splaying`, getSnapshot(treeRoot, [], nextId - 1), {});
  }

  recorder.add('message', [], 4, 'Splay tree construction complete!', getSnapshot(treeRoot), {});

  return recorder.getSteps();
}
