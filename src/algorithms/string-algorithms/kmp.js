import StepRecorder from '../../engine/StepRecorder';

export const meta = {
  name: 'KMP String Matching',
  slug: 'kmp',
  category: 'string-algorithms',
  timeComplexity: { best: 'O(n + m)', average: 'O(n + m)', worst: 'O(n + m)' },
  spaceComplexity: 'O(m)',
  description:
    'Knuth-Morris-Pratt algorithm searches for a pattern in text by precomputing a failure (prefix) function that allows skipping previously matched characters on a mismatch, achieving linear-time matching.',
  rendererType: 'bar',
  pseudocode: [
    'Build failure function F for pattern',
    'F[0] = 0; k = 0',
    'for i = 1 to m-1: adjust k via F, set F[i]',
    'j = 0 (pattern pointer)',
    'for i = 0 to n-1:',
    '  while j > 0 and text[i] != pattern[j]: j = F[j-1]',
    '  if text[i] == pattern[j]: j++',
    '  if j == m: found match at i - m + 1',
  ],
  inputSchema: {
    type: 'array',
    constraints: { minLength: 2, maxLength: 100, minValue: 0, maxValue: 999 },
  },
};

// Format: [patLen, pat..., text...]
// Pattern = "ABAB" (65,66,65,66), Text = "ABABDABAC" (65,66,65,66,68,65,66,65,67)
export const defaultInput = [4, 65, 66, 65, 66, 65, 66, 65, 66, 68, 65, 66, 65, 67];

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

  recorder.add('message', [], 0,
    `KMP: search for pattern "${patChars.join('')}" (length ${m}) in text "${textChars.join('')}" (length ${n})`,
    [...text], { pattern: patChars.join(''), text: textChars.join('') });

  // Build failure function
  const F = new Array(m).fill(0);

  recorder.add('message', [], 0,
    `Building failure (prefix) function for pattern "${patChars.join('')}"`,
    [...pattern], {});

  recorder.add('compute', [0], 1,
    `F[0] = 0 (single character has no proper prefix that is also a suffix)`,
    [...pattern], { F: [...F] });

  let k = 0;
  for (let i = 1; i < m; i++) {
    recorder.add('compare', [i, k], 2,
      `Compare pattern[${i}]='${patChars[i]}' with pattern[${k}]='${patChars[k]}'`,
      [...pattern], { i, k, F: [...F] });

    while (k > 0 && pattern[i] !== pattern[k]) {
      recorder.add('compute', [k], 2,
        `Mismatch: fall back k from ${k} to F[${k - 1}] = ${F[k - 1]}`,
        [...pattern], { i, k, fallback: F[k - 1] });
      k = F[k - 1];
    }

    if (pattern[i] === pattern[k]) {
      k++;
      recorder.add('match', [i], 2,
        `Match: pattern[${i}]='${patChars[i]}' == pattern[${k - 1}]='${patChars[k - 1]}', k becomes ${k}`,
        [...pattern], { i, k });
    }

    F[i] = k;
    recorder.add('compute', [i], 2,
      `F[${i}] = ${k}`,
      [...pattern], { F: [...F] });
  }

  recorder.add('message', [], 2,
    `Failure function complete: F = [${F.join(', ')}]`,
    [...F], { F: [...F] });

  // Search phase
  recorder.add('message', [], 3,
    `Begin searching text "${textChars.join('')}" using failure function`,
    [...text], {});

  let j = 0;
  const matches = [];

  for (let i = 0; i < n; i++) {
    recorder.add('visit', [i], 4,
      `Text position i=${i}: '${textChars[i]}', pattern pointer j=${j}`,
      [...text], { i, j });

    while (j > 0 && text[i] !== pattern[j]) {
      recorder.add('compute', [i], 5,
        `Mismatch: text[${i}]='${textChars[i]}' != pattern[${j}]='${patChars[j]}'. Shift j from ${j} to F[${j - 1}]=${F[j - 1]}`,
        [...text], { i, j, newJ: F[j - 1] });
      j = F[j - 1];
    }

    if (text[i] === pattern[j]) {
      recorder.add('match', [i], 6,
        `Match: text[${i}]='${textChars[i]}' == pattern[${j}]='${patChars[j]}'. j becomes ${j + 1}`,
        [...text], { i, j: j + 1 });
      j++;
    }

    if (j === m) {
      const matchPos = i - m + 1;
      matches.push(matchPos);
      const matchIndices = [];
      for (let x = matchPos; x <= i; x++) matchIndices.push(x);
      recorder.add('found', matchIndices, 7,
        `Pattern found at text position ${matchPos}! ("${textChars.slice(matchPos, matchPos + m).join('')}")`,
        [...text], { matchPosition: matchPos });
      j = F[j - 1];
    }
  }

  if (matches.length === 0) {
    recorder.add('message', [], 0,
      `KMP complete. Pattern "${patChars.join('')}" not found in text.`,
      [...text], {});
  } else {
    recorder.add('sorted', matches, 0,
      `KMP complete. Pattern found at position(s): ${matches.join(', ')}. Total matches: ${matches.length}.`,
      [...text], { matches });
  }

  return recorder.getSteps();
}
