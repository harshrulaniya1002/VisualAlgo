import StepRecorder from '../../engine/StepRecorder';

export const meta = {
  name: 'B-Tree',
  slug: 'b-tree',
  category: 'trees',
  timeComplexity: { best: 'O(log n)', average: 'O(log n)', worst: 'O(log n)' },
  spaceComplexity: 'O(n)',
  description:
    'A self-balancing multi-way search tree optimized for disk-based storage. Each node can hold multiple keys and children. When a node overflows, it splits and pushes the median key up.',
  rendererType: 'tree',
  pseudocode: [
    'function insert(key):',
    '  find leaf node for key',
    '  insert key into leaf',
    '  if node overflows (keys > 2t-1):',
    '    split node at median',
    '    push median to parent',
  ],
  inputSchema: {
    type: 'array',
    constraints: { minLength: 2, maxLength: 15, minValue: 1, maxValue: 99 },
  },
};

export const defaultInput = [10, 20, 5, 6, 12, 30, 7, 17];

export function generateSteps(input) {
  const recorder = new StepRecorder();
  const T = 2; // minimum degree (each node holds at most 2T-1 = 3 keys)

  let nextId = 0;

  class BTreeNode {
    constructor() {
      this.id = nextId++;
      this.keys = [];
      this.children = [];
      this.leaf = true;
    }
  }

  let root = new BTreeNode();

  function getSnapshot(highlightIds = [], insertedId = null) {
    const nodes = [];
    const edges = [];
    function traverse(node) {
      if (!node) return;
      let state = 'default';
      if (insertedId === node.id) state = 'inserted';
      else if (highlightIds.includes(node.id)) state = 'highlighted';
      const label = `[${node.keys.join(',')}]`;
      const leftChild = node.children.length > 0 ? node.children[0].id : null;
      const rightChild = node.children.length > 1 ? node.children[1].id : null;
      nodes.push({ id: node.id, value: label, left: leftChild, right: rightChild, state });
      for (const child of node.children) {
        edges.push({ from: node.id, to: child.id, state: highlightIds.includes(child.id) ? 'highlighted' : 'default' });
        traverse(child);
      }
    }
    traverse(root);
    return { nodes, edges };
  }

  function splitChild(parent, i) {
    const fullChild = parent.children[i];
    const newChild = new BTreeNode();
    newChild.leaf = fullChild.leaf;

    const medianKey = fullChild.keys[T - 1];

    // Move upper keys to new child
    newChild.keys = fullChild.keys.splice(T);
    fullChild.keys.splice(T - 1); // remove median

    // Move upper children to new child
    if (!fullChild.leaf) {
      newChild.children = fullChild.children.splice(T);
    }

    parent.children.splice(i + 1, 0, newChild);
    parent.keys.splice(i, 0, medianKey);

    recorder.add('visit', [], 3, `Split node [${fullChild.keys.join(',')}|${medianKey}|${newChild.keys.join(',')}]. Push ${medianKey} up.`, getSnapshot([parent.id, fullChild.id, newChild.id]), {});
  }

  function insertNonFull(node, key) {
    let i = node.keys.length - 1;

    if (node.leaf) {
      // Insert key in sorted position
      while (i >= 0 && key < node.keys[i]) {
        i--;
      }
      node.keys.splice(i + 1, 0, key);
      recorder.add('insert', [], 1, `Insert ${key} into leaf [${node.keys.join(',')}]`, getSnapshot([], node.id), {});
    } else {
      while (i >= 0 && key < node.keys[i]) {
        i--;
      }
      i++;
      recorder.add('visit', [], 0, `Navigate to child ${i} of node [${node.keys.join(',')}]`, getSnapshot([node.id]), {});

      if (node.children[i].keys.length === 2 * T - 1) {
        splitChild(node, i);
        if (key > node.keys[i]) {
          i++;
        }
      }
      insertNonFull(node.children[i], key);
    }
  }

  function insert(key) {
    if (root.keys.length === 2 * T - 1) {
      const newRoot = new BTreeNode();
      newRoot.leaf = false;
      newRoot.children.push(root);
      root = newRoot;
      recorder.add('visit', [], 4, `Root is full. Creating new root.`, getSnapshot([root.id]), {});
      splitChild(root, 0);
      insertNonFull(root, key);
    } else {
      insertNonFull(root, key);
    }
  }

  recorder.add('message', [], 0, `Building B-Tree (t=${T}) from [${input.join(', ')}]`, { nodes: [], edges: [] }, {});

  for (const val of input) {
    recorder.add('message', [], 0, `Inserting ${val}`, getSnapshot(), {});
    insert(val);
  }

  recorder.add('message', [], 5, `B-Tree construction complete!`, getSnapshot(), {});

  return recorder.getSteps();
}
