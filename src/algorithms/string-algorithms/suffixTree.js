import StepRecorder from '../../engine/StepRecorder';

export const meta = {
  name: 'Suffix Tree (Simplified Ukkonen\'s)',
  slug: 'suffix-tree',
  category: 'string-algorithms',
  timeComplexity: { best: 'O(n)', average: 'O(n)', worst: 'O(n)' },
  spaceComplexity: 'O(n)',
  description:
    'Ukkonen\'s algorithm builds a suffix tree incrementally in linear time. It processes one character at a time, extending all existing suffixes using active point tracking and suffix links. This visualization shows a simplified version highlighting the key phases.',
  rendererType: 'bar',
  pseudocode: [
    'for each character s[i]:',
    '  extend tree with s[i]',
    '  remaining++ (suffixes to insert)',
    '  while remaining > 0:',
    '    if active edge exists, try walk down',
    '    if char found: set active, break',
    '    else: split edge / create leaf, follow suffix link',
  ],
  inputSchema: {
    type: 'array',
    constraints: { minLength: 2, maxLength: 100, minValue: 0, maxValue: 999 },
  },
};

// String "ABCAB" as char codes
export const defaultInput = [65, 66, 67, 65, 66];

export function generateSteps(input) {
  const recorder = new StepRecorder();
  const arr = [...input];
  const n = arr.length;
  const chars = arr.map(c => String.fromCharCode(c));
  const str = chars.join('');

  recorder.add('message', [], 0,
    `Building suffix tree for "${str}" (length ${n}) using simplified Ukkonen's algorithm`,
    [...arr], { string: str });

  // Simplified Ukkonen's implementation
  // Node: { children: {}, start, end, suffixLink, suffixIndex }
  const SENTINEL = { value: n }; // shared end for leaves
  const nodes = [];
  let nodeCount = 0;

  function newNode(start, end) {
    const node = {
      id: nodeCount++,
      children: {},
      start: start,
      end: end, // null means leaf (use global end)
      suffixLink: 0,
      suffixIndex: -1,
    };
    nodes.push(node);
    return node.id;
  }

  const root = newNode(-1, { value: -1 }); // root node
  nodes[root].suffixLink = root;

  let activeNode = root;
  let activeEdge = -1;
  let activeLength = 0;
  let remaining = 0;
  let leafEnd = { value: -1 };

  function getEdgeLength(nodeId) {
    const nd = nodes[nodeId];
    const endVal = nd.end === null ? leafEnd.value + 1 : (typeof nd.end === 'object' ? nd.end.value + 1 : nd.end);
    return endVal - nd.start;
  }

  for (let i = 0; i < n; i++) {
    leafEnd.value = i;
    remaining++;

    recorder.add('visit', [i], 0,
      `Phase ${i + 1}: extend with character '${chars[i]}' (code ${arr[i]}). Remaining suffixes to add: ${remaining}`,
      [...arr], { phase: i + 1, char: chars[i], remaining });

    let lastNewInternal = -1;

    while (remaining > 0) {
      if (activeLength === 0) {
        activeEdge = i;
      }

      const activeChar = arr[activeEdge];
      if (nodes[activeNode].children[activeChar] === undefined) {
        // No edge starting with activeChar: create new leaf
        const leaf = newNode(i, null);
        nodes[leaf].suffixIndex = i - remaining + 1;
        nodes[activeNode].children[activeChar] = leaf;

        recorder.add('compute', [i], 5,
          `Rule 2 (no edge): create leaf node ${leaf} for suffix starting at ${i - remaining + 1} ("${chars.slice(i - remaining + 1).join('')}")`,
          [...arr], { leaf, suffixStart: i - remaining + 1 });

        if (lastNewInternal !== -1) {
          nodes[lastNewInternal].suffixLink = activeNode;
          lastNewInternal = -1;
        }
      } else {
        const next = nodes[activeNode].children[activeChar];
        const edgeLen = getEdgeLength(next);

        // Walk down if active length >= edge length
        if (activeLength >= edgeLen) {
          activeEdge += edgeLen;
          activeLength -= edgeLen;
          activeNode = next;
          recorder.add('compute', [i], 4,
            `Walk down to node ${next}, remaining activeLength = ${activeLength}`,
            [...arr], { activeNode, activeLength });
          continue;
        }

        // Rule 3: character already on edge
        if (arr[nodes[next].start + activeLength] === arr[i]) {
          activeLength++;
          recorder.add('highlight', [i], 5,
            `Rule 3: '${chars[i]}' already on edge. Increment activeLength to ${activeLength}. Stop this phase.`,
            [...arr], { activeLength });

          if (lastNewInternal !== -1) {
            nodes[lastNewInternal].suffixLink = activeNode;
          }
          break;
        }

        // Rule 2 with split: need to split the edge
        const splitEnd = nodes[next].start + activeLength;
        const internal = newNode(nodes[next].start, splitEnd);
        nodes[activeNode].children[activeChar] = internal;
        const leaf = newNode(i, null);
        nodes[leaf].suffixIndex = i - remaining + 1;
        nodes[internal].children[arr[i]] = leaf;
        nodes[next].start = splitEnd;
        nodes[internal].children[arr[splitEnd]] = next;
        nodes[internal].suffixLink = root;

        recorder.add('compute', [i], 6,
          `Rule 2 (split): create internal node ${internal} and leaf ${leaf}. Split at '${String.fromCharCode(arr[splitEnd])}'. New suffix at position ${i - remaining + 1}.`,
          [...arr], { internal, leaf, splitChar: String.fromCharCode(arr[splitEnd]) });

        if (lastNewInternal !== -1) {
          nodes[lastNewInternal].suffixLink = internal;
          recorder.add('compute', [], 6,
            `Set suffix link: node ${lastNewInternal} -> node ${internal}`,
            [...arr], { from: lastNewInternal, to: internal });
        }
        lastNewInternal = internal;
      }

      remaining--;

      if (activeNode === root && activeLength > 0) {
        activeLength--;
        activeEdge = i - remaining + 1;
      } else if (nodes[activeNode].suffixLink !== undefined && activeNode !== root) {
        activeNode = nodes[activeNode].suffixLink;
      } else {
        activeNode = root;
      }
    }

    recorder.add('compute', [i], 0,
      `Phase ${i + 1} complete. Tree has ${nodeCount} nodes. Remaining = ${remaining}`,
      [...arr], { nodeCount, remaining });
  }

  // List all suffixes found in the tree
  recorder.add('message', [], 0,
    `Suffix tree construction complete for "${str}". Total nodes: ${nodeCount}.`,
    [...arr], { totalNodes: nodeCount });

  // Collect all suffixes by DFS
  const suffixIndices = [];
  function collectSuffixes(nodeId) {
    const nd = nodes[nodeId];
    if (nd.suffixIndex >= 0) {
      suffixIndices.push(nd.suffixIndex);
      return;
    }
    for (const ch of Object.keys(nd.children).sort((a, b) => a - b)) {
      collectSuffixes(nd.children[ch]);
    }
  }
  for (const ch of Object.keys(nodes[root].children).sort((a, b) => a - b)) {
    collectSuffixes(nodes[root].children[ch]);
  }

  for (let i = 0; i < suffixIndices.length; i++) {
    const si = suffixIndices[i];
    recorder.add('sorted', [si], 0,
      `Suffix at index ${si}: "${chars.slice(si).join('')}"`,
      [...arr], { suffixIndex: si });
  }

  recorder.add('sorted', [], 0,
    `All ${n} suffixes represented in the tree. Suffix indices in sorted order: [${suffixIndices.join(', ')}]`,
    [...arr], { suffixIndices });

  return recorder.getSteps();
}
