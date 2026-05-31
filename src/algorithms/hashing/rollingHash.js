import StepRecorder from '../../engine/StepRecorder';

export const meta = {
  name: 'Rolling Hash',
  slug: 'rolling-hash',
  category: 'hashing',
  timeComplexity: { best: 'O(n)', average: 'O(n)', worst: 'O(n)' },
  spaceComplexity: 'O(1)',
  description:
    'Computes hash values incrementally as a window slides over the data. Each new hash is derived from the previous one by removing the outgoing element and adding the incoming element, used in string matching algorithms like Rabin-Karp.',
  rendererType: 'bar',
  pseudocode: [
    'hash = sum of window elements',
    'for i = 1 to n - windowSize:',
    '  hash = hash - arr[i - 1]',
    '  hash = hash + arr[i + windowSize - 1]',
    '  record hash value',
  ],
  inputSchema: {
    type: 'array',
    constraints: { minLength: 2, maxLength: 20, minValue: 0, maxValue: 99 },
  },
};

export const defaultInput = [10, 22, 31, 4, 15, 28, 17, 88, 59];

export function generateSteps(input) {
  const recorder = new StepRecorder();
  const arr = [...input];
  const windowSize = 3;
  const n = arr.length;

  if (n < windowSize) {
    recorder.add(
      'message',
      [],
      0,
      `Array length ${n} is less than window size ${windowSize}. Cannot compute rolling hash.`,
      [...arr],
      {}
    );
    return recorder.getSteps();
  }

  // We will display hash values for each window position in a result array
  const numWindows = n - windowSize + 1;
  const hashValues = new Array(numWindows).fill(0);

  recorder.add(
    'message',
    [],
    0,
    `Compute rolling hash over array with window size ${windowSize}. Using simple sum-based hash. Array: [${arr.join(', ')}]`,
    [...arr],
    { windowSize }
  );

  // Compute initial window hash
  let hash = 0;
  const windowIndices = [];
  for (let j = 0; j < windowSize; j++) {
    hash += arr[j];
    windowIndices.push(j);
  }

  hashValues[0] = hash;

  recorder.add(
    'compute',
    windowIndices,
    0,
    `Initial window [${arr.slice(0, windowSize).join(', ')}]: hash = ${arr.slice(0, windowSize).join(' + ')} = ${hash}`,
    [...arr],
    { windowStart: 0, windowEnd: windowSize - 1, hash }
  );

  recorder.add(
    'insert',
    [0],
    0,
    `Store hash value ${hash} for window starting at index 0.`,
    [...hashValues],
    { position: 0, hash }
  );

  // Slide the window
  for (let i = 1; i <= n - windowSize; i++) {
    const outgoing = arr[i - 1];
    const incoming = arr[i + windowSize - 1];
    const oldHash = hash;

    // Remove outgoing element
    recorder.add(
      'compare',
      [i - 1],
      2,
      `Slide window: remove outgoing element arr[${i - 1}] = ${outgoing} from hash. Hash: ${oldHash} - ${outgoing} = ${oldHash - outgoing}`,
      [...arr],
      { outgoing, position: i - 1 }
    );

    hash -= outgoing;

    // Add incoming element
    hash += incoming;

    recorder.add(
      'compute',
      [i + windowSize - 1],
      3,
      `Add incoming element arr[${i + windowSize - 1}] = ${incoming}. Hash: ${oldHash - outgoing} + ${incoming} = ${hash}`,
      [...arr],
      { incoming, position: i + windowSize - 1, hash }
    );

    hashValues[i] = hash;

    const windowElements = arr.slice(i, i + windowSize);
    recorder.add(
      'insert',
      [i],
      4,
      `Window [${windowElements.join(', ')}] at position ${i}: hash = ${hash}`,
      [...hashValues],
      { position: i, hash, window: windowElements }
    );
  }

  recorder.add(
    'message',
    [],
    0,
    `Rolling hash complete. ${numWindows} hash values computed. Bars show the hash value for each window position.`,
    [...hashValues],
    {}
  );

  return recorder.getSteps();
}
