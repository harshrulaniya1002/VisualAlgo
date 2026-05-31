import StepRecorder from '../../engine/StepRecorder';

export const meta = {
  name: 'Interval Tree',
  slug: 'interval-tree',
  category: 'trees',
  timeComplexity: { best: 'O(log n)', average: 'O(log n + k)', worst: 'O(n)' },
  spaceComplexity: 'O(n)',
  description:
    'A tree structure for storing intervals and efficiently finding all intervals overlapping a given point or interval. Each node stores an interval and the maximum endpoint in its subtree.',
  rendererType: 'tree',
  pseudocode: [
    'function insert(node, interval):',
    '  BST insert by interval.low',
    '  update node.max = max(endpoints)',
    'function overlapSearch(node, query):',
    '  if node overlaps query: return node',
    '  if left.max >= query.low: go left, else right',
  ],
  inputSchema: {
    type: 'array',
    constraints: { minLength: 4, maxLength: 16, minValue: 1, maxValue: 50 },
  },
};

// Pairs of values represent intervals: [low1, high1, low2, high2, ...]
export const defaultInput = [15, 20, 10, 30, 17, 19, 5, 20, 12, 15];

export function generateSteps(input) {
  const recorder = new StepRecorder();

  // Parse input as pairs of intervals
  const intervals = [];
  for (let i = 0; i + 1 < input.length; i += 2) {
    const lo = Math.min(input[i], input[i + 1]);
    const hi = Math.max(input[i], input[i + 1]);
    intervals.push({ low: lo, high: hi });
  }

  class ITNode {
    constructor(id, low, high) {
      this.id = id;
      this.low = low;
      this.high = high;
      this.max = high;
      this.left = null;
      this.right = null;
    }
  }

  let nextId = 0;
  let root = null;

  function getSnapshot(highlightIds = [], insertedId = null) {
    const nodes = [];
    const edges = [];
    function traverse(node) {
      if (!node) return;
      let state = 'default';
      if (insertedId === node.id) state = 'inserted';
      else if (highlightIds.includes(node.id)) state = 'highlighted';
      nodes.push({ id: node.id, value: `[${node.low},${node.high}] m:${node.max}`, left: node.left ? node.left.id : null, right: node.right ? node.right.id : null, state });
      if (node.left) {
        edges.push({ from: node.id, to: node.left.id, state: 'default' });
        traverse(node.left);
      }
      if (node.right) {
        edges.push({ from: node.id, to: node.right.id, state: 'default' });
        traverse(node.right);
      }
    }
    traverse(root);
    return { nodes, edges };
  }

  function insert(node, low, high) {
    if (!node) {
      const newNode = new ITNode(nextId++, low, high);
      return newNode;
    }

    if (low < node.low) {
      node.left = insert(node.left, low, high);
    } else {
      node.right = insert(node.right, low, high);
    }

    if (node.max < high) {
      node.max = high;
    }

    return node;
  }

  recorder.add('message', [], 0, `Building interval tree from ${intervals.length} intervals`, { nodes: [], edges: [] }, {});

  for (const itv of intervals) {
    recorder.add('message', [], 0, `Inserting interval [${itv.low}, ${itv.high}]`, getSnapshot(), {});
    root = insert(root, itv.low, itv.high);
    recorder.add('insert', [], 1, `Inserted [${itv.low}, ${itv.high}]. Updated max values.`, getSnapshot([], nextId - 1), {});
  }

  recorder.add('message', [], 0, 'Interval tree built. Searching for overlaps.', getSnapshot(), {});

  // Overlap query
  const queryLow = 14, queryHigh = 16;
  recorder.add('message', [], 0, `Searching for intervals overlapping [${queryLow}, ${queryHigh}]`, getSnapshot(), {});

  function overlapSearch(node, low, high) {
    if (!node) return;

    recorder.add('visit', [], 3, `Check [${node.low},${node.high}] vs query [${low},${high}]`, getSnapshot([node.id]), {});

    if (node.low <= high && low <= node.high) {
      recorder.add('visit', [], 3, `Overlap found: [${node.low},${node.high}] overlaps [${low},${high}]!`, getSnapshot([node.id]), {});
    }

    if (node.left && node.left.max >= low) {
      recorder.add('visit', [], 4, `Left subtree max=${node.left.max} >= ${low}, search left`, getSnapshot([node.id, node.left.id]), {});
      overlapSearch(node.left, low, high);
    }

    if (node.right && node.right.max >= low && node.low <= high) {
      recorder.add('visit', [], 4, `Also search right subtree`, getSnapshot([node.id]), {});
      overlapSearch(node.right, low, high);
    }
  }

  overlapSearch(root, queryLow, queryHigh);

  recorder.add('message', [], 4, 'Interval tree operations complete!', getSnapshot(), {});

  return recorder.getSteps();
}
