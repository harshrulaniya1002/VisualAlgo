import StepRecorder from '../../engine/StepRecorder';

export const meta = {
  name: 'Polygon Area - Shoelace Formula',
  slug: 'polygon-area-shoelace',
  category: 'computational-geometry',
  timeComplexity: { best: 'O(n)', average: 'O(n)', worst: 'O(n)' },
  spaceComplexity: 'O(1)',
  description:
    'Computes the area of a simple polygon using the Shoelace formula. For each pair of consecutive vertices, it computes a cross product term (x_i * y_{i+1} - x_{i+1} * y_i), sums all terms, and takes half the absolute value to get the area.',
  rendererType: 'graph',
  pseudocode: [
    'sum = 0',
    'for i = 0 to n-1:',
    '  j = (i + 1) % n',
    '  sum += x[i] * y[j] - x[j] * y[i]',
    'area = |sum| / 2',
    'return area',
  ],
  inputSchema: {
    type: 'array',
    constraints: { minLength: 2, maxLength: 50, minValue: 0, maxValue: 999 },
  },
};

// Format: [numVertices, x0,y0, x1,y1, ...] (vertices in order)
export const defaultInput = [5, 1,1, 4,1, 5,3, 3,5, 0,4];

const SCALE = 60;
const OFFSET_X = 80;
const OFFSET_Y = 30;

function scaleX(x) { return x * SCALE + OFFSET_X; }
function scaleY(y) { return (7 - y) * SCALE + OFFSET_Y; }

export function generateSteps(input) {
  const recorder = new StepRecorder();
  const n = input[0];
  const vertices = [];
  for (let i = 0; i < n; i++) {
    vertices.push({ x: input[1 + 2 * i], y: input[2 + 2 * i] });
  }

  function makeNodes(states = {}) {
    return vertices.map((v, i) => ({
      id: i,
      x: scaleX(v.x),
      y: scaleY(v.y),
      label: `V${i}(${v.x},${v.y})`,
      state: states[i] || 'default',
    }));
  }

  function makePolygonEdges(highlightEdge = -1) {
    const edges = [];
    for (let i = 0; i < n; i++) {
      const j = (i + 1) % n;
      edges.push({
        from: i,
        to: j,
        state: i === highlightEdge ? 'in-path' : 'visited',
        directed: false,
      });
    }
    return edges;
  }

  function makeSnapshot(states, highlightEdge) {
    return {
      nodes: makeNodes(states),
      edges: makePolygonEdges(highlightEdge),
    };
  }

  // Show polygon
  recorder.add('message', [], -1, `Computing area of polygon with ${n} vertices using the Shoelace formula`, makeSnapshot({}, -1));

  let sum = 0;

  recorder.add('compute', [], 0, `Initialize sum = 0`, makeSnapshot({}, -1));

  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    const crossTerm = vertices[i].x * vertices[j].y - vertices[j].x * vertices[i].y;
    sum += crossTerm;

    recorder.add('compute', [i, j], 3,
      `Edge V${i}-V${j}: (${vertices[i].x} * ${vertices[j].y}) - (${vertices[j].x} * ${vertices[i].y}) = ${crossTerm}. Running sum = ${sum}`,
      makeSnapshot({ [i]: 'current', [j]: 'current' }, i));
  }

  const area = Math.abs(sum) / 2;

  recorder.add('compute', [], 4, `|sum| / 2 = |${sum}| / 2 = ${area}`, makeSnapshot({}, -1));

  // Final result
  const finalStates = {};
  for (let i = 0; i < n; i++) finalStates[i] = 'in-path';

  recorder.add('sorted', [], 5, `Polygon area = ${area} square units`, makeSnapshot(finalStates, -1));

  return recorder.getSteps();
}
