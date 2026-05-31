import StepRecorder from '../../engine/StepRecorder';

export const meta = {
  name: 'Closest Pair of Points',
  slug: 'closest-pair-geometric',
  category: 'computational-geometry',
  timeComplexity: { best: 'O(n log n)', average: 'O(n log n)', worst: 'O(n log n)' },
  spaceComplexity: 'O(n)',
  description:
    'Finds the closest pair of points in 2D using a divide-and-conquer approach. Sort points by x-coordinate, recursively find the closest pair in each half, then check the strip around the dividing line for closer cross-half pairs.',
  rendererType: 'graph',
  pseudocode: [
    'sort points by x-coordinate',
    'recursively find closest pair in left half',
    'recursively find closest pair in right half',
    'd = min(left_min, right_min)',
    'build strip of points within d of midline',
    'sort strip by y, check each point against next 7',
    'return overall minimum distance',
  ],
  inputSchema: {
    type: 'array',
    constraints: { minLength: 2, maxLength: 50, minValue: 0, maxValue: 999 },
  },
};

// Format: [numPoints, x0,y0, x1,y1, ...]
export const defaultInput = [8, 2,3, 12,30, 40,50, 5,1, 12,10, 3,4, 7,7, 20,20];

function computeScale(points) {
  let maxX = 0, maxY = 0;
  for (const p of points) {
    if (p.x > maxX) maxX = p.x;
    if (p.y > maxY) maxY = p.y;
  }
  const sx = maxX > 0 ? 500 / (maxX + 2) : 40;
  const sy = maxY > 0 ? 350 / (maxY + 2) : 40;
  return { sx: Math.min(sx, 50), sy: Math.min(sy, 50), maxY: maxY + 2 };
}

export function generateSteps(input) {
  const recorder = new StepRecorder();
  const n = input[0];
  const points = [];
  for (let i = 0; i < n; i++) {
    points.push({ x: input[1 + 2 * i], y: input[2 + 2 * i], origIdx: i });
  }

  const { sx, sy, maxY } = computeScale(points);
  const OX = 50;
  const OY = 20;

  function toScreenX(x) { return x * sx + OX; }
  function toScreenY(y) { return (maxY - y) * sy + OY; }

  function makeNodes(pts, states = {}) {
    return pts.map((p, i) => ({
      id: i,
      x: toScreenX(p.x),
      y: toScreenY(p.y),
      label: `(${p.x},${p.y})`,
      state: states[i] || 'default',
    }));
  }

  function makeSnapshot(pts, states, edgesList) {
    return {
      nodes: makeNodes(pts, states),
      edges: edgesList.map(e => ({ ...e })),
    };
  }

  function dist(a, b) {
    return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
  }

  // Show initial points
  recorder.add('message', [], -1, `Starting Closest Pair with ${n} points`, makeSnapshot(points, {}, []));

  // Sort by x-coordinate
  const sorted = [...points].sort((a, b) => a.x - b.x || a.y - b.y);

  recorder.add('compute', [], 0, `Sorted points by x-coordinate`, makeSnapshot(sorted, {}, []));

  // Since a full recursive visualization gets very complex, we do an iterative
  // approach showing the key concepts: divide, check halves, check strip

  let bestDist = Infinity;
  let bestI = -1, bestJ = -1;

  // Brute force for small n, but show the divide-and-conquer concept
  const mid = Math.floor(n / 2);
  const midX = sorted[mid].x;

  // Show the division
  const leftStates = {};
  const rightStates = {};
  for (let i = 0; i < mid; i++) leftStates[i] = 'visited';
  for (let i = mid; i < n; i++) rightStates[i] = 'highlighted';

  recorder.add('compute', [mid], 1, `Divide at midpoint x = ${midX}. Left: ${mid} points, Right: ${n - mid} points`, makeSnapshot(sorted, { ...leftStates, ...rightStates }, []));

  // Find closest in left half
  let leftMin = Infinity, leftI = -1, leftJ = -1;
  for (let i = 0; i < mid; i++) {
    for (let j = i + 1; j < mid; j++) {
      const d = dist(sorted[i], sorted[j]);
      if (d < leftMin) {
        leftMin = d;
        leftI = i;
        leftJ = j;
      }
    }
  }

  if (leftI >= 0) {
    recorder.add('compare', [leftI, leftJ], 1, `Closest pair in left half: (${sorted[leftI].x},${sorted[leftI].y}) and (${sorted[leftJ].x},${sorted[leftJ].y}), dist = ${leftMin.toFixed(2)}`, makeSnapshot(sorted, { [leftI]: 'current', [leftJ]: 'current' }, [
      { from: leftI, to: leftJ, state: 'visited', directed: false, label: leftMin.toFixed(2) },
    ]));
  }

  // Find closest in right half
  let rightMin = Infinity, rightI = -1, rightJ = -1;
  for (let i = mid; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      const d = dist(sorted[i], sorted[j]);
      if (d < rightMin) {
        rightMin = d;
        rightI = i;
        rightJ = j;
      }
    }
  }

  if (rightI >= 0) {
    recorder.add('compare', [rightI, rightJ], 2, `Closest pair in right half: (${sorted[rightI].x},${sorted[rightI].y}) and (${sorted[rightJ].x},${sorted[rightJ].y}), dist = ${rightMin.toFixed(2)}`, makeSnapshot(sorted, { [rightI]: 'current', [rightJ]: 'current' }, [
      { from: rightI, to: rightJ, state: 'visited', directed: false, label: rightMin.toFixed(2) },
    ]));
  }

  let d = Math.min(leftMin, rightMin);
  if (leftMin <= rightMin && leftI >= 0) { bestDist = leftMin; bestI = leftI; bestJ = leftJ; }
  if (rightMin < leftMin && rightI >= 0) { bestDist = rightMin; bestI = rightI; bestJ = rightJ; }

  recorder.add('compute', [], 3, `d = min(${leftMin.toFixed(2)}, ${rightMin.toFixed(2)}) = ${d.toFixed(2)}`, makeSnapshot(sorted, {}, bestI >= 0 ? [{ from: bestI, to: bestJ, state: 'visited', directed: false, label: d.toFixed(2) }] : []));

  // Build strip
  const strip = [];
  const stripStates = {};
  for (let i = 0; i < n; i++) {
    if (Math.abs(sorted[i].x - midX) < d) {
      strip.push({ ...sorted[i], sortedIdx: i });
      stripStates[i] = 'highlighted';
    }
  }

  recorder.add('compute', [], 4, `Strip: ${strip.length} points within distance ${d.toFixed(2)} of midline x = ${midX}`, makeSnapshot(sorted, stripStates, bestI >= 0 ? [{ from: bestI, to: bestJ, state: 'visited', directed: false, label: d.toFixed(2) }] : []));

  // Sort strip by y
  strip.sort((a, b) => a.y - b.y);

  // Check strip pairs
  for (let i = 0; i < strip.length; i++) {
    for (let j = i + 1; j < strip.length && (strip[j].y - strip[i].y) < d; j++) {
      const dd = dist(strip[i], strip[j]);
      const si = strip[i].sortedIdx;
      const sj = strip[j].sortedIdx;

      recorder.add('compare', [si, sj], 5, `Strip check: (${strip[i].x},${strip[i].y}) and (${strip[j].x},${strip[j].y}), dist = ${dd.toFixed(2)}`, makeSnapshot(sorted, { [si]: 'current', [sj]: 'current', ...stripStates }, [{ from: si, to: sj, state: 'highlighted', directed: false, label: dd.toFixed(2) }]));

      if (dd < bestDist) {
        bestDist = dd;
        bestI = si;
        bestJ = sj;
        d = dd;
        recorder.add('found', [si, sj], 5, `New closest pair found in strip! dist = ${dd.toFixed(2)}`, makeSnapshot(sorted, { [si]: 'in-path', [sj]: 'in-path' }, [{ from: si, to: sj, state: 'in-path', directed: false, label: dd.toFixed(2) }]));
      }
    }
  }

  // Final result
  const finalEdges = bestI >= 0 ? [{ from: bestI, to: bestJ, state: 'in-path', directed: false, label: bestDist.toFixed(2) }] : [];
  const finalStates = bestI >= 0 ? { [bestI]: 'in-path', [bestJ]: 'in-path' } : {};

  recorder.add('sorted', [], 6, `Closest pair: (${sorted[bestI].x},${sorted[bestI].y}) and (${sorted[bestJ].x},${sorted[bestJ].y}), distance = ${bestDist.toFixed(2)}`, makeSnapshot(sorted, finalStates, finalEdges));

  return recorder.getSteps();
}
