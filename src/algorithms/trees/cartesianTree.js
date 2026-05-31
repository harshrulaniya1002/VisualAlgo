import StepRecorder from '../../engine/StepRecorder';

export const meta = {
  name: 'Cartesian Tree',
  slug: 'cartesian-tree',
  category: 'trees',
  timeComplexity: { best: 'O(n)', average: 'O(n)', worst: 'O(n)' },
  spaceComplexity: 'O(n)',
  description:
    'A binary tree derived from a sequence where each node is the minimum of its subtree and inorder traversal gives the original sequence. Built in O(n) using a stack-based approach.',
  rendererType: 'tree',
  pseudocode: [
    'function buildCartesian(arr):',
    '  for each element:',
    '    create node, pop stack while top > current',
    '    last popped becomes left child',
    '    push current onto stack',
    '  root = bottom of stack',
  ],
  inputSchema: {
    type: 'array',
    constraints: { minLength: 2, maxLength: 15, minValue: 1, maxValue: 99 },
  },
};

export const defaultInput = [3, 2, 6, 1, 9, 5, 8];

export function generateSteps(input) {
  const recorder = new StepRecorder();

  class CartNode {
    constructor(id, value, index) {
      this.id = id;
      this.value = value;
      this.index = index;
      this.left = null;
      this.right = null;
    }
  }

  let nextId = 0;
  let treeRoot = null;

  function getSnapshot(highlightIds = [], insertedId = null) {
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
    traverse(treeRoot);
    return { nodes, edges };
  }

  recorder.add('message', [], 0, `Building Cartesian tree from [${input.join(', ')}] using stack-based O(n) algorithm`, { nodes: [], edges: [] }, {});

  const stack = []; // stack of nodes

  for (let i = 0; i < input.length; i++) {
    const newNode = new CartNode(nextId++, input[i], i);
    let lastPopped = null;

    recorder.add('visit', [], 1, `Process element arr[${i}] = ${input[i]}`, getSnapshot([], newNode.id), {});

    while (stack.length > 0 && stack[stack.length - 1].value > input[i]) {
      lastPopped = stack.pop();
      recorder.add('visit', [], 2, `Pop ${lastPopped.value} from stack (${lastPopped.value} > ${input[i]})`, getSnapshot([lastPopped.id, newNode.id]), {});
    }

    if (lastPopped) {
      newNode.left = lastPopped;
      recorder.add('visit', [], 3, `${lastPopped.value} becomes left child of ${input[i]}`, getSnapshot([newNode.id, lastPopped.id]), {});
    }

    if (stack.length > 0) {
      stack[stack.length - 1].right = newNode;
      recorder.add('visit', [], 3, `${input[i]} becomes right child of ${stack[stack.length - 1].value}`, getSnapshot([stack[stack.length - 1].id, newNode.id]), {});
    }

    stack.push(newNode);

    // Root is always the bottom of the stack
    treeRoot = stack[0];
    recorder.add('insert', [], 0, `Stack: [${stack.map(s => s.value).join(', ')}]. Current tree:`, getSnapshot([], newNode.id), {});
  }

  treeRoot = stack.length > 0 ? stack[0] : null;

  recorder.add('message', [], 5, `Cartesian tree built! Root = ${treeRoot ? treeRoot.value : 'null'} (minimum element). Inorder gives original array.`, getSnapshot(), {});

  return recorder.getSteps();
}
