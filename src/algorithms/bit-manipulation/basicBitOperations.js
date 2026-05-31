import StepRecorder from '../../engine/StepRecorder';

export const meta = {
  name: 'Basic Bit Operations',
  slug: 'basic-bit-operations',
  category: 'bit-manipulation',
  timeComplexity: { best: 'O(1)', average: 'O(1)', worst: 'O(1)' },
  spaceComplexity: 'O(1)',
  description:
    'Demonstrates the fundamental bitwise operations: AND, OR, XOR, NOT, left shift, and right shift. Each operation is shown with binary representations to illustrate how individual bits are manipulated.',
  rendererType: 'bar',
  pseudocode: [
    'result_and = a & b',
    'result_or  = a | b',
    'result_xor = a ^ b',
    'result_not = ~a',
    'result_lshift = a << 1',
    'result_rshift = a >> 1',
  ],
  inputSchema: {
    type: 'array',
    constraints: { minLength: 1, maxLength: 50, minValue: 0, maxValue: 999 },
  },
};

export const defaultInput = [13, 7];

/**
 * Convert a number to its binary string representation.
 */
function toBin(n) {
  if (n < 0) return '(negative) ' + (n >>> 0).toString(2);
  return n.toString(2);
}

/**
 * Generate step-by-step visualization for basic bitwise operations.
 *
 * @param {number[]} input - Two numbers to operate on.
 * @returns {Array} Recorded steps.
 */
export function generateSteps(input) {
  const recorder = new StepRecorder();
  const a = input[0] !== undefined ? input[0] : 13;
  const b = input[1] !== undefined ? input[1] : 7;

  // We build a visual array that accumulates results of each operation
  const results = [a, b];

  recorder.add(
    'message', [], -1,
    `Starting basic bit operations with a = ${a} (${toBin(a)}) and b = ${b} (${toBin(b)})`,
    [...results]
  );

  // --- AND ---
  const andResult = a & b;
  results.push(andResult);
  recorder.add(
    'compute', [0, 1], 0,
    `AND: ${a} & ${b} => ${toBin(a)} & ${toBin(b)} = ${toBin(andResult)} = ${andResult}`,
    [...results],
    { operation: 'AND', a, b, result: andResult }
  );

  // --- OR ---
  const orResult = a | b;
  results.push(orResult);
  recorder.add(
    'compute', [0, 1], 1,
    `OR: ${a} | ${b} => ${toBin(a)} | ${toBin(b)} = ${toBin(orResult)} = ${orResult}`,
    [...results],
    { operation: 'OR', a, b, result: orResult }
  );

  // --- XOR ---
  const xorResult = a ^ b;
  results.push(xorResult);
  recorder.add(
    'compute', [0, 1], 2,
    `XOR: ${a} ^ ${b} => ${toBin(a)} ^ ${toBin(b)} = ${toBin(xorResult)} = ${xorResult}`,
    [...results],
    { operation: 'XOR', a, b, result: xorResult }
  );

  // --- NOT ---
  // Show NOT as the unsigned 32-bit complement for visual clarity
  const notResult = ~a;
  const notUnsigned = notResult >>> 0;
  results.push(notUnsigned > 999 ? a : notResult);
  recorder.add(
    'compute', [0], 3,
    `NOT: ~${a} => ~${toBin(a)} = ${notResult} (two's complement). In unsigned 32-bit: ${notUnsigned}`,
    [...results],
    { operation: 'NOT', a, result: notResult, unsigned: notUnsigned }
  );

  // --- Left Shift ---
  const lshiftResult = a << 1;
  results.push(lshiftResult);
  recorder.add(
    'compute', [0], 4,
    `Left Shift: ${a} << 1 => ${toBin(a)} << 1 = ${toBin(lshiftResult)} = ${lshiftResult} (multiply by 2)`,
    [...results],
    { operation: 'LEFT_SHIFT', a, result: lshiftResult }
  );

  // --- Right Shift ---
  const rshiftResult = a >> 1;
  results.push(rshiftResult);
  recorder.add(
    'compute', [0], 5,
    `Right Shift: ${a} >> 1 => ${toBin(a)} >> 1 = ${toBin(rshiftResult)} = ${rshiftResult} (integer divide by 2)`,
    [...results],
    { operation: 'RIGHT_SHIFT', a, result: rshiftResult }
  );

  // --- Summary ---
  recorder.add(
    'sorted', [],  -1,
    `All operations complete. Results: AND=${andResult}, OR=${orResult}, XOR=${xorResult}, NOT=${notResult}, <<1=${lshiftResult}, >>1=${rshiftResult}`,
    [...results],
    { andResult, orResult, xorResult, notResult, lshiftResult, rshiftResult }
  );

  return recorder.getSteps();
}
