import StepRecorder from '../../engine/StepRecorder';

export const meta = {
  name: 'Expression Evaluation',
  slug: 'expression-evaluation',
  category: 'stacks-queues',
  timeComplexity: { best: 'O(n)', average: 'O(n)', worst: 'O(n)' },
  spaceComplexity: 'O(n)',
  description:
    'Evaluates a postfix (Reverse Polish Notation) expression using a stack. Numbers are pushed onto the stack; when an operator is encountered, operands are popped, the operation is performed, and the result is pushed back.',
  rendererType: 'bar',
  pseudocode: [
    'for each token in expression:',
    '  if token is number: push onto stack',
    '  if token is operator:',
    '    b = pop(), a = pop()',
    '    push(a op b) onto stack',
    'return stack.top (final result)',
  ],
  inputSchema: {
    type: 'array',
    constraints: {
      minLength: 2,
      maxLength: 50,
      minValue: 0,
      maxValue: 999,
    },
  },
};

// The input array is just for the bar visualization.
// The algorithm uses a hardcoded postfix expression: 3 4 + 2 * 7 -
// which equals (3 + 4) * 2 - 7 = 7
export const defaultInput = [3, 4, 2, 7];

export function generateSteps(input) {
  const recorder = new StepRecorder();

  // Hardcoded postfix expression for demonstration
  // Expression: 3 4 + 2 * 7 -  =>  (3 + 4) * 2 - 7 = 7
  const tokens = ['3', '4', '+', '2', '*', '7', '-'];
  const infixExpr = '(3 + 4) * 2 - 7';
  const stack = [];

  // Show the input values as the bar chart
  const displayArr = [...input];

  recorder.add(
    'message',
    [],
    0,
    `Evaluating postfix expression: ${tokens.join(' ')}  (infix: ${infixExpr}).`,
    [...displayArr],
    { tokens, infix: infixExpr }
  );

  const operators = new Set(['+', '-', '*', '/']);
  let tokenIndex = 0;

  for (const token of tokens) {
    if (!operators.has(token)) {
      // Number: push onto stack
      const num = parseInt(token, 10);
      stack.push(num);
      recorder.add(
        'insert',
        [Math.min(tokenIndex, displayArr.length - 1)],
        1,
        `Token "${token}": push ${num} onto stack. Stack: [${stack.join(', ')}].`,
        [...displayArr],
        { operation: 'pushNumber', value: num, stack: [...stack] }
      );
    } else {
      // Operator: pop two operands, compute, push result
      const b = stack.pop();
      const a = stack.pop();
      let result;

      switch (token) {
        case '+': result = a + b; break;
        case '-': result = a - b; break;
        case '*': result = a * b; break;
        case '/': result = Math.floor(a / b); break;
        default: result = 0;
      }

      recorder.add(
        'compare',
        [Math.min(tokenIndex, displayArr.length - 1)],
        3,
        `Token "${token}": pop ${b} and ${a}. Compute ${a} ${token} ${b} = ${result}.`,
        [...displayArr],
        { operation: 'compute', a, b, operator: token, result }
      );

      stack.push(result);
      recorder.add(
        'insert',
        [Math.min(tokenIndex, displayArr.length - 1)],
        4,
        `Push result ${result} onto stack. Stack: [${stack.join(', ')}].`,
        [...displayArr],
        { operation: 'pushResult', value: result, stack: [...stack] }
      );
    }
    tokenIndex++;
  }

  const finalResult = stack[0];
  recorder.add(
    'sorted',
    [0],
    5,
    `Expression evaluation complete. Final result = ${finalResult}. (${infixExpr} = ${finalResult}).`,
    [finalResult],
    { result: finalResult }
  );

  return recorder.getSteps();
}
