import StepRecorder from '../../engine/StepRecorder';

export const meta = {
  name: 'Convex Hull - Graham Scan',
  slug: 'convex-hull-graham',
  category: 'computational-geometry',
  timeComplexity: { best: 'O(n log n)', average: 'O(n log n)', worst: 'O(n log n)' },
  spaceComplexity: 'O(n)',
  description:
    'Graham Scan finds the convex hull of a set of 2D points. It first selects the lowest point, sorts the remaining points by polar angle, then processes them using a stack, maintaining only counter-clockwise (left) turns to build the hull.',
  rendererType: 'graph',
  pseudocode: [
    'find the lowest point p0',
    'sort other points by polar angle w.r.t. p0',
    'push p0 and p1 onto stack',
    'for each remaining point pi:',
    '  while top two on stack make clockwise turn with pi:',
    '    pop from stack',
    '  push pi onto stack',
    'stack contains the convex hull',
  ],
  inputSchema: {
    type: 'array',
    constraints: { minLength: 2, maxLength: 50, minValue: 0, maxValue: 999 },
  },
};

// Format: [numPoints, x0,y0, x1,y1, ...]
export const defaultInput = [8, 0,3, 1,1, 2,2, 4,4, 0,0, 1,2, 3,1, 3,3];

const SCALE = 50;
const OFFSET_X = 100;
const OFFSET_Y = 50;

function scaleX(x) { return x * SCALE + OFFSET_X; }
function scaleY(y) { return (10 - y) * SCALE + OFFSET_Y; } // Flip y so higher values go up

function cross(o, a, b) {
  return (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x);
}

export function generateSteps(input) {
  const recorder = new StepRecorder();
  const n = input[0];
  const points = [];
  for (let i = 0; i < n; i++) {
    points.push({ x: input[1 + 2 * i], y: input[2 + 2 * i], idx: i });
  }

  function makeNodes(states = {}) {
    return points.map((p, i) => ({
      id: i,
      x: scaleX(p.x),
      y: scaleY(p.y),
      label: `(${p.x},${p.y})`,
      state: states[i] || 'default',
    }));
  }

  function makeSnapshot(states, hullEdges) {
    return {
      nodes: makeNodes(states),
      edges: hullEdges.map(e => ({ ...e })),
    };
  }

  // Step 1: Show all points
  recorder.add('message', [], -1, `Starting Graham Scan with ${n} points`, makeSnapshot({}, []));

  // Step 2: Find lowest point (smallest y, then smallest x)
  let lowest = 0;
  for (let i = 1; i < n; i++) {
    if (points[i].y < points[lowest].y || (points[i].y === points[lowest].y && points[i].x < points[lowest].x)) {
      lowest = i;
    }
  }

  recorder.add('highlight', [lowest], 0, `Found lowest point: (${points[lowest].x},${points[lowest].y}) at index ${lowest}`, makeSnapshot({ [lowest]: 'current' }, []));

  // Swap lowest to position 0
  [points[0], points[lowest]] = [points[lowest], points[0]];
  const pivot = points[0];

  // Step 3: Sort by polar angle relative to pivot
  const rest = points.slice(1);
  rest.sort((a, b) => {
    const angle_a = Math.atan2(a.y - pivot.y, a.x - pivot.x);
    const angle_b = Math.atan2(b.y - pivot.y, b.x - pivot.x);
    if (angle_a !== angle_b) return angle_a - angle_b;
    const dist_a = (a.x - pivot.x) ** 2 + (a.y - pivot.y) ** 2;
    const dist_b = (b.x - pivot.x) ** 2 + (b.y - pivot.y) ** 2;
    return dist_a - dist_b;
  });
  const sorted = [pivot, ...rest];

  // Rebuild index mapping
  const nodeStates = {};
  nodeStates[0] = 'in-path';

  const sortedNodes = sorted.map((p, i) => ({
    id: i,
    x: scaleX(p.x),
    y: scaleY(p.y),
    label: `(${p.x},${p.y})`,
    state: i === 0 ? 'in-path' : 'default',
  }));

  recorder.add('message', [], 1, `Sorted points by polar angle relative to pivot (${pivot.x},${pivot.y})`, {
    nodes: sortedNodes,
    edges: [],
  });

  // Step 4: Graham scan with stack
  const stack = [0, 1];
  const hullEdges = [{ from: 0, to: 1, state: 'visited', directed: false }];

  function makeScanSnapshot(stackArr, highlight = -1) {
    const edges = [];
    for (let i = 0; i < stackArr.length - 1; i++) {
      edges.push({ from: stackArr[i], to: stackArr[i + 1], state: 'visited', directed: false });
    }
    const states = {};
    for (const s of stackArr) states[s] = 'in-path';
    if (highlight >= 0) states[highlight] = 'current';
    return {
      nodes: sorted.map((p, i) => ({
        id: i,
        x: scaleX(p.x),
        y: scaleY(p.y),
        label: `(${p.x},${p.y})`,
        state: states[i] || 'default',
      })),
      edges,
    };
  }

  recorder.add('visit', [0, 1], 2, `Push points 0 and 1 onto stack`, makeScanSnapshot(stack));

  for (let i = 2; i < sorted.length; i++) {
    recorder.add('compare', [i], 3, `Processing point ${i}: (${sorted[i].x},${sorted[i].y})`, makeScanSnapshot(stack, i));

    while (stack.length > 1) {
      const top = stack[stack.length - 1];
      const nextToTop = stack[stack.length - 2];
      const cp = cross(sorted[nextToTop], sorted[top], sorted[i]);

      if (cp <= 0) {
        recorder.add('swap', [top], 5, `Clockwise or collinear turn at (${sorted[top].x},${sorted[top].y}) -- pop from stack`, makeScanSnapshot(stack, i));
        stack.pop();
      } else {
        recorder.add('message', [], 4, `Counter-clockwise turn confirmed, keep (${sorted[top].x},${sorted[top].y})`, makeScanSnapshot(stack, i));
        break;
      }
    }

    stack.push(i);
    recorder.add('visit', [i], 6, `Push point (${sorted[i].x},${sorted[i].y}) onto stack`, makeScanSnapshot(stack));
  }

  // Close the hull
  const finalEdges = [];
  for (let i = 0; i < stack.length; i++) {
    const next = (i + 1) % stack.length;
    finalEdges.push({ from: stack[i], to: stack[next], state: 'in-path', directed: false });
  }

  const finalNodes = sorted.map((p, i) => ({
    id: i,
    x: scaleX(p.x),
    y: scaleY(p.y),
    label: `(${p.x},${p.y})`,
    state: stack.includes(i) ? 'in-path' : 'default',
  }));

  recorder.add('sorted', [], 7, `Graham Scan complete. Convex hull has ${stack.length} vertices.`, {
    nodes: finalNodes,
    edges: finalEdges,
  });

  return recorder.getSteps();
}
