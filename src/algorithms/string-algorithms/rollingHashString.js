import StepRecorder from '../../engine/StepRecorder';

export const meta = {
  name: 'Rolling Hash String Matching',
  slug: 'rolling-hash-string',
  category: 'string-algorithms',
  timeComplexity: { best: 'O(n)', average: 'O(n)', worst: 'O(n * m)' },
  spaceComplexity: 'O(1)',
  description:
    'Rolling hash string matching uses a polynomial hash function to compute hashes of substrings in constant time as the window slides. It computes the pattern hash once, then slides a window over the text, updating the hash by removing the outgoing character and adding the incoming one.',
  rendererType: 'bar',
  pseudocode: [
    'Compute polynomial hash of pattern',
    'Compute hash of first window in text',
    'for i = 0 to n - m:',
    '  if hashes match: verify chars',
    '  roll hash: h = (h - text[i]*base^(m-1)) * base + text[i+m]',
    '  all operations mod prime',
  ],
  inputSchema: {
    type: 'array',
    constraints: { minLength: 2, maxLength: 100, minValue: 0, maxValue: 999 },
  },
};

// Format: [patLen, pat..., text...]
// Pattern = "ABC" (65,66,67), Text = "ABDABC" (65,66,68,65,66,67)
export const defaultInput = [3, 65, 66, 67, 65, 66, 68, 65, 66, 67];

export function generateSteps(input) {
  const recorder = new StepRecorder();
  const arr = [...input];
  const patLen = arr[0];
  const pattern = arr.slice(1, 1 + patLen);
  const text = arr.slice(1 + patLen);
  const m = pattern.length;
  const n = text.length;
  const patChars = pattern.map(c => String.fromCharCode(c));
  const textChars = text.map(c => String.fromCharCode(c));

  const BASE = 31;
  const MOD = 1000000007;

  recorder.add('message', [], 0,
    `Rolling Hash: search for pattern "${patChars.join('')}" in text "${textChars.join('')}". Using polynomial hash with base=${BASE}, mod=${MOD}.`,
    [...text], { pattern: patChars.join(''), text: textChars.join('') });

  if (m > n) {
    recorder.add('message', [], 0,
      `Pattern (length ${m}) is longer than text (length ${n}). No match possible.`,
      [...text], {});
    return recorder.getSteps();
  }

  // Compute base^(m-1) % MOD
  let highPow = 1;
  for (let i = 0; i < m - 1; i++) {
    highPow = (highPow * BASE) % MOD;
  }

  recorder.add('compute', [], 0,
    `Precompute: base^(m-1) mod MOD = ${BASE}^${m - 1} mod ${MOD} = ${highPow}`,
    [...text], { highPow });

  // Compute pattern hash
  let patHash = 0;
  for (let i = 0; i < m; i++) {
    patHash = (patHash * BASE + pattern[i]) % MOD;
  }

  recorder.add('compute', [], 0,
    `Pattern hash("${patChars.join('')}") = ${patHash}`,
    [...text], { patHash });

  // Compute first window hash
  let textHash = 0;
  for (let i = 0; i < m; i++) {
    textHash = (textHash * BASE + text[i]) % MOD;
  }

  const firstWindow = [];
  for (let i = 0; i < m; i++) firstWindow.push(i);
  recorder.add('compute', firstWindow, 1,
    `First window hash("${textChars.slice(0, m).join('')}") = ${textHash}`,
    [...text], { textHash });

  const matches = [];

  for (let i = 0; i <= n - m; i++) {
    const windowIndices = [];
    for (let x = i; x < i + m; x++) windowIndices.push(x);

    recorder.add('compare', windowIndices, 2,
      `Position ${i}: window "${textChars.slice(i, i + m).join('')}", hash = ${textHash}. Pattern hash = ${patHash}`,
      [...text], { i, textHash, patHash });

    if (textHash === patHash) {
      recorder.add('highlight', windowIndices, 3,
        `Hash match! Verifying characters at position ${i}...`,
        [...text], { i });

      let match = true;
      for (let j = 0; j < m; j++) {
        recorder.add('compare', [i + j], 3,
          `Verify: text[${i + j}]='${textChars[i + j]}' vs pattern[${j}]='${patChars[j]}'`,
          [...text], { textPos: i + j, patPos: j });
        if (text[i + j] !== pattern[j]) {
          match = false;
          recorder.add('compute', [i + j], 3,
            `Mismatch! Hash collision (spurious hit).`,
            [...text], { collision: true });
          break;
        }
      }

      if (match) {
        matches.push(i);
        recorder.add('found', windowIndices, 3,
          `Pattern found at position ${i}!`,
          [...text], { matchPosition: i });
      }
    } else {
      recorder.add('compute', windowIndices, 2,
        `Hash mismatch (${textHash} != ${patHash}). Skip.`,
        [...text], {});
    }

    // Roll the hash
    if (i < n - m) {
      const oldHash = textHash;
      // Remove leading character, add trailing character
      textHash = ((textHash - text[i] * highPow % MOD + MOD) * BASE + text[i + m]) % MOD;

      recorder.add('compute', [i, i + m], 4,
        `Roll hash: remove '${textChars[i]}' (code ${text[i]}), add '${textChars[i + m]}' (code ${text[i + m]}). Hash: ${oldHash} -> ${textHash}`,
        [...text], { removed: textChars[i], added: textChars[i + m], newHash: textHash });
    }
  }

  if (matches.length === 0) {
    recorder.add('message', [], 0,
      `Rolling hash search complete. Pattern "${patChars.join('')}" not found in text.`,
      [...text], {});
  } else {
    recorder.add('sorted', matches, 0,
      `Rolling hash search complete. Pattern found at position(s): ${matches.join(', ')}. Total matches: ${matches.length}.`,
      [...text], { matches });
  }

  return recorder.getSteps();
}
