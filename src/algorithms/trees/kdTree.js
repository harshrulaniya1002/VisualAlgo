import StepRecorder from '../../engine/StepRecorder';

export const meta = {
  name: 'K-D Tree',
  slug: 'kd-tree',
  category: 'trees',
  timeComplexity: { best: 'O(log n)', average: 'O(log n)', worst: 'O(n)' },
  spaceComplexity: 'O(n)',
  description:
    'A space-partitioning tree for organizing points in k-dimensional space. Alternates splitting dimension at each level. Used for nearest neighbor queries and range searches.',
  rendererType: 'tree',
  pseudocode: [
    'function build(points, depth):',
    '  axis = depth % k',
    '  sort points by axis, pick median',
    '  node.left = build(left half, depth+1)',
    '  node.right = build(right half, depth+1)',
  ],
  inputSchema: {
    type: 'array',
    constraints: { minLength: 4, maxLength: 20, minValue: 1, maxValue: 99 },
  },
};

// Pairs of values represent 2D points: [x1, y1, x2, y2, ...]
export const defaultInput = [30, 40, 5, 25, 10, 12, 70, 70, 50, 30, 35, 45];

export function generateSteps(input) {
  const recorder = new StepRecorder();

  // Parse input as 2D points
  const points = [];
  for (let i = 0; i + 1 < input.length; i += 2) {
    points.push({ x: input[i], y: input[i + 1] });
  }

  class KDNode {
    constructor(id, point, axis) {
      this.id = id;
      this.point = point;
      this.axis = axis;
      this.left = null;
      this.right = null;
    }
  }

  let nextId = 0;
  let treeRoot = null;

  function getSnapshot(highlightIds = [], insertedId = null) {
    const nodes = [];
    const edges = [];
    function traverse(node) {
      if (!node) return;
      let state = 'default';
      if (insertedId === node.id) state = 'inserted';
      else if (highlightIds.includes(node.id)) state = 'highlighted';
      const axisLabel = node.axis === 0 ? 'x' : 'y';
      nodes.push({ id: node.id, value: `(${node.point.x},${node.point.y}) ${axisLabel}`, left: node.left ? node.left.id : null, right: node.right ? node.right.id : null, state });
      if (node.left) {
        edges.push({ from: node.id, to: node.left.id, state: 'default' });
        traverse(node.left);
      }
      if (node.right) {
        edges.push({ from: node.id, to: node.right.id, state: 'default' });
        traverse(node.right);
      }
    }
    traverse(treeRoot);
    return { nodes, edges };
  }

  function build(pts, depth) {
    if (pts.length === 0) return null;

    const axis = depth % 2;
    const axisName = axis === 0 ? 'x' : 'y';

    pts.sort((a, b) => axis === 0 ? a.x - b.x : a.y - b.y);
    const mid = Math.floor(pts.length / 2);
    const medianPoint = pts[mid];

    const node = new KDNode(nextId++, medianPoint, axis);

    recorder.add('insert', [], 1, `Split by ${axisName}-axis: median point (${medianPoint.x},${medianPoint.y})`, getSnapshot([], node.id), {});

    const leftPts = pts.slice(0, mid);
    const rightPts = pts.slice(mid + 1);

    if (leftPts.length > 0) {
      recorder.add('visit', [], 2, `Build left subtree with ${leftPts.length} points (${axisName} < ${axis === 0 ? medianPoint.x : medianPoint.y})`, getSnapshot([node.id]), {});
    }
    node.left = build(leftPts, depth + 1);

    if (rightPts.length > 0) {
      recorder.add('visit', [], 2, `Build right subtree with ${rightPts.length} points (${axisName} >= ${axis === 0 ? medianPoint.x : medianPoint.y})`, getSnapshot([node.id]), {});
    }
    node.right = build(rightPts, depth + 1);

    return node;
  }

  recorder.add('message', [], 0, `Building 2D K-D tree from ${points.length} points: ${points.map(p => `(${p.x},${p.y})`).join(', ')}`, { nodes: [], edges: [] }, {});

  treeRoot = build([...points], 0);

  recorder.add('message', [], 4, 'K-D tree construction complete!', getSnapshot(), {});

  // Demonstrate nearest neighbor concept
  const queryPoint = { x: 35, y: 35 };
  recorder.add('message', [], 0, `Searching nearest neighbor to (${queryPoint.x},${queryPoint.y})`, getSnapshot(), {});

  let bestDist = Infinity;
  let bestNode = null;

  function dist(a, b) {
    return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
  }

  function nnSearch(node, target, depth) {
    if (!node) return;

    const d = dist(node.point, target);
    recorder.add('visit', [], 2, `Check (${node.point.x},${node.point.y}), distance = ${d.toFixed(1)}`, getSnapshot([node.id]), {});

    if (d < bestDist) {
      bestDist = d;
      bestNode = node;
      recorder.add('visit', [], 2, `New best: (${node.point.x},${node.point.y}) at distance ${d.toFixed(1)}`, getSnapshot([node.id]), {});
    }

    const axis = depth % 2;
    const diff = axis === 0 ? target.x - node.point.x : target.y - node.point.y;

    const first = diff < 0 ? node.left : node.right;
    const second = diff < 0 ? node.right : node.left;

    nnSearch(first, target, depth + 1);

    if (Math.abs(diff) < bestDist) {
      nnSearch(second, target, depth + 1);
    }
  }

  nnSearch(treeRoot, queryPoint, 0);

  if (bestNode) {
    recorder.add('message', [], 4, `Nearest neighbor to (${queryPoint.x},${queryPoint.y}) is (${bestNode.point.x},${bestNode.point.y}) at distance ${bestDist.toFixed(1)}`, getSnapshot([bestNode.id]), {});
  }

  return recorder.getSteps();
}
