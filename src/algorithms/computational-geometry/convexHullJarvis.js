import StepRecorder from '../../engine/StepRecorder';

export const meta = {
  name: 'Convex Hull - Jarvis March',
  slug: 'convex-hull-jarvis',
  category: 'computational-geometry',
  timeComplexity: { best: 'O(nh)', average: 'O(nh)', worst: 'O(n^2)' },
  spaceComplexity: 'O(h)',
  description:
    'Jarvis March (gift wrapping) builds the convex hull by starting from the leftmost point and repeatedly selecting the most counter-clockwise point as the next hull vertex, wrapping around until returning to the start. h is the number of hull vertices.',
  rendererType: 'graph',
  pseudocode: [
    'start from the leftmost point',
    'repeat:',
    '  candidate = first other point',
    '  for each remaining point q:',
    '    if q is more counter-clockwise than candidate:',
    '      candidate = q',
    '  add candidate to hull',
    'until we return to the start',
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
function scaleY(y) { return (10 - y) * SCALE + OFFSET_Y; }

function cross(o, a, b) {
  return (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x);
}

function dist2(a, b) {
  return (a.x - b.x) ** 2 + (a.y - b.y) ** 2;
}

export function generateSteps(input) {
  const recorder = new StepRecorder();
  const n = input[0];
  const points = [];
  for (let i = 0; i < n; i++) {
    points.push({ x: input[1 + 2 * i], y: input[2 + 2 * i] });
  }

  function makeSnapshot(states, hullEdges) {
    return {
      nodes: points.map((p, i) => ({
        id: i,
        x: scaleX(p.x),
        y: scaleY(p.y),
        label: `(${p.x},${p.y})`,
        state: states[i] || 'default',
      })),
      edges: hullEdges.map(e => ({ ...e })),
    };
  }

  // Show all points
  recorder.add('message', [], -1, `Starting Jarvis March (Gift Wrapping) with ${n} points`, makeSnapshot({}, []));

  // Find leftmost point
  let leftmost = 0;
  for (let i = 1; i < n; i++) {
    if (points[i].x < points[leftmost].x || (points[i].x === points[leftmost].x && points[i].y < points[leftmost].y)) {
      leftmost = i;
    }
  }

  recorder.add('highlight', [leftmost], 0, `Found leftmost point: (${points[leftmost].x},${points[leftmost].y})`, makeSnapshot({ [leftmost]: 'current' }, []));

  const hull = [];
  const hullEdges = [];
  let current = leftmost;

  do {
    hull.push(current);
    const hullStates = {};
    for (const h of hull) hullStates[h] = 'in-path';
    hullStates[current] = 'current';

    recorder.add('visit', [current], 1, `Add point (${points[current].x},${points[current].y}) to hull, find next`, makeSnapshot(hullStates, [...hullEdges]));

    let candidate = 0;
    if (candidate === current) candidate = 1;

    for (let q = 0; q < n; q++) {
      if (q === current) continue;

      const cp = cross(points[current], points[candidate], points[q]);

      if (candidate === current || cp > 0 || (cp === 0 && dist2(points[current], points[q]) > dist2(points[current], points[candidate]))) {
        const testStates = { ...hullStates };
        testStates[q] = 'current';
        testStates[candidate] = hullStates[candidate] || 'default';

        recorder.add('compare', [current, q], 4, `Point (${points[q].x},${points[q].y}) is more CCW than (${points[candidate].x},${points[candidate].y})`, makeSnapshot(testStates, [...hullEdges]));
        candidate = q;
      }
    }

    hullEdges.push({ from: current, to: candidate, state: 'in-path', directed: false });
    recorder.add('visit', [candidate], 6, `Selected (${points[candidate].x},${points[candidate].y}) as next hull vertex`, makeSnapshot({ ...Object.fromEntries(hull.map(h => [h, 'in-path'])), [candidate]: 'current' }, [...hullEdges]));

    current = candidate;
  } while (current !== leftmost && hull.length < n);

  // Final hull
  const finalStates = {};
  for (const h of hull) finalStates[h] = 'in-path';

  recorder.add('sorted', [], 7, `Jarvis March complete. Convex hull has ${hull.length} vertices.`, makeSnapshot(finalStates, hullEdges));

  return recorder.getSteps();
}
