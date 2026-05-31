/**
 * Create an adjacency list from a list of edges.
 *
 * @param {Array<[number, number, number?]>} edges - Array of [u, v] or [u, v, weight] tuples.
 * @param {boolean} directed - Whether the graph is directed (default false).
 * @returns {Map<number, Array<{ node: number, weight: number }>>} Adjacency list.
 */
export function createAdjacencyList(edges, directed = false) {
  const adj = new Map();

  function ensureNode(n) {
    if (!adj.has(n)) adj.set(n, []);
  }

  for (const edge of edges) {
    const [u, v, w = 1] = edge;
    ensureNode(u);
    ensureNode(v);
    adj.get(u).push({ node: v, weight: w });
    if (!directed) {
      adj.get(v).push({ node: u, weight: w });
    }
  }

  return adj;
}

/**
 * Create an adjacency matrix from a list of edges.
 *
 * @param {number} n     - Number of nodes (0-indexed).
 * @param {Array<[number, number, number?]>} edges - Array of [u, v] or [u, v, weight] tuples.
 * @returns {number[][]} n x n matrix where matrix[u][v] holds the weight (0 if no edge).
 */
export function createAdjacencyMatrix(n, edges) {
  const matrix = Array.from({ length: n }, () => new Array(n).fill(0));

  for (const edge of edges) {
    const [u, v, w = 1] = edge;
    matrix[u][v] = w;
    matrix[v][u] = w;
  }

  return matrix;
}

/**
 * Generate a random connected graph.
 *
 * @param {number}  n         - Number of nodes.
 * @param {number}  edgeCount - Total number of edges (at least n-1 for connectivity).
 * @param {boolean} weighted  - Whether to assign random weights (default false).
 * @returns {Array<[number, number, number]>} Array of [u, v, weight] tuples.
 */
export function randomGraph(n, edgeCount, weighted = false) {
  if (n < 2) return [];
  const edges = [];
  const edgeSet = new Set();

  function edgeKey(u, v) {
    return u < v ? `${u}-${v}` : `${v}-${u}`;
  }

  // First ensure connectivity with a random spanning tree
  const nodes = Array.from({ length: n }, (_, i) => i);
  for (let i = 1; i < n; i++) {
    const j = Math.floor(Math.random() * i);
    const w = weighted ? Math.floor(Math.random() * 20) + 1 : 1;
    edges.push([nodes[j], nodes[i], w]);
    edgeSet.add(edgeKey(nodes[j], nodes[i]));
  }

  // Add remaining random edges
  const maxEdges = (n * (n - 1)) / 2;
  const targetEdges = Math.min(edgeCount, maxEdges);

  while (edges.length < targetEdges) {
    const u = Math.floor(Math.random() * n);
    const v = Math.floor(Math.random() * n);
    if (u !== v && !edgeSet.has(edgeKey(u, v))) {
      const w = weighted ? Math.floor(Math.random() * 20) + 1 : 1;
      edges.push([u, v, w]);
      edgeSet.add(edgeKey(u, v));
    }
  }

  return edges;
}

/**
 * Generate a random tree with n nodes.
 *
 * @param {number} n - Number of nodes.
 * @returns {Array<[number, number]>} Array of [parent, child] edge tuples.
 */
export function randomTree(n) {
  if (n < 2) return [];
  const edges = [];

  for (let i = 1; i < n; i++) {
    const parent = Math.floor(Math.random() * i);
    edges.push([parent, i]);
  }

  return edges;
}
