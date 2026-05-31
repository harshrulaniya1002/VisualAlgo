/**
 * Tree node used by tree utility functions.
 */
class TreeNode {
  constructor(val, left = null, right = null) {
    this.val = val;
    this.left = left;
    this.right = right;
  }
}

/**
 * Convert a level-order array representation to a binary tree.
 * Null entries represent absent nodes (e.g. [1, 2, 3, null, null, 4, 5]).
 *
 * @param {Array<number|null>} arr - Level-order array.
 * @returns {TreeNode|null} Root of the constructed tree.
 */
export function arrayToTree(arr) {
  if (!arr || arr.length === 0 || arr[0] == null) return null;

  const root = new TreeNode(arr[0]);
  const queue = [root];
  let i = 1;

  while (i < arr.length && queue.length > 0) {
    const node = queue.shift();

    // Left child
    if (i < arr.length) {
      if (arr[i] != null) {
        node.left = new TreeNode(arr[i]);
        queue.push(node.left);
      }
      i++;
    }

    // Right child
    if (i < arr.length) {
      if (arr[i] != null) {
        node.right = new TreeNode(arr[i]);
        queue.push(node.right);
      }
      i++;
    }
  }

  return root;
}

/**
 * Convert a binary tree back to a level-order array representation.
 * Trailing nulls are trimmed.
 *
 * @param {TreeNode|null} root - Root of the tree.
 * @returns {Array<number|null>} Level-order array.
 */
export function treeToArray(root) {
  if (!root) return [];

  const result = [];
  const queue = [root];

  while (queue.length > 0) {
    const node = queue.shift();
    if (node) {
      result.push(node.val);
      queue.push(node.left);
      queue.push(node.right);
    } else {
      result.push(null);
    }
  }

  // Trim trailing nulls
  while (result.length > 0 && result[result.length - 1] == null) {
    result.pop();
  }

  return result;
}

/**
 * Generate a random binary search tree with n nodes.
 *
 * @param {number} n   - Number of nodes.
 * @param {number} max - Maximum node value (default 100).
 * @returns {TreeNode|null} Root of the BST.
 */
export function randomBST(n, max = 100) {
  if (n <= 0) return null;

  // Generate n unique random values and sort them
  const valueSet = new Set();
  while (valueSet.size < n) {
    valueSet.add(Math.floor(Math.random() * max) + 1);
  }
  const values = Array.from(valueSet).sort((a, b) => a - b);

  // Build a balanced BST from the sorted values
  function buildBalanced(arr, lo, hi) {
    if (lo > hi) return null;
    const mid = Math.floor((lo + hi) / 2);
    const node = new TreeNode(arr[mid]);
    node.left = buildBalanced(arr, lo, mid - 1);
    node.right = buildBalanced(arr, mid + 1, hi);
    return node;
  }

  return buildBalanced(values, 0, values.length - 1);
}

/**
 * Compute the height of a binary tree.
 *
 * @param {TreeNode|null} root - Root of the tree.
 * @returns {number} Height (0 for a single node, -1 for null).
 */
export function treeHeight(root) {
  if (!root) return -1;
  return 1 + Math.max(treeHeight(root.left), treeHeight(root.right));
}

/**
 * Compute (x, y) layout positions for every node in a binary tree.
 *
 * Uses an in-order traversal to assign x-coordinates and depth for
 * y-coordinates, then scales to fit within the given width and height.
 *
 * @param {TreeNode|null} root   - Root of the tree.
 * @param {number}        width  - Available canvas width.
 * @param {number}        height - Available canvas height.
 * @returns {Array<{ val: number, x: number, y: number, left: number|null, right: number|null }>}
 *   Array of node position objects.
 */
export function layoutTree(root, width, height) {
  if (!root) return [];

  const nodes = [];
  let xCounter = 0;
  const padding = { x: 40, y: 40 };
  const h = treeHeight(root);

  // In-order traversal to assign sequential x-positions
  function inOrder(node, depth) {
    if (!node) return null;

    const leftIdx = inOrder(node.left, depth + 1);

    const idx = nodes.length;
    nodes.push({
      val: node.val,
      xOrder: xCounter++,
      depth,
      leftIdx,
      rightIdx: null,
    });

    const rightIdx = inOrder(node.right, depth + 1);
    nodes[idx].rightIdx = rightIdx;

    return idx;
  }

  inOrder(root, 0);

  // Scale positions to fit the canvas
  const xScale = nodes.length > 1
    ? (width - 2 * padding.x) / (nodes.length - 1)
    : 0;
  const yScale = h > 0
    ? (height - 2 * padding.y) / h
    : 0;

  return nodes.map((n) => ({
    val: n.val,
    x: padding.x + n.xOrder * xScale,
    y: padding.y + n.depth * yScale,
    left: n.leftIdx,
    right: n.rightIdx,
  }));
}

export { TreeNode };
