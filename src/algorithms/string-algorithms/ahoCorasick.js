import StepRecorder from '../../engine/StepRecorder';

export const meta = {
  name: 'Aho-Corasick Multi-Pattern Matching',
  slug: 'aho-corasick',
  category: 'string-algorithms',
  timeComplexity: { best: 'O(n + m + z)', average: 'O(n + m + z)', worst: 'O(n + m + z)' },
  spaceComplexity: 'O(m * k)',
  description:
    'Aho-Corasick constructs a trie of all patterns with failure links (similar to KMP) and output links. It then scans the text once, following transitions and failure links to find all occurrences of all patterns simultaneously. z = number of matches, m = total pattern length, k = alphabet size.',
  rendererType: 'bar',
  pseudocode: [
    'Build trie from all patterns',
    'Compute failure links via BFS',
    'Compute output links',
    'state = root',
    'for each char in text:',
    '  follow transitions / failure links',
    '  check output links for matches',
  ],
  inputSchema: {
    type: 'array',
    constraints: { minLength: 2, maxLength: 100, minValue: 0, maxValue: 999 },
  },
};

// Format: [numPatterns, len1, pat1..., len2, pat2..., text...]
// 2 patterns: "AB" (65,66) and "BC" (66,67), text: "ABCAB" (65,66,67,65,66)
export const defaultInput = [2, 2, 65, 66, 2, 66, 67, 65, 66, 67, 65, 66];

export function generateSteps(input) {
  const recorder = new StepRecorder();
  const arr = [...input];

  // Parse input
  let idx = 0;
  const numPatterns = arr[idx++];
  const patterns = [];
  for (let p = 0; p < numPatterns; p++) {
    const len = arr[idx++];
    const pat = arr.slice(idx, idx + len);
    patterns.push(pat);
    idx += len;
  }
  const text = arr.slice(idx);
  const n = text.length;
  const textChars = text.map(c => String.fromCharCode(c));
  const patStrings = patterns.map(p => p.map(c => String.fromCharCode(c)).join(''));

  recorder.add('message', [], 0,
    `Aho-Corasick: search for ${numPatterns} patterns [${patStrings.map(s => '"' + s + '"').join(', ')}] in text "${textChars.join('')}"`,
    [...text], { patterns: patStrings, text: textChars.join('') });

  // Build trie
  // Each node: { children: {}, fail: 0, output: [], depth: 0 }
  const trie = [{ children: {}, fail: 0, output: [], depth: 0 }];

  recorder.add('message', [], 0,
    `Phase 1: Building trie from patterns`,
    [...text], {});

  for (let p = 0; p < patterns.length; p++) {
    let node = 0;
    const pat = patterns[p];
    const patStr = patStrings[p];

    for (let i = 0; i < pat.length; i++) {
      const ch = pat[i];
      const chChar = String.fromCharCode(ch);

      if (trie[node].children[ch] === undefined) {
        trie[node].children[ch] = trie.length;
        trie.push({ children: {}, fail: 0, output: [], depth: trie[node].depth + 1 });
        recorder.add('compute', [], 0,
          `Trie: add node ${trie.length - 1} for char '${chChar}' (pattern "${patStr}", position ${i})`,
          [...text], { node: trie.length - 1, char: chChar, pattern: p });
      }
      node = trie[node].children[ch];
    }
    trie[node].output.push(p);
    recorder.add('highlight', [], 0,
      `Mark node ${node} as end of pattern ${p} ("${patStr}")`,
      [...text], { node, pattern: p });
  }

  recorder.add('message', [], 1,
    `Trie built with ${trie.length} nodes. Computing failure links via BFS.`,
    [...text], { trieSize: trie.length });

  // Compute failure links using BFS
  const queue = [];
  // Initialize: children of root have fail = 0
  for (const ch of Object.keys(trie[0].children)) {
    const child = trie[0].children[ch];
    trie[child].fail = 0;
    queue.push(child);
  }

  while (queue.length > 0) {
    const u = queue.shift();
    for (const ch of Object.keys(trie[u].children)) {
      const v = trie[u].children[ch];
      let f = trie[u].fail;
      while (f !== 0 && trie[f].children[ch] === undefined) {
        f = trie[f].fail;
      }
      trie[v].fail = trie[f].children[ch] !== undefined && trie[f].children[ch] !== v
        ? trie[f].children[ch]
        : (f === 0 && trie[0].children[ch] !== undefined && trie[0].children[ch] !== v ? trie[0].children[ch] : 0);
      // Merge output links
      trie[v].output = trie[v].output.concat(trie[trie[v].fail].output);

      recorder.add('compute', [], 1,
        `Failure link: node ${v} (depth ${trie[v].depth}) -> node ${trie[v].fail}` +
        (trie[v].output.length > 0 ? `. Outputs: [${trie[v].output.map(i => '"' + patStrings[i] + '"').join(', ')}]` : ''),
        [...text], { node: v, fail: trie[v].fail, outputs: trie[v].output });

      queue.push(v);
    }
  }

  recorder.add('message', [], 2,
    `Failure links computed. Phase 2: Searching text.`,
    [...text], {});

  // Search phase
  let state = 0;
  const matches = [];

  for (let i = 0; i < n; i++) {
    const ch = text[i];
    const chChar = textChars[i];

    recorder.add('visit', [i], 4,
      `Text position ${i}: '${chChar}'. Current state = ${state}`,
      [...text], { i, state });

    while (state !== 0 && trie[state].children[ch] === undefined) {
      recorder.add('compute', [i], 5,
        `No transition for '${chChar}' at state ${state}. Follow failure link to state ${trie[state].fail}`,
        [...text], { state, fail: trie[state].fail });
      state = trie[state].fail;
    }

    if (trie[state].children[ch] !== undefined) {
      state = trie[state].children[ch];
      recorder.add('compute', [i], 5,
        `Transition on '${chChar}' to state ${state}`,
        [...text], { state, char: chChar });
    }

    // Check outputs
    if (trie[state].output.length > 0) {
      for (const patIdx of trie[state].output) {
        const patLen2 = patterns[patIdx].length;
        const matchPos = i - patLen2 + 1;
        matches.push({ pattern: patIdx, position: matchPos });
        const matchIndices = [];
        for (let x = matchPos; x <= i; x++) matchIndices.push(x);
        recorder.add('found', matchIndices, 6,
          `Match! Pattern ${patIdx} ("${patStrings[patIdx]}") found at text position ${matchPos}`,
          [...text], { patternIndex: patIdx, matchPosition: matchPos });
      }
    }
  }

  if (matches.length === 0) {
    recorder.add('message', [], 0,
      `Aho-Corasick complete. No patterns found in text.`,
      [...text], {});
  } else {
    const allMatchIndices = [...new Set(matches.map(m => m.position))];
    recorder.add('sorted', allMatchIndices, 0,
      `Aho-Corasick complete. Found ${matches.length} match(es): ${matches.map(m => `"${patStrings[m.pattern]}" at position ${m.position}`).join('; ')}.`,
      [...text], { matches });
  }

  return recorder.getSteps();
}
