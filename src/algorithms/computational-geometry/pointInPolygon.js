import StepRecorder from '../../engine/StepRecorder';

export const meta = {
  name: 'Point in Polygon - Ray Casting',
  slug: 'point-in-polygon',
  category: 'computational-geometry',
  timeComplexity: { best: 'O(n)', average: 'O(n)', worst: 'O(n)' },
  spaceComplexity: 'O(1)',
  description:
    'Determines if a test point lies inside a polygon using the ray casting algorithm. A horizontal ray is cast from the test point to the right. If the ray crosses an odd number of polygon edges, the point is inside; otherwise it is outside.',
  rendererType: 'graph',
  pseudocode: [
    'count = 0',
    'for each edge (vi, vj) of the polygon:',
    '  if ray from test point crosses edge:',
    '    count++',
    'if count is odd: point is INSIDE',
    'else: point is OUTSIDE',
  ],
  inputSchema: {
    type: 'array',
    constraints: { minLength: 2, maxLength: 50, minValue: 0, maxValue: 999 },
  },
};

// Format: [numVertices, x0,y0, x1,y1, ..., testX, testY]
export const defaultInput = [4, 0,0, 4,0, 4,4, 0,4, 2,2];

const SCALE = 60;
const OFFSET_X = 100;
const OFFSET_Y = 40;

function scaleX(x) { return x * SCALE + OFFSET_X; }
function scaleY(y) { return (6 - y) * SCALE + OFFSET_Y; }

export function generateSteps(input) {
  const recorder = new StepRecorder();
  const n = input[0];
  const vertices = [];
  for (let i = 0; i < n; i++) {
    vertices.push({ x: input[1 + 2 * i], y: input[2 + 2 * i] });
  }
  const testPoint = { x: input[1 + 2 * n], y: input[2 + 2 * n] };
  const testIdx = n; // test point gets index n

  function makeNodes(states = {}) {
    const nodes = vertices.map((v, i) => ({
      id: i,
      x: scaleX(v.x),
      y: scaleY(v.y),
      label: `V${i}(${v.x},${v.y})`,
      state: states[i] || 'default',
    }));
    nodes.push({
      id: testIdx,
      x: scaleX(testPoint.x),
      y: scaleY(testPoint.y),
      label: `T(${testPoint.x},${testPoint.y})`,
      state: states[testIdx] || 'highlighted',
    });
    return nodes;
  }

  function makePolygonEdges(highlightEdge = -1, edgeStates = {}) {
    const edges = [];
    for (let i = 0; i < n; i++) {
      const j = (i + 1) % n;
      edges.push({
        from: i,
        to: j,
        state: edgeStates[i] || (i === highlightEdge ? 'current' : 'visited'),
        directed: false,
      });
    }
    return edges;
  }

  function makeSnapshot(states, highlightEdge, edgeStates) {
    return {
      nodes: makeNodes(states),
      edges: makePolygonEdges(highlightEdge, edgeStates),
    };
  }

  // Show polygon and test point
  recorder.add('message', [], -1, `Testing if point (${testPoint.x},${testPoint.y}) is inside the polygon`, makeSnapshot({}, -1, {}));

  let count = 0;
  recorder.add('compute', [], 0, `Initialize crossing count = 0. Casting horizontal ray to the right from test point.`, makeSnapshot({ [testIdx]: 'current' }, -1, {}));

  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    const vi = vertices[i];
    const vj = vertices[j];

    recorder.add('compare', [i, j], 1, `Checking edge V${i}(${vi.x},${vi.y}) - V${j}(${vj.x},${vj.y})`, makeSnapshot({ [i]: 'current', [j]: 'current', [testIdx]: 'current' }, i, {}));

    // Ray casting: check if horizontal ray from testPoint to +infinity crosses edge (vi, vj)
    const minY = Math.min(vi.y, vj.y);
    const maxY = Math.max(vi.y, vj.y);

    if (testPoint.y > minY && testPoint.y <= maxY) {
      // Compute x-intersection of the edge with y = testPoint.y
      const xIntersect = vi.x + (testPoint.y - vi.y) * (vj.x - vi.x) / (vj.y - vi.y);

      if (testPoint.x < xIntersect) {
        count++;
        recorder.add('found', [i, j], 2, `Ray crosses edge V${i}-V${j} at x = ${xIntersect.toFixed(2)}. Count = ${count}`, makeSnapshot({ [i]: 'in-path', [j]: 'in-path', [testIdx]: 'current' }, i, { [i]: 'in-path' }));
      } else {
        recorder.add('message', [], 2, `Edge V${i}-V${j} intersection at x = ${xIntersect.toFixed(2)} is to the left, no crossing. Count = ${count}`, makeSnapshot({ [i]: 'visited', [j]: 'visited', [testIdx]: 'current' }, i, {}));
      }
    } else {
      recorder.add('message', [], 1, `Edge V${i}-V${j}: y range [${minY},${maxY}] does not straddle test y = ${testPoint.y}. Count = ${count}`, makeSnapshot({ [testIdx]: 'current' }, -1, {}));
    }
  }

  const inside = count % 2 === 1;

  recorder.add('compute', [], 4, `Total crossings = ${count}. ${count} is ${count % 2 === 1 ? 'odd' : 'even'}.`, makeSnapshot({ [testIdx]: 'current' }, -1, {}));

  const finalTestState = inside ? 'in-path' : 'default';
  recorder.add('sorted', [], inside ? 4 : 5, `Result: Point (${testPoint.x},${testPoint.y}) is ${inside ? 'INSIDE' : 'OUTSIDE'} the polygon.`, makeSnapshot({ [testIdx]: finalTestState }, -1, {}));

  return recorder.getSteps();
}
