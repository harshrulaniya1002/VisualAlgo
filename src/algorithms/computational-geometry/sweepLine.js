import StepRecorder from '../../engine/StepRecorder';

export const meta = {
  name: 'Sweep Line Segment Intersection',
  slug: 'sweep-line',
  category: 'computational-geometry',
  timeComplexity: { best: 'O(n log n)', average: 'O(n log n)', worst: 'O((n + k) log n)' },
  spaceComplexity: 'O(n)',
  description:
    'Detects all intersections among a set of line segments using a vertical sweep line. Events (segment starts, ends) are processed left to right. An active set of segments is maintained, and newly adjacent segments are tested for intersection.',
  rendererType: 'graph',
  pseudocode: [
    'create events for each segment start and end',
    'sort events by x-coordinate',
    'for each event:',
    '  if segment start: insert into active set, check neighbors',
    '  if segment end: check neighbors, remove from active set',
    '  if intersection found: report it',
    'return all intersections',
  ],
  inputSchema: {
    type: 'array',
    constraints: { minLength: 2, maxLength: 50, minValue: 0, maxValue: 999 },
  },
};

// Format: [numSegments, x1,y1,x2,y2, ...] for each segment
export const defaultInput = [4, 1,1,4,4, 1,4,4,1, 2,0,2,5, 0,2,5,3];

function computeScale(segments) {
  let maxX = 0, maxY = 0;
  for (const s of segments) {
    maxX = Math.max(maxX, s.x1, s.x2);
    maxY = Math.max(maxY, s.y1, s.y2);
  }
  const sx = maxX > 0 ? 480 / (maxX + 2) : 50;
  const sy = maxY > 0 ? 330 / (maxY + 2) : 50;
  return { sx: Math.min(sx, 80), sy: Math.min(sy, 80), maxY: maxY + 2 };
}

function segIntersect(s1, s2) {
  const { x1: a, y1: b, x2: c, y2: d } = s1;
  const { x1: e, y1: f, x2: g, y2: h } = s2;

  const denom = (c - a) * (h - f) - (d - b) * (g - e);
  if (Math.abs(denom) < 1e-9) return null;

  const t = ((e - a) * (h - f) - (f - b) * (g - e)) / denom;
  const u = ((e - a) * (d - b) - (f - b) * (c - a)) / denom;

  if (t >= 0 && t <= 1 && u >= 0 && u <= 1) {
    return { x: a + t * (c - a), y: b + t * (d - b) };
  }
  return null;
}

export function generateSteps(input) {
  const recorder = new StepRecorder();
  const numSeg = input[0];
  const segments = [];
  for (let i = 0; i < numSeg; i++) {
    const base = 1 + i * 4;
    let x1 = input[base], y1 = input[base + 1], x2 = input[base + 2], y2 = input[base + 3];
    // Ensure x1 <= x2 (left endpoint first)
    if (x1 > x2) { [x1, x2] = [x2, x1]; [y1, y2] = [y2, y1]; }
    segments.push({ x1, y1, x2, y2, id: i });
  }

  const { sx, sy, maxY } = computeScale(segments);
  const OX = 50;
  const OY = 20;

  function toScreenX(x) { return x * sx + OX; }
  function toScreenY(y) { return (maxY - y) * sy + OY; }

  // Each segment has two endpoint nodes: node 2*i and 2*i+1
  function makeNodes(states = {}) {
    const nodes = [];
    for (let i = 0; i < numSeg; i++) {
      const s = segments[i];
      nodes.push({
        id: 2 * i,
        x: toScreenX(s.x1),
        y: toScreenY(s.y1),
        label: `S${i}a`,
        state: states[2 * i] || 'default',
      });
      nodes.push({
        id: 2 * i + 1,
        x: toScreenX(s.x2),
        y: toScreenY(s.y2),
        label: `S${i}b`,
        state: states[2 * i + 1] || 'default',
      });
    }
    return nodes;
  }

  function makeSegmentEdges(edgeStates = {}) {
    return segments.map((s, i) => ({
      from: 2 * i,
      to: 2 * i + 1,
      state: edgeStates[i] || 'default',
      directed: false,
      label: `S${i}`,
    }));
  }

  function makeSnapshot(nodeStates, edgeStates, extraNodes = [], extraEdges = []) {
    return {
      nodes: [...makeNodes(nodeStates), ...extraNodes],
      edges: [...makeSegmentEdges(edgeStates), ...extraEdges],
    };
  }

  // Show all segments
  recorder.add('message', [], -1, `Starting Sweep Line with ${numSeg} line segments`, makeSnapshot({}, {}));

  // Create events
  const events = [];
  for (let i = 0; i < numSeg; i++) {
    events.push({ x: segments[i].x1, type: 'start', segId: i });
    events.push({ x: segments[i].x2, type: 'end', segId: i });
  }
  events.sort((a, b) => a.x - b.x || (a.type === 'start' ? -1 : 1));

  recorder.add('compute', [], 0, `Created ${events.length} events (start/end for each segment), sorted by x`, makeSnapshot({}, {}));

  const active = new Set();
  const intersections = [];
  const foundPairs = new Set();

  for (const event of events) {
    const segId = event.segId;
    const allEdgeStates = {};
    for (const a of active) allEdgeStates[a] = 'visited';

    if (event.type === 'start') {
      allEdgeStates[segId] = 'highlighted';
      recorder.add('visit', [2 * segId], 3, `Sweep x = ${event.x}: Segment S${segId} starts. Add to active set.`, makeSnapshot({ [2 * segId]: 'current' }, allEdgeStates));

      active.add(segId);

      // Check for intersections with all active segments
      for (const otherId of active) {
        if (otherId === segId) continue;
        const pairKey = Math.min(segId, otherId) + ',' + Math.max(segId, otherId);
        if (foundPairs.has(pairKey)) continue;

        const pt = segIntersect(segments[segId], segments[otherId]);

        const checkEdgeStates = { ...allEdgeStates };
        checkEdgeStates[segId] = 'highlighted';
        checkEdgeStates[otherId] = 'highlighted';

        recorder.add('compare', [2 * segId, 2 * otherId], 4, `Checking S${segId} vs S${otherId} for intersection`, makeSnapshot({ [2 * segId]: 'current', [2 * otherId]: 'current' }, checkEdgeStates));

        if (pt) {
          foundPairs.add(pairKey);
          const intId = 2 * numSeg + intersections.length;
          intersections.push({ x: pt.x, y: pt.y, id: intId, seg1: segId, seg2: otherId });

          const intNode = {
            id: intId,
            x: toScreenX(pt.x),
            y: toScreenY(pt.y),
            label: `Int(${pt.x.toFixed(1)},${pt.y.toFixed(1)})`,
            state: 'in-path',
          };

          recorder.add('found', [2 * segId, 2 * otherId], 5, `Intersection found! S${segId} and S${otherId} intersect at (${pt.x.toFixed(2)}, ${pt.y.toFixed(2)})`, makeSnapshot({ [2 * segId]: 'in-path', [2 * otherId]: 'in-path' }, { ...allEdgeStates, [segId]: 'in-path', [otherId]: 'in-path' }, [intNode]));
        }
      }
    } else {
      // End event
      active.delete(segId);
      allEdgeStates[segId] = 'default';
      recorder.add('message', [2 * segId + 1], 4, `Sweep x = ${event.x}: Segment S${segId} ends. Remove from active set.`, makeSnapshot({ [2 * segId + 1]: 'current' }, allEdgeStates));
    }
  }

  // Final result
  const intNodes = intersections.map(ip => ({
    id: ip.id,
    x: toScreenX(ip.x),
    y: toScreenY(ip.y),
    label: `(${ip.x.toFixed(1)},${ip.y.toFixed(1)})`,
    state: 'in-path',
  }));

  const finalEdgeStates = {};
  for (let i = 0; i < numSeg; i++) finalEdgeStates[i] = 'visited';
  for (const ip of intersections) {
    finalEdgeStates[ip.seg1] = 'in-path';
    finalEdgeStates[ip.seg2] = 'in-path';
  }

  recorder.add('sorted', [], 6, `Sweep line complete. Found ${intersections.length} intersection(s).`, makeSnapshot({}, finalEdgeStates, intNodes));

  return recorder.getSteps();
}
