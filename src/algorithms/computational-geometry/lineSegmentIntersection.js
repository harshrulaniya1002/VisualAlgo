import StepRecorder from '../../engine/StepRecorder';

export const meta = {
  name: 'Line Segment Intersection',
  slug: 'line-segment-intersection',
  category: 'computational-geometry',
  timeComplexity: { best: 'O(1)', average: 'O(1)', worst: 'O(1)' },
  spaceComplexity: 'O(1)',
  description:
    'Determines whether two line segments intersect using orientation tests. Computes the orientation of triples of points (clockwise, counter-clockwise, or collinear) and checks if each segment straddles the line containing the other.',
  rendererType: 'graph',
  pseudocode: [
    'compute orientation(p1, q1, p2)',
    'compute orientation(p1, q1, q2)',
    'compute orientation(p2, q2, p1)',
    'compute orientation(p2, q2, q1)',
    'if orientations indicate straddling: segments intersect',
    'check collinear special cases',
    'return result',
  ],
  inputSchema: {
    type: 'array',
    constraints: { minLength: 2, maxLength: 50, minValue: 0, maxValue: 999 },
  },
};

// Format: [x1,y1, x2,y2, x3,y3, x4,y4] - segment1: (x1,y1)-(x2,y2), segment2: (x3,y3)-(x4,y4)
export const defaultInput = [1,1, 4,4, 1,4, 4,1];

const SCALE = 80;
const OFFSET_X = 80;
const OFFSET_Y = 30;

function scaleX(x) { return x * SCALE + OFFSET_X; }
function scaleY(y) { return (6 - y) * SCALE + OFFSET_Y; }

function orientation(p, q, r) {
  const val = (q.y - p.y) * (r.x - q.x) - (q.x - p.x) * (r.y - q.y);
  if (Math.abs(val) < 1e-9) return 0; // collinear
  return val > 0 ? 1 : 2; // 1 = clockwise, 2 = counter-clockwise
}

function onSegment(p, q, r) {
  return q.x <= Math.max(p.x, r.x) && q.x >= Math.min(p.x, r.x) &&
         q.y <= Math.max(p.y, r.y) && q.y >= Math.min(p.y, r.y);
}

function orientationName(o) {
  if (o === 0) return 'Collinear';
  if (o === 1) return 'Clockwise';
  return 'Counter-clockwise';
}

export function generateSteps(input) {
  const recorder = new StepRecorder();

  const p1 = { x: input[0], y: input[1] };
  const q1 = { x: input[2], y: input[3] };
  const p2 = { x: input[4], y: input[5] };
  const q2 = { x: input[6], y: input[7] };

  const pts = [p1, q1, p2, q2];
  const labels = ['P1', 'Q1', 'P2', 'Q2'];

  function makeNodes(states = {}) {
    return pts.map((p, i) => ({
      id: i,
      x: scaleX(p.x),
      y: scaleY(p.y),
      label: `${labels[i]}(${p.x},${p.y})`,
      state: states[i] || 'default',
    }));
  }

  function makeSnapshot(states, edgeStates) {
    return {
      nodes: makeNodes(states),
      edges: edgeStates.map(e => ({ ...e })),
    };
  }

  const seg1Edge = { from: 0, to: 1, state: 'visited', directed: false, label: 'Seg1' };
  const seg2Edge = { from: 2, to: 3, state: 'highlighted', directed: false, label: 'Seg2' };
  const edges = [seg1Edge, seg2Edge];

  // Show segments
  recorder.add('message', [], -1, `Testing intersection of segment (${p1.x},${p1.y})-(${q1.x},${q1.y}) and (${p2.x},${p2.y})-(${q2.x},${q2.y})`, makeSnapshot({}, edges));

  // Compute four orientations
  const o1 = orientation(p1, q1, p2);
  recorder.add('compute', [0, 1, 2], 0, `orientation(P1, Q1, P2) = ${orientationName(o1)}`, makeSnapshot({ 0: 'current', 1: 'current', 2: 'current' }, edges));

  const o2 = orientation(p1, q1, q2);
  recorder.add('compute', [0, 1, 3], 1, `orientation(P1, Q1, Q2) = ${orientationName(o2)}`, makeSnapshot({ 0: 'current', 1: 'current', 3: 'current' }, edges));

  const o3 = orientation(p2, q2, p1);
  recorder.add('compute', [2, 3, 0], 2, `orientation(P2, Q2, P1) = ${orientationName(o3)}`, makeSnapshot({ 2: 'current', 3: 'current', 0: 'current' }, edges));

  const o4 = orientation(p2, q2, q1);
  recorder.add('compute', [2, 3, 1], 3, `orientation(P2, Q2, Q1) = ${orientationName(o4)}`, makeSnapshot({ 2: 'current', 3: 'current', 1: 'current' }, edges));

  // General case: different orientations means straddling
  let intersects = false;

  if (o1 !== o2 && o3 !== o4) {
    intersects = true;
    recorder.add('found', [0, 1, 2, 3], 4, `Orientations differ on both sides: segments straddle each other. INTERSECT!`, makeSnapshot({ 0: 'in-path', 1: 'in-path', 2: 'in-path', 3: 'in-path' }, [
      { ...seg1Edge, state: 'in-path' },
      { ...seg2Edge, state: 'in-path' },
    ]));
  } else {
    // Collinear special cases
    recorder.add('compute', [], 5, `Checking collinear special cases...`, makeSnapshot({}, edges));

    if (o1 === 0 && onSegment(p1, p2, q1)) {
      intersects = true;
      recorder.add('found', [2], 5, `P2 lies on segment 1 (collinear case). INTERSECT!`, makeSnapshot({ 2: 'in-path' }, edges));
    } else if (o2 === 0 && onSegment(p1, q2, q1)) {
      intersects = true;
      recorder.add('found', [3], 5, `Q2 lies on segment 1 (collinear case). INTERSECT!`, makeSnapshot({ 3: 'in-path' }, edges));
    } else if (o3 === 0 && onSegment(p2, p1, q2)) {
      intersects = true;
      recorder.add('found', [0], 5, `P1 lies on segment 2 (collinear case). INTERSECT!`, makeSnapshot({ 0: 'in-path' }, edges));
    } else if (o4 === 0 && onSegment(p2, q1, q2)) {
      intersects = true;
      recorder.add('found', [1], 5, `Q1 lies on segment 2 (collinear case). INTERSECT!`, makeSnapshot({ 1: 'in-path' }, edges));
    }
  }

  if (intersects) {
    recorder.add('sorted', [], 6, `Result: The two line segments DO intersect.`, makeSnapshot({ 0: 'in-path', 1: 'in-path', 2: 'in-path', 3: 'in-path' }, [
      { ...seg1Edge, state: 'in-path' },
      { ...seg2Edge, state: 'in-path' },
    ]));
  } else {
    recorder.add('sorted', [], 6, `Result: The two line segments do NOT intersect.`, makeSnapshot({}, edges));
  }

  return recorder.getSteps();
}
