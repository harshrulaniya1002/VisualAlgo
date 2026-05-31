import StepRecorder from '../../engine/StepRecorder';

export const meta = {
  name: 'Bidirectional BFS',
  slug: 'bidirectional-bfs',
  category: 'shortest-paths',
  timeComplexity: { best: 'O(V + E)', average: 'O(b^(d/2))', worst: 'O(V + E)' },
  spaceComplexity: 'O(V)',
  description:
    'Searches simultaneously from the source and the target, alternating between forward and backward BFS. When the two frontiers meet, the shortest path is found. This reduces the search space exponentially compared to unidirectional BFS.',
  rendererType: 'graph',
  graphType: 'undirected',
  pseudocode: [
    'init forward queue from source, backward from target',
    'while both queues not empty:',
    '  expand the smaller frontier',
    '  node = dequeue from chosen queue',
    '  if node visited by other direction:',
    '    path found! reconstruct and return',
  ],
  inputSchema: {
    type: 'array',
    constraints: { minLength: 2, maxLength: 20, minValue: 0, maxValue: 99 },
  },
};

// Format: [numNodes, source, target, from, to, from, to, ...]
export const defaultInput = [8, 0, 7, 0,1, 0,2, 1,3, 2,4, 3,5, 4,5, 5,6, 6,7, 2,3];

function arrangeInCircle(n, cx, cy, r) {
  return Array.from({ length: n }, (_, i) => ({
    x: cx + r * Math.cos(2 * Math.PI * i / n - Math.PI / 2),
    y: cy + r * Math.sin(2 * Math.PI * i / n - Math.PI / 2),
  }));
}

export function generateSteps(input) {
  const recorder = new StepRecorder();
  const numNodes = input[0];
  const source = input[1];
  const target = input[2];
  const positions = arrangeInCircle(numNodes, 300, 200, 150);

  const edgeList = [];
  const adj = Array.from({ length: numNodes }, () => []);
  for (let i = 3; i < input.length; i += 2) {
    const u = input[i], v = input[i + 1];
    edgeList.push({ from: u, to: v, state: 'default', directed: false });
    adj[u].push(v);
    adj[v].push(u);
  }

  // 0 = unvisited, 1 = forward, 2 = backward
  const visitedBy = new Array(numNodes).fill(0);
  const parentFwd = new Array(numNodes).fill(-1);
  const parentBwd = new Array(numNodes).fill(-1);
  const edgeStates = edgeList.map(e => ({ ...e }));

  function makeSnapshot(current) {
    return {
      nodes: Array.from({ length: numNodes }, (_, i) => ({
        id: i, x: positions[i].x, y: positions[i].y, label: String(i),
        state: i === current ? 'current' : visitedBy[i] === 1 ? 'visited' : visitedBy[i] === 2 ? 'in-path' : 'default',
      })),
      edges: edgeStates.map(e => ({ ...e })),
    };
  }

  recorder.add('message', [], -1, `Bidirectional BFS from node ${source} to node ${target}`, makeSnapshot(-1));

  if (source === target) {
    recorder.add('message', [], -1, 'Source equals target. Path length = 0.', makeSnapshot(source));
    return recorder.getSteps();
  }

  const fwdQueue = [source];
  const bwdQueue = [target];
  visitedBy[source] = 1;
  visitedBy[target] = 2;

  recorder.add('visit', [source], 0, `Forward: enqueue source ${source}`, makeSnapshot(source));
  recorder.add('visit', [target], 0, `Backward: enqueue target ${target}`, makeSnapshot(target));

  let meetNode = -1;

  while (fwdQueue.length > 0 && bwdQueue.length > 0 && meetNode === -1) {
    // Expand forward
    recorder.add('message', [], 2, 'Expanding forward frontier', makeSnapshot(-1));
    const fwdSize = fwdQueue.length;
    for (let i = 0; i < fwdSize && meetNode === -1; i++) {
      const node = fwdQueue.shift();
      recorder.add('visit', [node], 3, `Forward: dequeue node ${node}`, makeSnapshot(node));

      for (const neighbor of adj[node]) {
        const edgeIdx = edgeStates.findIndex(
          e => (e.from === node && e.to === neighbor) || (e.from === neighbor && e.to === node)
        );

        if (visitedBy[neighbor] === 2) {
          meetNode = neighbor;
          parentFwd[neighbor] = node;
          if (edgeIdx !== -1) edgeStates[edgeIdx].state = 'in-path';
          recorder.add('message', [], 4, `Forward meets backward at node ${neighbor}!`, makeSnapshot(neighbor));
          break;
        }
        if (visitedBy[neighbor] === 0) {
          visitedBy[neighbor] = 1;
          parentFwd[neighbor] = node;
          fwdQueue.push(neighbor);
          if (edgeIdx !== -1) edgeStates[edgeIdx].state = 'visited';
          recorder.add('visit', [neighbor], 5, `Forward: visit ${neighbor}`, makeSnapshot(neighbor));
        }
      }
    }

    if (meetNode !== -1) break;

    // Expand backward
    recorder.add('message', [], 2, 'Expanding backward frontier', makeSnapshot(-1));
    const bwdSize = bwdQueue.length;
    for (let i = 0; i < bwdSize && meetNode === -1; i++) {
      const node = bwdQueue.shift();
      recorder.add('visit', [node], 3, `Backward: dequeue node ${node}`, makeSnapshot(node));

      for (const neighbor of adj[node]) {
        const edgeIdx = edgeStates.findIndex(
          e => (e.from === node && e.to === neighbor) || (e.from === neighbor && e.to === node)
        );

        if (visitedBy[neighbor] === 1) {
          meetNode = neighbor;
          parentBwd[neighbor] = node;
          if (edgeIdx !== -1) edgeStates[edgeIdx].state = 'in-path';
          recorder.add('message', [], 4, `Backward meets forward at node ${neighbor}!`, makeSnapshot(neighbor));
          break;
        }
        if (visitedBy[neighbor] === 0) {
          visitedBy[neighbor] = 2;
          parentBwd[neighbor] = node;
          bwdQueue.push(neighbor);
          if (edgeIdx !== -1) edgeStates[edgeIdx].state = 'visited';
          recorder.add('visit', [neighbor], 5, `Backward: visit ${neighbor}`, makeSnapshot(neighbor));
        }
      }
    }
  }

  if (meetNode !== -1) {
    // Reconstruct path
    const fwdPath = [];
    let cur = meetNode;
    while (cur !== -1 && cur !== source) {
      fwdPath.unshift(cur);
      cur = parentFwd[cur];
    }
    fwdPath.unshift(source);

    const bwdPath = [];
    cur = parentBwd[meetNode];
    while (cur !== -1 && cur !== target) {
      bwdPath.push(cur);
      cur = parentBwd[cur];
    }
    if (meetNode !== target) bwdPath.push(target);

    const fullPath = [...fwdPath, ...bwdPath];
    recorder.add('message', [], -1, `Path found: [${fullPath.join(' -> ')}], length = ${fullPath.length - 1}`, makeSnapshot(meetNode));
  } else {
    recorder.add('message', [], -1, 'No path exists between source and target.', makeSnapshot(-1));
  }

  return recorder.getSteps();
}
