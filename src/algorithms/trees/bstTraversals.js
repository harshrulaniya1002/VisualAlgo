import StepRecorder from '../../engine/StepRecorder';

export const meta = {
  name: 'BST Traversals',
  slug: 'bst-traversals',
  category: 'trees',
  timeComplexity: { best: 'O(n)', average: 'O(n)', worst: 'O(n)' },
  spaceComplexity: 'O(h)',
  description:
    'Visits all nodes in a BST using inorder (left-root-right), preorder (root-left-right), and postorder (left-right-root) traversal strategies. Inorder traversal of a BST yields sorted output.',
  rendererType: 'tree',
  pseudocode: [
    'function inorder(node):',
    '  if node is null, return',
    '  inorder(node.left)',
    '  visit(node)',
    '  inorder(node.right)',
  ],
  inputSchema: {
    type: 'array',
    constraints: { minLength: 2, maxLength: 20, minValue: 1, maxValue: 99 },
  },
};

export const defaultInput = [50, 30, 70, 20, 40, 60, 80];

export function generateSteps(input) {
  const recorder = new StepRecorder();

  // Build BST
  class BSTNode {
    constructor(id, value) {
      this.id = id;
      this.value = value;
      this.left = null;
      this.right = null;
    }
  }

  let nextId = 0;
  let root = null;

  function insert(node, value) {
    if (!node) return new BSTNode(nextId++, value);
    if (value < node.value) node.left = insert(node.left, value);
    else if (value > node.value) node.right = insert(node.right, value);
    return node;
  }

  for (const val of input) {
    root = insert(root, val);
  }

  function getSnapshot(visitedIds, highlightId) {
    const nodes = [];
    const edges = [];
    function traverse(node) {
      if (!node) return;
      let state = 'default';
      if (highlightId === node.id) state = 'highlighted';
      else if (visitedIds.has(node.id)) state = 'visited';
      nodes.push({ id: node.id, value: node.value, left: node.left ? node.left.id : null, right: node.right ? node.right.id : null, state });
      if (node.left) edges.push({ from: node.id, to: node.left.id, state: visitedIds.has(node.left.id) || highlightId === node.left.id ? 'visited' : 'default' });
      if (node.right) edges.push({ from: node.id, to: node.right.id, state: visitedIds.has(node.right.id) || highlightId === node.right.id ? 'visited' : 'default' });
      traverse(node.left);
      traverse(node.right);
    }
    traverse(root);
    return { nodes, edges };
  }

  const baseSnap = getSnapshot(new Set(), null);
  recorder.add('message', [], 0, `BST built from [${input.join(', ')}]. Starting inorder traversal.`, baseSnap, {});

  // Inorder traversal
  const visited = new Set();
  const inorderResult = [];

  function inorder(node) {
    if (!node) return;
    recorder.add('visit', [], 1, `Check if node ${node.value} has a left child`, getSnapshot(visited, node.id), {});
    inorder(node.left);
    visited.add(node.id);
    inorderResult.push(node.value);
    recorder.add('visit', [], 3, `Visit node ${node.value} (inorder result: [${inorderResult.join(', ')}])`, getSnapshot(visited, node.id), {});
    inorder(node.right);
  }

  inorder(root);

  recorder.add('message', [], 4, `Inorder traversal complete: [${inorderResult.join(', ')}]`, getSnapshot(visited, null), {});

  // Preorder traversal
  const visitedPre = new Set();
  const preorderResult = [];

  recorder.add('message', [], 0, 'Starting preorder traversal (root-left-right).', getSnapshot(new Set(), null), {});

  function preorder(node) {
    if (!node) return;
    visitedPre.add(node.id);
    preorderResult.push(node.value);
    recorder.add('visit', [], 3, `Visit node ${node.value} first (preorder: [${preorderResult.join(', ')}])`, getSnapshot(visitedPre, node.id), {});
    preorder(node.left);
    preorder(node.right);
  }

  preorder(root);

  recorder.add('message', [], 4, `Preorder traversal complete: [${preorderResult.join(', ')}]`, getSnapshot(visitedPre, null), {});

  // Postorder traversal
  const visitedPost = new Set();
  const postorderResult = [];

  recorder.add('message', [], 0, 'Starting postorder traversal (left-right-root).', getSnapshot(new Set(), null), {});

  function postorder(node) {
    if (!node) return;
    postorder(node.left);
    postorder(node.right);
    visitedPost.add(node.id);
    postorderResult.push(node.value);
    recorder.add('visit', [], 3, `Visit node ${node.value} last (postorder: [${postorderResult.join(', ')}])`, getSnapshot(visitedPost, node.id), {});
  }

  postorder(root);

  recorder.add('message', [], 4, `Postorder traversal complete: [${postorderResult.join(', ')}]`, getSnapshot(visitedPost, null), {});

  return recorder.getSteps();
}
