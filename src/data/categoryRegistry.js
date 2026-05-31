// VisualAlgo - Category Registry
// Central registry of all 22 algorithm categories

export const categories = [
  { slug: 'sorting', name: 'Sorting', icon: '↕', description: 'Compare and rearrange elements into order', color: 'blue' },
  { slug: 'searching', name: 'Searching', icon: '🔍', description: 'Find elements in data structures', color: 'green' },
  { slug: 'arrays-strings', name: 'Arrays & Strings', icon: '📊', description: 'Fundamental array and string techniques', color: 'cyan' },
  { slug: 'linked-lists', name: 'Linked Lists', icon: '🔗', description: 'Node-based sequential data structures', color: 'teal' },
  { slug: 'stacks-queues', name: 'Stacks & Queues', icon: '📚', description: 'LIFO and FIFO data structures', color: 'indigo' },
  { slug: 'hashing', name: 'Hashing', icon: '#', description: 'Hash-based data storage and retrieval', color: 'violet' },
  { slug: 'trees', name: 'Trees', icon: '🌳', description: 'Hierarchical tree data structures', color: 'emerald' },
  { slug: 'advanced-trees', name: 'Advanced Trees', icon: '🌲', description: 'Binary lifting, HLD, centroid decomposition', color: 'lime' },
  { slug: 'heaps', name: 'Heaps', icon: '⛰', description: 'Priority queue implementations', color: 'amber' },
  { slug: 'graph-traversal', name: 'Graph Traversal', icon: '🕸', description: 'BFS, DFS, and graph exploration', color: 'orange' },
  { slug: 'shortest-paths', name: 'Shortest Paths', icon: '🛤', description: 'Finding optimal paths in graphs', color: 'red' },
  { slug: 'mst-connectivity', name: 'MST & Connectivity', icon: '🔌', description: 'Spanning trees and graph connectivity', color: 'rose' },
  { slug: 'network-flow', name: 'Network Flow', icon: '🌊', description: 'Maximum flow and matching algorithms', color: 'sky' },
  { slug: 'dynamic-programming', name: 'Dynamic Programming', icon: '📐', description: 'Optimal substructure and overlapping subproblems', color: 'purple' },
  { slug: 'greedy', name: 'Greedy', icon: '🎯', description: 'Locally optimal choices for global optimum', color: 'yellow' },
  { slug: 'divide-conquer', name: 'Divide & Conquer', icon: '✂', description: 'Split, solve, and combine', color: 'fuchsia' },
  { slug: 'backtracking', name: 'Backtracking', icon: '🔙', description: 'Explore and prune solution spaces', color: 'pink' },
  { slug: 'string-algorithms', name: 'String Algorithms', icon: '📝', description: 'Pattern matching and string processing', color: 'slate' },
  { slug: 'computational-geometry', name: 'Computational Geometry', icon: '📐', description: 'Geometric algorithms and structures', color: 'stone' },
  { slug: 'number-theory', name: 'Number Theory', icon: '🔢', description: 'Primes, modular arithmetic, and more', color: 'zinc' },
  { slug: 'bit-manipulation', name: 'Bit Manipulation', icon: '⚡', description: 'Bitwise operations and tricks', color: 'neutral' },
  { slug: 'union-find', name: 'Union-Find / DSU', icon: '🔗', description: 'Disjoint set union data structure', color: 'gray' },
];

export function getCategoryBySlug(slug) {
  return categories.find(c => c.slug === slug);
}
