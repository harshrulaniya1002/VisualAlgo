import StepRecorder from '../../engine/StepRecorder';

export const meta = {
  name: 'Trie (Prefix Tree)',
  slug: 'trie',
  category: 'trees',
  timeComplexity: { best: 'O(m)', average: 'O(m)', worst: 'O(m)' },
  spaceComplexity: 'O(n * m)',
  description:
    'A tree where each node represents a character, used for efficient string prefix searching and autocomplete. Each path from root to a marked node represents a stored word.',
  rendererType: 'tree',
  pseudocode: [
    'function insert(word):',
    '  node = root',
    '  for each char in word:',
    '    if char not in node.children: create child',
    '    node = node.children[char]',
    '  mark node as end of word',
  ],
  inputSchema: {
    type: 'array',
    constraints: { minLength: 1, maxLength: 10, minValue: 1, maxValue: 99 },
  },
};

// Input is interpreted as character codes for simplicity in the visualizer
// But we'll use hardcoded words for better visualization
export const defaultInput = [67, 65, 84, 67, 65, 82, 67, 65, 80];
// Encodes: CAT, CAR, CAP (3 chars each, separated by groups of 3)

export function generateSteps(input) {
  const recorder = new StepRecorder();

  // Convert input to words: split into groups of 3 character codes
  const words = [];
  let word = '';
  for (let i = 0; i < input.length; i++) {
    word += String.fromCharCode(input[i]);
    if (word.length === 3 || i === input.length - 1) {
      words.push(word);
      word = '';
    }
  }

  class TrieNode {
    constructor(id, char) {
      this.id = id;
      this.char = char;
      this.children = {};
      this.isEnd = false;
    }
  }

  let nextId = 0;
  const root = new TrieNode(nextId++, 'ROOT');

  function getSnapshot(highlightIds = [], insertedId = null) {
    const nodes = [];
    const edges = [];

    function traverse(node) {
      let state = 'default';
      if (insertedId === node.id) state = 'inserted';
      else if (highlightIds.includes(node.id)) state = 'highlighted';

      const childIds = Object.values(node.children).map(c => c.id);
      const label = node.isEnd ? `${node.char}*` : node.char;

      // For tree renderer: use left/right for first two children
      const leftChild = childIds.length > 0 ? childIds[0] : null;
      const rightChild = childIds.length > 1 ? childIds[1] : null;

      nodes.push({ id: node.id, value: label, left: leftChild, right: rightChild, state });

      for (const child of Object.values(node.children)) {
        edges.push({ from: node.id, to: child.id, state: highlightIds.includes(child.id) ? 'highlighted' : 'default' });
        traverse(child);
      }
    }

    traverse(root);
    return { nodes, edges };
  }

  recorder.add('message', [], 0, `Building Trie from words: [${words.join(', ')}]`, getSnapshot(), {});

  for (const w of words) {
    recorder.add('message', [], 0, `Inserting word "${w}"`, getSnapshot(), {});

    let current = root;
    const pathIds = [root.id];

    for (let i = 0; i < w.length; i++) {
      const ch = w[i];

      if (current.children[ch]) {
        recorder.add('visit', [], 2, `Character '${ch}' already exists, follow existing path`, getSnapshot(pathIds), {});
        current = current.children[ch];
        pathIds.push(current.id);
      } else {
        const newNode = new TrieNode(nextId++, ch);
        current.children[ch] = newNode;
        recorder.add('insert', [], 3, `Create new node for '${ch}'`, getSnapshot(pathIds, newNode.id), {});
        current = newNode;
        pathIds.push(current.id);
      }
    }

    current.isEnd = true;
    recorder.add('visit', [], 5, `Mark '${current.char}' as end of word "${w}"`, getSnapshot(pathIds), {});
  }

  // Demonstrate search
  if (words.length > 0) {
    const searchWord = words[0];
    recorder.add('message', [], 0, `Searching for "${searchWord}" in Trie`, getSnapshot(), {});

    let current = root;
    const searchPath = [root.id];
    let found = true;

    for (const ch of searchWord) {
      if (current.children[ch]) {
        current = current.children[ch];
        searchPath.push(current.id);
        recorder.add('visit', [], 2, `Found '${ch}', continue search`, getSnapshot(searchPath), {});
      } else {
        found = false;
        recorder.add('visit', [], 2, `Character '${ch}' not found!`, getSnapshot(searchPath), {});
        break;
      }
    }

    if (found && current.isEnd) {
      recorder.add('message', [], 5, `Word "${searchWord}" found in Trie!`, getSnapshot(searchPath), {});
    } else if (found) {
      recorder.add('message', [], 5, `"${searchWord}" exists as prefix but not as complete word`, getSnapshot(searchPath), {});
    }
  }

  recorder.add('message', [], 5, 'Trie operations complete!', getSnapshot(), {});

  return recorder.getSteps();
}
