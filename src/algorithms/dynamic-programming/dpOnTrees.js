import StepRecorder from '../../engine/StepRecorder';

export const meta = {
  name: 'DP on Trees',
  slug: 'dp-on-trees',
  category: 'dynamic-programming',
  timeComplexity: { best: 'O(n)', average: 'O(n)', worst: 'O(n)' },
  spaceComplexity: 'O(n)',
  description:
    'Computes the maximum independent set on a tree (max sum of node values where no two adjacent nodes are selected). Input: [n, val0, val1, ..., parent1, parent2, ...] where parent_i is the parent of node i (node 0 is root).',
  rendererType: 'bar',
  pseudocode: [
    'DFS from root (post-order)',
    'dp[v][0] = sum of max(dp[child][0], dp[child][1])',
    'dp[v][1] = val[v] + sum of dp[child][0]',
    'answer = max(dp[root][0], dp[root][1])',
  ],
  inputSchema: {
    type: 'array',
    constraints: { minLength: 2, maxLength: 20, minValue: 0, maxValue: 50 },
  },
};

// 6 nodes: [n, val0..val5, parent1..parent5]
// Tree: 0->{1,2}, 1->{3,4}, 2->{5}
export const defaultInput = [6, 10, 5, 8, 3, 7, 2, 0, 0, 1, 1, 2];

export function generateSteps(input) {
  const recorder = new StepRecorder();
  const n = input[0];
  const vals = input.slice(1, 1 + n);
  const parents = input.slice(1 + n);

  // Build adjacency list
  const children = Array.from({ length: n }, () => []);
  for (let i = 0; i < parents.length; i++) {
    children[parents[i]].push(i + 1);
  }

  // dp[v][0] = max sum excluding v, dp[v][1] = max sum including v
  const dpExclude = new Array(n).fill(0);
  const dpInclude = new Array(n).fill(0);

  // Show the values as the bar chart
  recorder.add('message', [], 0, `DP on Trees: Max Independent Set. Values = [${vals}]`, [...vals], {});

  // Post-order DFS
  const order = [];
  const stack = [0];
  const visited = new Set();
  const dfsStack = [[0, false]];

  while (dfsStack.length > 0) {
    const [node, processed] = dfsStack.pop();
    if (processed) {
      order.push(node);
      continue;
    }
    dfsStack.push([node, true]);
    for (let i = children[node].length - 1; i >= 0; i--) {
      dfsStack.push([children[node][i], false]);
    }
  }

  // Visualize dp values: show dpInclude as bar heights
  const vizArr = new Array(n).fill(0);

  for (const v of order) {
    recorder.add('compute', [v], 0, `Processing node ${v} (value=${vals[v]}, children=[${children[v]}])`, [...vizArr], {});

    let sumExclude = 0;
    let sumInclude = vals[v];

    for (const child of children[v]) {
      sumExclude += Math.max(dpExclude[child], dpInclude[child]);
      sumInclude += dpExclude[child];
    }

    dpExclude[v] = sumExclude;
    dpInclude[v] = sumInclude;
    vizArr[v] = Math.max(dpExclude[v], dpInclude[v]);

    recorder.add('compute', [v], 1, `Node ${v}: exclude=${dpExclude[v]}, include=${dpInclude[v]}, best=${vizArr[v]}`, [...vizArr], {});
    recorder.add('sorted', [v], 2, `dp[${v}] finalized: best = ${vizArr[v]}`, [...vizArr], {});
  }

  const answer = Math.max(dpExclude[0], dpInclude[0]);
  recorder.add('message', [], 3, `Maximum Independent Set value = ${answer}`, [...vizArr], {});

  return recorder.getSteps();
}
