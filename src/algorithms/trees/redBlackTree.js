import StepRecorder from '../../engine/StepRecorder';

export const meta = {
  name: 'Red-Black Tree',
  slug: 'red-black-tree',
  category: 'trees',
  timeComplexity: { best: 'O(log n)', average: 'O(log n)', worst: 'O(log n)' },
  spaceComplexity: 'O(n)',
  description:
    'Self-balancing BST with color properties ensuring the tree remains approximately balanced after modifications. Every node is red or black; the root is black; red nodes cannot have red children; all paths have equal black height.',
  rendererType: 'tree',
  pseudocode: [
    'function insert(value):',
    '  BST insert, color new node RED',
    '  fix violations (recolor/rotate)',
    '  if parent is red and uncle is red: recolor',
    '  if parent is red and uncle is black: rotate',
    '  root is always BLACK',
  ],
  inputSchema: {
    type: 'array',
    constraints: { minLength: 2, maxLength: 15, minValue: 1, maxValue: 99 },
  },
};

export const defaultInput = [10, 20, 30, 15, 25, 5, 35];

export function generateSteps(input) {
  const recorder = new StepRecorder();

  const RED = 'red';
  const BLACK = 'black';

  class RBNode {
    constructor(id, value) {
      this.id = id;
      this.value = value;
      this.left = null;
      this.right = null;
      this.parent = null;
      this.color = RED;
    }
  }

  let nextId = 0;
  let root = null;

  function getSnapshot(highlightIds = [], insertedId = null) {
    const nodes = [];
    const edges = [];
    function traverse(node) {
      if (!node) return;
      let state = 'default';
      if (insertedId === node.id) state = 'inserted';
      else if (highlightIds.includes(node.id)) state = 'highlighted';
      const label = `${node.value}(${node.color === RED ? 'R' : 'B'})`;
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

  function leftRotate(x) {
    const y = x.right;
    x.right = y.left;
    if (y.left) y.left.parent = x;
    y.parent = x.parent;
    if (!x.parent) root = y;
    else if (x === x.parent.left) x.parent.left = y;
    else x.parent.right = y;
    y.left = x;
    x.parent = y;
  }

  function rightRotate(y) {
    const x = y.left;
    y.left = x.right;
    if (x.right) x.right.parent = y;
    x.parent = y.parent;
    if (!y.parent) root = x;
    else if (y === y.parent.left) y.parent.left = x;
    else y.parent.right = x;
    x.right = y;
    y.parent = x;
  }

  function fixInsert(node) {
    while (node !== root && node.parent.color === RED) {
      const parent = node.parent;
      const grandparent = parent.parent;
      if (!grandparent) break;

      if (parent === grandparent.left) {
        const uncle = grandparent.right;
        if (uncle && uncle.color === RED) {
          recorder.add('visit', [], 3, `Uncle ${uncle.value} is RED: recolor parent ${parent.value}, uncle ${uncle.value} to BLACK, grandparent ${grandparent.value} to RED`, getSnapshot([parent.id, uncle.id, grandparent.id]), {});
          parent.color = BLACK;
          uncle.color = BLACK;
          grandparent.color = RED;
          node = grandparent;
        } else {
          if (node === parent.right) {
            recorder.add('visit', [], 4, `Left-Right case at ${grandparent.value}: left rotate at ${parent.value}`, getSnapshot([node.id, parent.id, grandparent.id]), {});
            node = parent;
            leftRotate(node);
          }
          recorder.add('visit', [], 4, `Left-Left case: right rotate at ${grandparent.value}, recolor`, getSnapshot([node.id, node.parent.id, grandparent.id]), {});
          node.parent.color = BLACK;
          grandparent.color = RED;
          rightRotate(grandparent);
        }
      } else {
        const uncle = grandparent.left;
        if (uncle && uncle.color === RED) {
          recorder.add('visit', [], 3, `Uncle ${uncle.value} is RED: recolor parent ${parent.value}, uncle ${uncle.value} to BLACK, grandparent ${grandparent.value} to RED`, getSnapshot([parent.id, uncle.id, grandparent.id]), {});
          parent.color = BLACK;
          uncle.color = BLACK;
          grandparent.color = RED;
          node = grandparent;
        } else {
          if (node === parent.left) {
            recorder.add('visit', [], 4, `Right-Left case at ${grandparent.value}: right rotate at ${parent.value}`, getSnapshot([node.id, parent.id, grandparent.id]), {});
            node = parent;
            rightRotate(node);
          }
          recorder.add('visit', [], 4, `Right-Right case: left rotate at ${grandparent.value}, recolor`, getSnapshot([node.id, node.parent.id, grandparent.id]), {});
          node.parent.color = BLACK;
          grandparent.color = RED;
          leftRotate(grandparent);
        }
      }
    }
    root.color = BLACK;
  }

  function insertNode(value) {
    const newNode = new RBNode(nextId++, value);
    if (!root) {
      root = newNode;
      root.color = BLACK;
      recorder.add('insert', [], 0, `Insert ${value} as root (colored BLACK)`, getSnapshot([], newNode.id), {});
      return;
    }

    let current = root;
    let parent = null;
    while (current) {
      parent = current;
      if (value < current.value) current = current.left;
      else if (value > current.value) current = current.right;
      else return; // duplicate
    }

    newNode.parent = parent;
    if (value < parent.value) parent.left = newNode;
    else parent.right = newNode;

    recorder.add('insert', [], 1, `Insert ${value} as RED node (child of ${parent.value})`, getSnapshot([], newNode.id), {});

    if (newNode.parent.parent) {
      fixInsert(newNode);
    }

    recorder.add('visit', [], 5, `Tree balanced after inserting ${value}`, getSnapshot(), {});
  }

  recorder.add('message', [], 0, `Building Red-Black tree from [${input.join(', ')}]`, { nodes: [], edges: [] }, {});

  for (const val of input) {
    insertNode(val);
  }

  recorder.add('message', [], 5, 'Red-Black tree construction complete!', getSnapshot(), {});

  return recorder.getSteps();
}
