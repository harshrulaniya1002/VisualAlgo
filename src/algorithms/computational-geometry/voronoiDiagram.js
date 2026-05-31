import StepRecorder from '../../engine/StepRecorder';

export const meta = {
  name: 'Voronoi Diagram',
  slug: 'voronoi-diagram',
  category: 'computational-geometry',
  timeComplexity: { best: 'O(n log n)', average: 'O(n log n)', worst: 'O(n log n)' },
  spaceComplexity: 'O(n)',
  description:
    'Constructs a Voronoi diagram partitioning the plane into regions closest to each site. This simplified visualization uses a sweep-based approach, processing site events and computing Voronoi edges from the perpendicular bisectors of Delaunay triangulation edges.',
  rendererType: 'graph',
  pseudocode: [
    'sort sites by y-coordinate (sweep top to bottom)',
    'for each site event:',
    '  process new site, update beach line',
    'for each circle event:',
    '  compute Voronoi vertex, add edges',
    'compute Voronoi edges from Delaunay neighbors',
    'output Voronoi diagram edges',
  ],
  inputSchema: {
    type: 'array',
    constraints: { minLength: 2, maxLength: 50, minValue: 0, maxValue: 999 },
  },
};

// Format: [numSites, x0,y0, x1,y1, ...]
export const defaultInput = [5, 2,5, 5,2, 8,5, 3,8, 7,8];

const SCALE = 40;
const OFFSET_X = 50;
const OFFSET_Y = 20;
const VIEW_MAX = 12;

function scaleX(x) { return x * SCALE + OFFSET_X; }
function scaleY(y) { return (VIEW_MAX - y) * SCALE + OFFSET_Y; }

function dist(a, b) {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
}

function circumcenter(a, b, c) {
  const ax = a.x, ay = a.y, bx = b.x, by = b.y, cx = c.x, cy = c.y;
  const D = 2 * (ax * (by - cy) + bx * (cy - ay) + cx * (ay - by));
  if (Math.abs(D) < 1e-9) return null;
  const ux = ((ax * ax + ay * ay) * (by - cy) + (bx * bx + by * by) * (cy - ay) + (cx * cx + cy * cy) * (ay - by)) / D;
  const uy = ((ax * ax + ay * ay) * (cx - bx) + (bx * bx + by * by) * (ax - cx) + (cx * cx + cy * cy) * (bx - ax)) / D;
  return { x: ux, y: uy };
}

// Simplified Delaunay: find triangles by checking all triples
function computeDelaunay(sites) {
  const n = sites.length;
  const triangles = [];

  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      for (let k = j + 1; k < n; k++) {
        const cc = circumcenter(sites[i], sites[j], sites[k]);
        if (!cc) continue;
        const r = dist(cc, sites[i]);
        let valid = true;
        for (let l = 0; l < n; l++) {
          if (l === i || l === j || l === k) continue;
          if (dist(cc, sites[l]) < r - 1e-9) {
            valid = false;
            break;
          }
        }
        if (valid) {
          triangles.push([i, j, k]);
        }
      }
    }
  }
  return triangles;
}

export function generateSteps(input) {
  const recorder = new StepRecorder();
  const n = input[0];
  const sites = [];
  for (let i = 0; i < n; i++) {
    sites.push({ x: input[1 + 2 * i], y: input[2 + 2 * i] });
  }

  function makeSiteNodes(states = {}) {
    return sites.map((s, i) => ({
      id: i,
      x: scaleX(s.x),
      y: scaleY(s.y),
      label: `S${i}(${s.x},${s.y})`,
      state: states[i] || 'default',
    }));
  }

  function makeSnapshot(nodeStates, extraNodes = [], edges = []) {
    return {
      nodes: [...makeSiteNodes(nodeStates), ...extraNodes],
      edges: edges.map(e => ({ ...e })),
    };
  }

  // Step 1: Show all sites
  recorder.add('message', [], -1, `Starting Voronoi diagram construction with ${n} sites`, makeSnapshot({}));

  // Step 2: Sort by y-coordinate (sweep direction)
  const sorted = sites.map((s, i) => ({ ...s, idx: i })).sort((a, b) => a.y - b.y || a.x - b.x);

  recorder.add('compute', [], 0, `Sites sorted by y-coordinate for sweep processing`, makeSnapshot({}));

  // Step 3: Process each site as a site event
  for (let i = 0; i < sorted.length; i++) {
    const s = sorted[i];
    const states = {};
    for (let j = 0; j <= i; j++) states[sorted[j].idx] = 'visited';
    states[s.idx] = 'current';

    recorder.add('visit', [s.idx], 1, `Site event: processing site S${s.idx} at (${s.x}, ${s.y})`, makeSnapshot(states));
  }

  // Step 4: Compute Delaunay triangulation
  recorder.add('compute', [], 2, `Computing Delaunay triangulation to derive Voronoi edges`, makeSnapshot(Object.fromEntries(sites.map((_, i) => [i, 'visited']))));

  const triangles = computeDelaunay(sites);

  // Show Delaunay edges
  const delaunayEdgeSet = new Set();
  const delaunayEdges = [];
  for (const [a, b, c] of triangles) {
    for (const [u, v] of [[a, b], [b, c], [a, c]]) {
      const key = Math.min(u, v) + ',' + Math.max(u, v);
      if (!delaunayEdgeSet.has(key)) {
        delaunayEdgeSet.add(key);
        delaunayEdges.push({ from: u, to: v, state: 'default', directed: false });
      }
    }
  }

  recorder.add('compute', [], 2, `Found ${triangles.length} Delaunay triangles and ${delaunayEdges.length} edges`, makeSnapshot(Object.fromEntries(sites.map((_, i) => [i, 'visited'])), [], delaunayEdges));

  // Step 5: Compute Voronoi edges from Delaunay dual
  const voronoiVertices = [];
  const voronoiEdges = [];
  const triCenters = [];

  for (const [a, b, c] of triangles) {
    const cc = circumcenter(sites[a], sites[b], sites[c]);
    if (cc) {
      triCenters.push(cc);
    } else {
      triCenters.push(null);
    }
  }

  // For each pair of triangles sharing an edge, connect their circumcenters
  for (let i = 0; i < triangles.length; i++) {
    for (let j = i + 1; j < triangles.length; j++) {
      if (!triCenters[i] || !triCenters[j]) continue;

      // Count shared vertices
      const shared = triangles[i].filter(v => triangles[j].includes(v));
      if (shared.length === 2) {
        const vId1 = n + voronoiVertices.length;
        let idx1 = voronoiVertices.findIndex(v => Math.abs(v.x - triCenters[i].x) < 1e-6 && Math.abs(v.y - triCenters[i].y) < 1e-6);
        if (idx1 === -1) {
          voronoiVertices.push(triCenters[i]);
          idx1 = voronoiVertices.length - 1;
        }
        let idx2 = voronoiVertices.findIndex(v => Math.abs(v.x - triCenters[j].x) < 1e-6 && Math.abs(v.y - triCenters[j].y) < 1e-6);
        if (idx2 === -1) {
          voronoiVertices.push(triCenters[j]);
          idx2 = voronoiVertices.length - 1;
        }

        voronoiEdges.push({ fromIdx: idx1, toIdx: idx2, between: shared });
      }
    }
  }

  // Show Voronoi vertices being computed
  const vvNodes = voronoiVertices.map((v, i) => ({
    id: n + i,
    x: scaleX(v.x),
    y: scaleY(v.y),
    label: `V${i}`,
    state: 'highlighted',
  }));

  recorder.add('compute', [], 3, `Computed ${voronoiVertices.length} Voronoi vertices (circumcenters of Delaunay triangles)`, makeSnapshot(Object.fromEntries(sites.map((_, i) => [i, 'visited'])), vvNodes, delaunayEdges));

  // Show Voronoi edges step by step
  const vorEdgeObjs = [];
  for (let i = 0; i < voronoiEdges.length; i++) {
    const ve = voronoiEdges[i];
    const edgeObj = {
      from: n + ve.fromIdx,
      to: n + ve.toIdx,
      state: 'in-path',
      directed: false,
      label: 'Vor',
    };
    vorEdgeObjs.push(edgeObj);

    recorder.add('visit', [ve.between[0], ve.between[1]], 4, `Voronoi edge between regions of S${ve.between[0]} and S${ve.between[1]}`, makeSnapshot(
      { [ve.between[0]]: 'current', [ve.between[1]]: 'current' },
      vvNodes,
      [...delaunayEdges.map(e => ({ ...e, state: 'default' })), ...vorEdgeObjs.map(e => ({ ...e }))],
    ));
  }

  // Final diagram
  const finalSiteStates = Object.fromEntries(sites.map((_, i) => [i, 'in-path']));
  const finalVVNodes = voronoiVertices.map((v, i) => ({
    id: n + i,
    x: scaleX(v.x),
    y: scaleY(v.y),
    label: `V${i}`,
    state: 'highlighted',
  }));

  recorder.add('sorted', [], 5, `Voronoi diagram complete. ${voronoiVertices.length} vertices, ${voronoiEdges.length} edges.`, makeSnapshot(finalSiteStates, finalVVNodes, vorEdgeObjs));

  return recorder.getSteps();
}
