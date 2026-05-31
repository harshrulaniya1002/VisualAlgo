import StepRecorder from '../../engine/StepRecorder';

export const meta = {
  name: 'Rabin-Karp String Matching',
  slug: 'rabin-karp',
  category: 'string-algorithms',
  timeComplexity: { best: 'O(n + m)', average: 'O(n + m)', worst: 'O(n * m)' },
  spaceComplexity: 'O(1)',
  description:
    'Rabin-Karp uses a rolling hash to quickly filter candidate positions in the text. It computes the hash of the pattern and slides a window over the text, updating the hash in constant time. On hash match it verifies character by character.',
  rendererType: 'bar',
  pseudocode: [
    'Compute hash of pattern',
    'Compute hash of first window in text',
    'for i = 0 to n - m:',
    '  if hashWindow == hashPattern:',
    '    verify characters one by one',
    '  slide window: update hash',
  ],
  inputSchema: {
    type: 'array',
    constraints: { minLength: 2, maxLength: 100, minValue: 0, maxValue: 999 },
  },
};

// Format: [patLen, pat..., text...]
// Pattern = "ABC" (65,66,67), Text = "ABDABCABC" (65,66,68,65,66,67,65,66,67)
export const defaultInput = [3, 65, 66, 67, 65, 66, 68, 65, 66, 67, 65, 66, 67];

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

  const BASE = 256;
  const MOD = 101;

  recorder.add('message', [], 0,
    `Rabin-Karp: search for pattern "${patChars.join('')}" (length ${m}) in text "${textChars.join('')}" (length ${n}). Using base=${BASE}, mod=${MOD}.`,
    [...text], { pattern: patChars.join(''), text: textChars.join('') });

  if (m > n) {
    recorder.add('message', [], 0,
      `Pattern is longer than text. No match possible.`,
      [...text], {});
    return recorder.getSteps();
  }

  // Compute hash of pattern and first window
  let patHash = 0;
  let textHash = 0;
  let h = 1; // BASE^(m-1) % MOD

  for (let i = 0; i < m - 1; i++) {
    h = (h * BASE) % MOD;
  }

  for (let i = 0; i < m; i++) {
    patHash = (patHash * BASE + pattern[i]) % MOD;
    textHash = (textHash * BASE + text[i]) % MOD;
  }

  const patIndices = [];
  for (let i = 0; i < m; i++) patIndices.push(i);
  recorder.add('compute', patIndices, 0,
    `Pattern hash("${patChars.join('')}") = ${patHash}`,
    [...text], { patHash });

  const firstWindow = [];
  for (let i = 0; i < m; i++) firstWindow.push(i);
  recorder.add('compute', firstWindow, 1,
    `First window hash("${textChars.slice(0, m).join('')}") = ${textHash}`,
    [...text], { textHash });

  const matches = [];

  for (let i = 0; i <= n - m; i++) {
    const windowIndices = [];
    for (let x = i; x < i + m; x++) windowIndices.push(x);

    recorder.add('compare', windowIndices, 3,
      `Window at position ${i}: "${textChars.slice(i, i + m).join('')}", hash=${textHash}. Pattern hash=${patHash}.`,
      [...text], { i, textHash, patHash });

    if (patHash === textHash) {
      recorder.add('highlight', windowIndices, 4,
        `Hash match at position ${i}! Verifying characters...`,
        [...text], { i });

      let verified = true;
      for (let j = 0; j < m; j++) {
        recorder.add('compare', [i + j], 4,
          `Verify: text[${i + j}]='${textChars[i + j]}' vs pattern[${j}]='${patChars[j]}'`,
          [...text], { textPos: i + j, patPos: j });
        if (text[i + j] !== pattern[j]) {
          verified = false;
          recorder.add('compute', [i + j], 4,
            `Mismatch at position ${j}. Spurious hit (hash collision).`,
            [...text], { collision: true });
          break;
        }
      }

      if (verified) {
        matches.push(i);
        recorder.add('found', windowIndices, 4,
          `Pattern found at text position ${i}!`,
          [...text], { matchPosition: i });
      }
    } else {
      recorder.add('compute', windowIndices, 3,
        `Hash mismatch (${textHash} != ${patHash}). Skip this position.`,
        [...text], { i });
    }

    // Slide window: update hash
    if (i < n - m) {
      const oldHash = textHash;
      textHash = ((textHash - text[i] * h) * BASE + text[i + m]) % MOD;
      if (textHash < 0) textHash += MOD;

      recorder.add('compute', [i, i + m], 5,
        `Slide: remove '${textChars[i]}', add '${textChars[i + m]}'. Hash: ${oldHash} -> ${textHash}`,
        [...text], { removed: textChars[i], added: textChars[i + m], newHash: textHash });
    }
  }

  if (matches.length === 0) {
    recorder.add('message', [], 0,
      `Rabin-Karp complete. Pattern "${patChars.join('')}" not found in text.`,
      [...text], {});
  } else {
    recorder.add('sorted', matches, 0,
      `Rabin-Karp complete. Pattern found at position(s): ${matches.join(', ')}. Total matches: ${matches.length}.`,
      [...text], { matches });
  }

  return recorder.getSteps();
}
