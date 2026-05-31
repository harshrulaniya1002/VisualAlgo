import StepRecorder from '../../engine/StepRecorder';

export const meta = {
  name: 'Expression Tree',
  slug: 'expression-tree',
  category: 'trees',
  timeComplexity: { best: 'O(n)', average: 'O(n)', worst: 'O(n)' },
  spaceComplexity: 'O(n)',
  description:
    'A binary tree representation of arithmetic expressions where leaves are operands and internal nodes are operators. Built from postfix notation using a stack.',
  rendererType: 'tree',
  pseudocode: [
    'function buildFromPostfix(tokens):',
    '  for each token:',
    '    if operand: push new leaf node',
    '    if operator: pop two, create parent',
    '    push new subtree onto stack',
    '  return stack top as root',
  ],
  inputSchema: {
    type: 'array',
    constraints: { minLength: 3, maxLength: 15, minValue: 1, maxValue: 99 },
  },
};

// Encode a postfix expression: 3 4 + 2 * 7 -
// Use special values for operators: 91=+, 92=-, 93=*, 94=/
export const defaultInput = [3, 4, 91, 2, 93, 7, 92];

export function generateSteps(input) {
  const recorder = new StepRecorder();

  const OP_MAP = { 91: '+', 92: '-', 93: '*', 94: '/' };

  function isOperator(val) {
    return val >= 91 && val <= 94;
  }

  class ExprNode {
    constructor(id, value, isOp) {
      this.id = id;
      this.value = value;
      this.isOp = isOp;
      this.left = null;
      this.right = null;
    }
  }

  let nextId = 0;
  let treeRoot = null;

  function getSnapshot(highlightIds = [], insertedId = null) {
    const nodes = [];
    const edges = [];
    // Need to show the whole tree, so traverse from all roots on stack and final root
    const visited = new Set();
    function traverse(node) {
      if (!node || visited.has(node.id)) return;
      visited.add(node.id);
      let state = 'default';
      if (insertedId === node.id) state = 'inserted';
      else if (highlightIds.includes(node.id)) state = 'highlighted';
      nodes.push({ id: node.id, value: node.isOp ? node.value : node.value, left: node.left ? node.left.id : null, right: node.right ? node.right.id : null, state });
      if (node.left) {
        edges.push({ from: node.id, to: node.left.id, state: 'default' });
        traverse(node.left);
      }
      if (node.right) {
        edges.push({ from: node.id, to: node.right.id, state: 'default' });
        traverse(node.right);
      }
    }
    if (treeRoot) traverse(treeRoot);
    return { nodes, edges };
  }

  // Build readable expression
  const postfixStr = input.map(v => isOperator(v) ? OP_MAP[v] : v).join(' ');
  recorder.add('message', [], 0, `Building expression tree from postfix: ${postfixStr}`, { nodes: [], edges: [] }, {});

  const stack = [];

  for (let i = 0; i < input.length; i++) {
    const val = input[i];

    if (isOperator(val)) {
      const op = OP_MAP[val];
      if (stack.length < 2) {
        recorder.add('message', [], 0, `Error: not enough operands for operator '${op}'`, getSnapshot(), {});
        continue;
      }

      const right = stack.pop();
      const left = stack.pop();
      const node = new ExprNode(nextId++, op, true);
      node.left = left;
      node.right = right;
      stack.push(node);
      treeRoot = node;

      recorder.add('insert', [], 3, `Pop '${right.value}' and '${left.value}', create '${op}' node`, getSnapshot([left.id, right.id], node.id), {});
    } else {
      const node = new ExprNode(nextId++, val, false);
      stack.push(node);
      treeRoot = stack.length === 1 ? stack[0] : treeRoot;

      recorder.add('insert', [], 1, `Push operand ${val} onto stack`, getSnapshot([], node.id), {});
    }
  }

  if (stack.length > 0) {
    treeRoot = stack[0];
  }

  recorder.add('message', [], 4, 'Expression tree built from postfix notation.', getSnapshot(), {});

  // Evaluate the tree
  function evaluate(node) {
    if (!node) return 0;
    if (!node.isOp) return typeof node.value === 'number' ? node.value : parseFloat(node.value);

    const leftVal = evaluate(node.left);
    const rightVal = evaluate(node.right);

    recorder.add('visit', [], 4, `Evaluate: ${leftVal} ${node.value} ${rightVal}`, getSnapshot([node.id]), {});

    switch (node.value) {
      case '+': return leftVal + rightVal;
      case '-': return leftVal - rightVal;
      case '*': return leftVal * rightVal;
      case '/': return rightVal !== 0 ? leftVal / rightVal : 0;
      default: return 0;
    }
  }

  const result = evaluate(treeRoot);
  recorder.add('message', [], 5, `Expression evaluates to: ${result}`, getSnapshot(), {});

  // Show inorder (infix) representation
  function inorder(node) {
    if (!node) return '';
    if (!node.isOp) return String(node.value);
    return `(${inorder(node.left)} ${node.value} ${inorder(node.right)})`;
  }

  const infix = inorder(treeRoot);
  recorder.add('message', [], 5, `Infix expression: ${infix} = ${result}`, getSnapshot(), {});

  return recorder.getSteps();
}
