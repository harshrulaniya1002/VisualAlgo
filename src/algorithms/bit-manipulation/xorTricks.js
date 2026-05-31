import StepRecorder from '../../engine/StepRecorder';

export const meta = {
  name: 'XOR Tricks',
  slug: 'xor-tricks',
  category: 'bit-manipulation',
  timeComplexity: { best: 'O(n)', average: 'O(n)', worst: 'O(n)' },
  spaceComplexity: 'O(1)',
  description:
    'Demonstrates classic XOR tricks: finding the single non-duplicate element in an array where every other element appears twice. XOR of a number with itself is 0, and XOR with 0 is the number itself, so XOR-ing all elements cancels out duplicates.',
  rendererType: 'bar',
  pseudocode: [
    'function findUnique(arr):',
    '  result = 0',
    '  for each element in arr:',
    '    result = result ^ element',
    '  return result',
  ],
  inputSchema: {
    type: 'array',
    constraints: { minLength: 1, maxLength: 50, minValue: 0, maxValue: 999 },
  },
};

export const defaultInput = [4, 1, 2, 1, 2, 4, 3];

/**
 * Convert a number to its binary string representation.
 */
function toBin(n) {
  return n.toString(2);
}

/**
 * Generate step-by-step visualization for XOR tricks (find single non-duplicate).
 *
 * @param {number[]} input - Array where every element appears twice except one.
 * @returns {Array} Recorded steps.
 */
export function generateSteps(input) {
  const recorder = new StepRecorder();
  const arr = [...input];
  const n = arr.length;

  recorder.add(
    'message', [], -1,
    `Find the unique element using XOR. Key properties: a ^ a = 0, a ^ 0 = a`,
    [...arr]
  );

  let result = 0;

  recorder.add(
    'compute', [], 1,
    `Initialize result = 0 (${toBin(0)})`,
    [...arr],
    { result: 0 }
  );

  for (let i = 0; i < n; i++) {
    const prevResult = result;
    result = result ^ arr[i];

    recorder.add(
      'visit', [i], 2,
      `Processing element arr[${i}] = ${arr[i]} (${toBin(arr[i])})`,
      [...arr],
      { element: arr[i], index: i }
    );

    recorder.add(
      'compute', [i], 3,
      `result = ${prevResult} ^ ${arr[i]} = ${toBin(prevResult)} ^ ${toBin(arr[i])} = ${toBin(result)} = ${result}`,
      [...arr],
      { prevResult, element: arr[i], newResult: result, binary: toBin(result) }
    );
  }

  // Find the index of the unique element for highlighting
  const uniqueIndex = arr.indexOf(result);
  recorder.add(
    'found', uniqueIndex !== -1 ? [uniqueIndex] : [], 4,
    `XOR of all elements = ${result} (${toBin(result)}). The unique element is ${result}`,
    [...arr],
    { unique: result, binary: toBin(result) }
  );

  // --- Bonus: XOR swap demonstration ---
  if (arr.length >= 2) {
    const swapArr = [...arr];
    const a = swapArr[0];
    const b = swapArr[1];

    recorder.add(
      'message', [0, 1], -1,
      `Bonus: XOR swap trick. Swap arr[0]=${a} and arr[1]=${b} without a temp variable`,
      [...swapArr]
    );

    swapArr[0] = swapArr[0] ^ swapArr[1];
    recorder.add(
      'compute', [0], -1,
      `Step 1: a = a ^ b = ${a} ^ ${b} = ${toBin(a)} ^ ${toBin(b)} = ${swapArr[0]} (${toBin(swapArr[0])})`,
      [...swapArr],
      { step: 1 }
    );

    swapArr[1] = swapArr[0] ^ swapArr[1];
    recorder.add(
      'compute', [1], -1,
      `Step 2: b = a ^ b = ${swapArr[0]} ^ ${b} = ${toBin(swapArr[0])} ^ ${toBin(b)} = ${swapArr[1]} (${toBin(swapArr[1])}) -> b is now original a`,
      [...swapArr],
      { step: 2 }
    );

    swapArr[0] = swapArr[0] ^ swapArr[1];
    recorder.add(
      'swap', [0, 1], -1,
      `Step 3: a = a ^ b = ${swapArr[0] ^ swapArr[1]} ^ ${swapArr[1]} = ${swapArr[0]} (${toBin(swapArr[0])}) -> a is now original b. Swap complete!`,
      [...swapArr],
      { step: 3 }
    );
  }

  recorder.add(
    'sorted', [], -1,
    `XOR tricks demonstration complete. Unique element: ${result}`,
    [...arr],
    { unique: result }
  );

  return recorder.getSteps();
}
