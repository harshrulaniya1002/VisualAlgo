import StepRecorder from '../../engine/StepRecorder';

export const meta = {
  name: 'Closest Pair of Points',
  slug: 'closest-pair-of-points',
  category: 'divide-conquer',
  timeComplexity: {
    best: 'O(n log n)',
    average: 'O(n log n)',
    worst: 'O(n log n)',
  },
  spaceComplexity: 'O(n)',
  description:
    'Find the closest pair of points in 2D using Divide & Conquer. Sort points by x-coordinate, divide into two halves, find the closest pair in each half recursively, then check the strip around the dividing line for closer cross-half pairs.',
  rendererType: 'bar',
  pseudocode: [
    'Sort points by x-coordinate',
    'closestPair(points, l, r)',
    '  if r - l <= 3: brute force',
    '  mid = (l + r) / 2',
    '  dL = closestPair(points, l, mid)',
    '  dR = closestPair(points, mid+1, r)',
    '  d = min(dL, dR)',
    '  Build strip of points within d of midline',
    '  Check strip for closer pairs',
    '  return min(d, stripClosest)',
  ],
  inputSchema: {
    type: 'array',
    constraints: {
      minLength: 2,
      maxLength: 50,
      minValue: 0,
      maxValue: 999,
    },
  },
};

// Pairs of (x, y): (2,3), (12,30), (40,50), (5,1), (12,10), (3,4)
export const defaultInput = [2, 3, 12, 30, 40, 50, 5, 1, 12, 10, 3, 4];

export function generateSteps(input) {
  const recorder = new StepRecorder();
  const raw = [...input];

  // Parse pairs of (x, y) from flat array
  const points = [];
  for (let i = 0; i < raw.length - 1; i += 2) {
    points.push({ x: raw[i], y: raw[i + 1], originalIndex: i / 2 });
  }
  const numPoints = points.length;

  // We visualize using the x-coordinates as bar heights for the bar renderer.
  // Build a snapshot from current point order.
  function snapshot() {
    return points.map((p) => p.x);
  }

  function dist(a, b) {
    return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
  }

  recorder.add(
    'message',
    [],
    -1,
    `Closest Pair of Points: ${numPoints} points — ${points.map((p) => `(${p.x},${p.y})`).join(', ')}`,
    snapshot(),
    { points: points.map((p) => ({ x: p.x, y: p.y })) }
  );

  // Step 1: Sort by x-coordinate
  points.sort((a, b) => a.x - b.x || a.y - b.y);

  recorder.add(
    'compute',
    Array.from({ length: numPoints }, (_, i) => i),
    0,
    `Sorted points by x-coordinate: ${points.map((p) => `(${p.x},${p.y})`).join(', ')}`,
    snapshot(),
    {}
  );

  function bruteForce(l, r) {
    let minDist = Infinity;
    let bestPair = [l, l + 1];

    for (let i = l; i <= r; i++) {
      for (let j = i + 1; j <= r; j++) {
        const d = dist(points[i], points[j]);
        recorder.add(
          'compare',
          [i, j],
          2,
          `Brute force: dist((${points[i].x},${points[i].y}), (${points[j].x},${points[j].y})) = ${d.toFixed(2)}`,
          snapshot(),
          { distance: d }
        );

        if (d < minDist) {
          minDist = d;
          bestPair = [i, j];
        }
      }
    }

    recorder.add(
      'highlight',
      bestPair,
      2,
      `Closest pair in [${l}..${r}]: (${points[bestPair[0]].x},${points[bestPair[0]].y}) and (${points[bestPair[1]].x},${points[bestPair[1]].y}), distance = ${minDist.toFixed(2)}`,
      snapshot(),
      { minDist }
    );

    return { minDist, pair: bestPair };
  }

  function closestPair(l, r, depth) {
    const size = r - l + 1;

    if (size <= 3) {
      recorder.add(
        'message',
        Array.from({ length: size }, (_, i) => l + i),
        2,
        `Base case: ${size} points in [${l}..${r}], use brute force`,
        snapshot(),
        { depth }
      );
      return bruteForce(l, r);
    }

    const mid = Math.floor((l + r) / 2);
    const midX = points[mid].x;

    // DIVIDE
    recorder.add(
      'divide',
      Array.from({ length: size }, (_, i) => l + i),
      3,
      `DIVIDE: Split [${l}..${r}] at midpoint index ${mid} (x = ${midX}) into [${l}..${mid}] and [${mid + 1}..${r}]`,
      snapshot(),
      { l, mid, r, midX, depth, phase: 'divide' }
    );

    // CONQUER left
    recorder.add(
      'message',
      Array.from({ length: mid - l + 1 }, (_, i) => l + i),
      4,
      `CONQUER: Find closest pair in left half [${l}..${mid}]`,
      snapshot(),
      { depth: depth + 1, phase: 'conquer' }
    );
    const leftResult = closestPair(l, mid, depth + 1);

    // CONQUER right
    recorder.add(
      'message',
      Array.from({ length: r - mid }, (_, i) => mid + 1 + i),
      5,
      `CONQUER: Find closest pair in right half [${mid + 1}..${r}]`,
      snapshot(),
      { depth: depth + 1, phase: 'conquer' }
    );
    const rightResult = closestPair(mid + 1, r, depth + 1);

    // COMBINE
    let d = Math.min(leftResult.minDist, rightResult.minDist);
    let bestPair = leftResult.minDist <= rightResult.minDist ? leftResult.pair : rightResult.pair;

    recorder.add(
      'compute',
      [bestPair[0], bestPair[1]],
      6,
      `COMBINE: d = min(dL=${leftResult.minDist.toFixed(2)}, dR=${rightResult.minDist.toFixed(2)}) = ${d.toFixed(2)}`,
      snapshot(),
      { d, depth, phase: 'combine' }
    );

    // Build strip
    const strip = [];
    for (let i = l; i <= r; i++) {
      if (Math.abs(points[i].x - midX) < d) {
        strip.push(i);
      }
    }

    recorder.add(
      'highlight',
      strip,
      7,
      `Strip: ${strip.length} points within distance ${d.toFixed(2)} of midline x = ${midX}`,
      snapshot(),
      { strip, d, midX, depth }
    );

    // Sort strip by y-coordinate (indices)
    strip.sort((a, b) => points[a].y - points[b].y);

    // Check strip for closer pairs
    for (let i = 0; i < strip.length; i++) {
      for (let j = i + 1; j < strip.length && (points[strip[j]].y - points[strip[i]].y) < d; j++) {
        const pairDist = dist(points[strip[i]], points[strip[j]]);

        recorder.add(
          'compare',
          [strip[i], strip[j]],
          8,
          `Strip check: dist((${points[strip[i]].x},${points[strip[i]].y}), (${points[strip[j]].x},${points[strip[j]].y})) = ${pairDist.toFixed(2)}`,
          snapshot(),
          { pairDist, d }
        );

        if (pairDist < d) {
          d = pairDist;
          bestPair = [strip[i], strip[j]];

          recorder.add(
            'compute',
            [strip[i], strip[j]],
            9,
            `New closest pair found in strip! d = ${d.toFixed(2)}`,
            snapshot(),
            { d }
          );
        }
      }
    }

    recorder.add(
      'message',
      [bestPair[0], bestPair[1]],
      9,
      `Result for [${l}..${r}]: closest pair (${points[bestPair[0]].x},${points[bestPair[0]].y}) and (${points[bestPair[1]].x},${points[bestPair[1]].y}), distance = ${d.toFixed(2)}`,
      snapshot(),
      { d, depth }
    );

    return { minDist: d, pair: bestPair };
  }

  const result = closestPair(0, numPoints - 1, 0);

  recorder.add(
    'sorted',
    [result.pair[0], result.pair[1]],
    -1,
    `Closest Pair of Points complete! Closest pair: (${points[result.pair[0]].x},${points[result.pair[0]].y}) and (${points[result.pair[1]].x},${points[result.pair[1]].y}), distance = ${result.minDist.toFixed(2)}`,
    snapshot(),
    { result: result.minDist }
  );

  return recorder.getSteps();
}
