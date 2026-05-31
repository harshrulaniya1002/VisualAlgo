import StepRecorder from '../../engine/StepRecorder';

export const meta = {
  name: 'BST Insert/Delete/Search',
  slug: 'bst-operations',
  category: 'trees',
  timeComplexity: { best: 'O(log n)', average: 'O(log n)', worst: 'O(n)' },
  spaceComplexity: 'O(n)',
  description:
    'Core binary search tree operations that maintain the BST property where left < root < right. Demonstrates insertion by traversing from root, comparing values, and placing new nodes at the correct leaf position.',
  rendererType: 'tree',
  pseudocode: [
    'function insert(root, value):',
    '  if root is null, create new node',
    '  if value < root.value, go left',
    '  if value > root.value, go right',
    '  return root',
  ],
  inputSchema: {
    type: 'array',
    constraints: { minLength: 2, maxLength: 20, minValue: 1, maxValue: 99 },
  },
};

export const defaultInput = [50, 30, 70, 20, 40, 60, 80];

function buildSnapshot(nodesArr, edgesArr) {
  return {
    nodes: nodesArr.map(n => ({ ...n })),
    edges: edgesArr.map(e => ({ ...e })),
  };
}

export function generateSteps(input) {
  const recorder = new StepRecorder();
  const nodes = [];
  const edges = [];

  // Internal tree structure
  const tree = []; // {id, value, left, right}

  function findNodeIndex(id) {
    return tree.findIndex(n => n.id === id);
  }

  function syncSnapshot() {
    nodes.length = 0;
    edges.length = 0;
    for (const n of tree) {
      nodes.push({ id: n.id, value: n.value, left: n.left, right: n.right, state: 'default' });
    }
    for (const n of tree) {
      if (n.left !== null) edges.push({ from: n.id, to: n.left, state: 'default' });
      if (n.right !== null) edges.push({ from: n.id, to: n.right, state: 'default' });
    }
  }

  function snapshotWithHighlight(highlightIds, highlightEdges, insertedId) {
    const snap = { nodes: [], edges: [] };
    for (const n of tree) {
      let state = 'default';
      if (insertedId === n.id) state = 'inserted';
      else if (highlightIds.includes(n.id)) state = 'highlighted';
      snap.nodes.push({ id: n.id, value: n.value, left: n.left, right: n.right, state });
    }
    for (const n of tree) {
      if (n.left !== null) {
        const eState = highlightEdges.some(e => e.from === n.id && e.to === n.left) ? 'highlighted' : 'default';
        snap.edges.push({ from: n.id, to: n.left, state: eState });
      }
      if (n.right !== null) {
        const eState = highlightEdges.some(e => e.from === n.id && e.to === n.right) ? 'highlighted' : 'default';
        snap.edges.push({ from: n.id, to: n.right, state: eState });
      }
    }
    return snap;
  }

  recorder.add('message', [], 0, `Starting BST construction with ${input.length} values: [${input.join(', ')}]`, { nodes: [], edges: [] }, {});

  let nextId = 0;

  for (let i = 0; i < input.length; i++) {
    const val = input[i];

    if (tree.length === 0) {
      const newId = nextId++;
      tree.push({ id: newId, value: val, left: null, right: null });
      syncSnapshot();
      recorder.add('insert', [], 1, `Insert ${val} as root node`, snapshotWithHighlight([], [], newId), {});
      continue;
    }

    recorder.add('visit', [], 0, `Inserting value ${val} into BST`, snapshotWithHighlight([], [], null), {});

    let currentIdx = 0;
    const pathIds = [];
    const pathEdges = [];

    while (true) {
      const current = tree[currentIdx];
      pathIds.push(current.id);
      recorder.add('compare', [], 2, `Compare ${val} with node ${current.value}`, snapshotWithHighlight(pathIds, pathEdges, null), {});

      if (val < current.value) {
        if (current.left !== null) {
          pathEdges.push({ from: current.id, to: current.left });
          recorder.add('visit', [], 2, `${val} < ${current.value}, go left`, snapshotWithHighlight(pathIds, pathEdges, null), {});
          currentIdx = findNodeIndex(current.left);
        } else {
          const newId = nextId++;
          tree.push({ id: newId, value: val, left: null, right: null });
          current.left = newId;
          recorder.add('insert', [], 1, `${val} < ${current.value}, insert ${val} as left child`, snapshotWithHighlight(pathIds, pathEdges, newId), {});
          break;
        }
      } else if (val > current.value) {
        if (current.right !== null) {
          pathEdges.push({ from: current.id, to: current.right });
          recorder.add('visit', [], 3, `${val} > ${current.value}, go right`, snapshotWithHighlight(pathIds, pathEdges, null), {});
          currentIdx = findNodeIndex(current.right);
        } else {
          const newId = nextId++;
          tree.push({ id: newId, value: val, left: null, right: null });
          current.right = newId;
          recorder.add('insert', [], 1, `${val} > ${current.value}, insert ${val} as right child`, snapshotWithHighlight(pathIds, pathEdges, newId), {});
          break;
        }
      } else {
        recorder.add('message', [], 0, `Value ${val} already exists, skipping duplicate`, snapshotWithHighlight(pathIds, pathEdges, null), {});
        break;
      }
    }
  }

  syncSnapshot();
  recorder.add('message', [], 4, 'BST construction complete!', buildSnapshot(nodes, edges), {});

  return recorder.getSteps();
}
