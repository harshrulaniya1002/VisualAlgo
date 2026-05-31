import StepRecorder from '../../engine/StepRecorder';

export const meta = {
  name: 'Trie-Based String Matching',
  slug: 'trie-string-matching',
  category: 'string-algorithms',
  timeComplexity: { best: 'O(m)', average: 'O(m)', worst: 'O(m)' },
  spaceComplexity: 'O(n * m)',
  description:
    'A trie (prefix tree) stores a dictionary of words. Each node represents a character, and paths from root to marked nodes spell dictionary words. Searching for a query traces a path in the trie, achieving O(m) lookup where m is the query length. n = number of words, m = average word length.',
  rendererType: 'bar',
  pseudocode: [
    'Create root node',
    'for each word: insert into trie char by char',
    'Mark end-of-word nodes',
    'Search: start at root',
    'for each char in query:',
    '  if child exists: move to child',
    '  else: query not found, report longest prefix',
  ],
  inputSchema: {
    type: 'array',
    constraints: { minLength: 2, maxLength: 100, minValue: 0, maxValue: 999 },
  },
};

// Format: [numWords, len1, word1..., len2, word2..., ..., query...]
// 3 words: "APP"(65,80,80), "APE"(65,80,69), "AT"(65,84), query "APPLE"(65,80,80,76,69)
export const defaultInput = [3, 3, 65, 80, 80, 3, 65, 80, 69, 2, 65, 84, 65, 80, 80, 76, 69];

export function generateSteps(input) {
  const recorder = new StepRecorder();
  const arr = [...input];

  // Parse input
  let idx = 0;
  const numWords = arr[idx++];
  const words = [];
  for (let w = 0; w < numWords; w++) {
    const len = arr[idx++];
    const word = arr.slice(idx, idx + len);
    words.push(word);
    idx += len;
  }
  const query = arr.slice(idx);
  const wordStrings = words.map(w => w.map(c => String.fromCharCode(c)).join(''));
  const queryStr = query.map(c => String.fromCharCode(c)).join('');
  const queryChars = query.map(c => String.fromCharCode(c));

  recorder.add('message', [], 0,
    `Trie: insert dictionary [${wordStrings.map(s => '"' + s + '"').join(', ')}], then search for "${queryStr}"`,
    [...query], { words: wordStrings, query: queryStr });

  // Build trie
  // Each node: { children: {}, isEnd: false, word: '' }
  const trie = [{ children: {}, isEnd: false, word: '' }];
  let nodeCount = 1;

  recorder.add('compute', [], 0,
    `Create root node (node 0)`,
    [...query], { nodeCount: 1 });

  for (let w = 0; w < words.length; w++) {
    const word = words[w];
    const wordStr = wordStrings[w];
    let node = 0;

    recorder.add('message', [], 1,
      `Inserting word ${w + 1}: "${wordStr}"`,
      [...query], { word: wordStr });

    for (let i = 0; i < word.length; i++) {
      const ch = word[i];
      const chChar = String.fromCharCode(ch);

      if (trie[node].children[ch] === undefined) {
        trie[node].children[ch] = nodeCount;
        trie.push({ children: {}, isEnd: false, word: '' });
        nodeCount++;
        recorder.add('compute', [], 1,
          `Create node ${nodeCount - 1} for character '${chChar}' (depth ${i + 1})`,
          [...query], { node: nodeCount - 1, char: chChar, depth: i + 1 });
      } else {
        recorder.add('visit', [], 1,
          `Node for '${chChar}' already exists (node ${trie[node].children[ch]}). Traverse.`,
          [...query], { existing: trie[node].children[ch] });
      }
      node = trie[node].children[ch];
    }

    trie[node].isEnd = true;
    trie[node].word = wordStr;
    recorder.add('highlight', [], 2,
      `Mark node ${node} as end-of-word for "${wordStr}"`,
      [...query], { node, word: wordStr });
  }

  recorder.add('message', [], 0,
    `Trie built with ${nodeCount} nodes and ${numWords} words. Now searching for "${queryStr}".`,
    [...query], { nodeCount, numWords });

  // Search phase
  let node = 0;
  let matched = 0;
  let prefixMatched = '';
  let found = false;

  recorder.add('compute', [], 3,
    `Start search at root (node 0)`,
    [...query], { node: 0 });

  for (let i = 0; i < query.length; i++) {
    const ch = query[i];
    const chChar = queryChars[i];

    recorder.add('visit', [i], 4,
      `Query position ${i}: '${chChar}'. Current node = ${node}`,
      [...query], { i, node, char: chChar });

    if (trie[node].children[ch] !== undefined) {
      node = trie[node].children[ch];
      matched++;
      prefixMatched += chChar;

      recorder.add('match', [i], 5,
        `Child for '${chChar}' found (node ${node}). Matched prefix: "${prefixMatched}"`,
        [...query], { node, matched, prefix: prefixMatched });

      if (trie[node].isEnd) {
        const matchIndices = [];
        for (let x = 0; x < matched; x++) matchIndices.push(x);
        recorder.add('found', matchIndices, 5,
          `Word "${trie[node].word}" found in trie at position ${i}!`,
          [...query], { word: trie[node].word });
        found = true;
      }
    } else {
      recorder.add('compute', [i], 6,
        `No child for '${chChar}' at node ${node}. Query "${queryStr}" not fully in trie. Longest matching prefix: "${prefixMatched}"`,
        [...query], { longestPrefix: prefixMatched, stoppedAt: i });
      break;
    }
  }

  if (matched === query.length && trie[node].isEnd) {
    const allIndices = [];
    for (let i = 0; i < query.length; i++) allIndices.push(i);
    recorder.add('sorted', allIndices, 0,
      `Search complete. "${queryStr}" is an exact match in the trie.`,
      [...query], { exactMatch: true });
  } else if (found) {
    recorder.add('sorted', [], 0,
      `Search complete. "${queryStr}" contains prefix word(s) found in the trie, but "${queryStr}" itself is not a complete word.`,
      [...query], { partialMatch: true });
  } else {
    recorder.add('message', [], 0,
      `Search complete. "${queryStr}" not found. Longest matching prefix: "${prefixMatched}" (${matched} characters).`,
      [...query], { notFound: true, longestPrefix: prefixMatched });
  }

  return recorder.getSteps();
}
