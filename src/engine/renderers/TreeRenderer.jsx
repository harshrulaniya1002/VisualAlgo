import React from 'react';

/**
 * Color map for tree node states.
 */
const NODE_COLORS = {
  default: '#94a3b8',     // slate-400
  highlighted: '#facc15', // yellow-400
  visited: '#3b82f6',     // blue-500
  inserted: '#22c55e',    // green-500
};

const EDGE_COLORS = {
  default: '#94a3b8',
  highlighted: '#facc15',
  visited: '#3b82f6',
  inserted: '#22c55e',
};

const NODE_RADIUS = 20;
const LEVEL_HEIGHT = 70;
const MIN_H_SPACING = 50;

/**
 * Compute tree layout positions using a simple recursive spacing approach.
 *
 * Each node gets an (x, y) based on its depth and horizontal position among
 * siblings. This is a simplified version of Reingold-Tilford that works well
 * for reasonably balanced trees.
 *
 * @param {Object}  root       - The root node object with left/right children.
 * @param {Object}  nodeMap    - Map of id -> node for quick lookup.
 * @param {number}  treeWidth  - Available horizontal space.
 * @param {number}  treeHeight - Available vertical space.
 * @returns {Object} Map of nodeId -> {x, y}.
 */
function layoutTree(root, nodeMap, treeWidth, treeHeight) {
  const positions = {};

  if (!root) return positions;

  /**
   * Count total nodes in the subtree rooted at nodeId.
   */
  function subtreeSize(nodeId) {
    if (nodeId === null || nodeId === undefined) return 0;
    const node = nodeMap[nodeId];
    if (!node) return 0;
    return 1 + subtreeSize(node.left) + subtreeSize(node.right);
  }

  /**
   * Compute the maximum depth of the tree.
   */
  function maxDepth(nodeId, depth) {
    if (nodeId === null || nodeId === undefined) return depth;
    const node = nodeMap[nodeId];
    if (!node) return depth;
    return Math.max(
      maxDepth(node.left, depth + 1),
      maxDepth(node.right, depth + 1),
    );
  }

  const depth = maxDepth(root.id, 0);
  const effectiveLevelHeight = Math.min(LEVEL_HEIGHT, (treeHeight - 60) / Math.max(depth, 1));

  /**
   * Recursively assign positions.
   *
   * @param {string|number} nodeId - Current node id.
   * @param {number} level   - Depth level (0 = root).
   * @param {number} left    - Left boundary of the horizontal region.
   * @param {number} right   - Right boundary of the horizontal region.
   */
  function assignPositions(nodeId, level, left, right) {
    if (nodeId === null || nodeId === undefined) return;
    const node = nodeMap[nodeId];
    if (!node) return;

    const x = (left + right) / 2;
    const y = 30 + level * effectiveLevelHeight;

    positions[nodeId] = { x, y };

    const leftSize = subtreeSize(node.left);
    const rightSize = subtreeSize(node.right);
    const total = leftSize + rightSize;

    if (total === 0) return;

    const mid = left + ((right - left) * leftSize) / total;

    if (node.left !== null && node.left !== undefined) {
      assignPositions(node.left, level + 1, left, Math.max(mid, left + MIN_H_SPACING));
    }
    if (node.right !== null && node.right !== undefined) {
      assignPositions(node.right, level + 1, Math.min(mid, right - MIN_H_SPACING), right);
    }
  }

  assignPositions(root.id, 0, 20, treeWidth - 20);
  return positions;
}

/**
 * SVG-based renderer for binary tree visualizations.
 *
 * Tree data comes from step snapshots:
 *   { nodes: [{id, value, state, left, right}], edges: [{from, to, state}] }
 *
 * If nodes don't have x/y positions, they are computed automatically using
 * a simple recursive layout.
 *
 * @param {Object}  props
 * @param {Array}   props.steps       - Array of step objects from StepRecorder.
 * @param {number}  props.currentStep - Index of the current step (-1 = not started).
 * @param {number}  props.width       - SVG viewport width.
 * @param {number}  props.height      - SVG viewport height.
 */
export default React.memo(function TreeRenderer({ steps, currentStep, width = 600, height = 400 }) {
  // Determine snapshot
  let snapshot = null;
  if (currentStep >= 0 && steps && steps[currentStep]) {
    snapshot = steps[currentStep].snapshot;
  } else if (steps && steps.length > 0 && steps[0].snapshot) {
    snapshot = steps[0].snapshot;
  }

  if (!snapshot || !snapshot.nodes || snapshot.nodes.length === 0) {
    return (
      <div className="flex items-center justify-center" style={{ width, height }}>
        <svg width={width} height={height}>
          <text
            x={width / 2}
            y={height / 2}
            textAnchor="middle"
            fill="#94a3b8"
            fontSize={14}
          >
            No tree data to display
          </text>
        </svg>
      </div>
    );
  }

  const { nodes, edges } = snapshot;

  // Build node map
  const nodeMap = {};
  nodes.forEach((node) => {
    nodeMap[node.id] = node;
  });

  // Find root: the node that is never a child (never appears as a "to" in edges),
  // or just use the first node if edges are not provided.
  let rootId = nodes[0].id;
  if (edges && edges.length > 0) {
    const childIds = new Set(edges.map((e) => e.to));
    const rootNode = nodes.find((n) => !childIds.has(n.id));
    if (rootNode) rootId = rootNode.id;
  }

  // Compute positions if not already present on nodes
  const needsLayout = nodes.some((n) => n.x === undefined || n.y === undefined);
  let positions;
  if (needsLayout) {
    positions = layoutTree(nodeMap[rootId], nodeMap, width, height);
  } else {
    positions = {};
    nodes.forEach((n) => {
      positions[n.id] = { x: n.x, y: n.y };
    });
  }

  return (
    <div className="flex items-center justify-center">
      <svg width={width} height={height}>
        {/* Edges */}
        {edges &&
          edges.map((edge, idx) => {
            const fromPos = positions[edge.from];
            const toPos = positions[edge.to];
            if (!fromPos || !toPos) return null;

            const color = EDGE_COLORS[edge.state] || EDGE_COLORS.default;

            return (
              <line
                key={`edge-${idx}`}
                x1={fromPos.x}
                y1={fromPos.y}
                x2={toPos.x}
                y2={toPos.y}
                stroke={color}
                strokeWidth={2}
                style={{ transition: 'all 0.3s ease' }}
              />
            );
          })}

        {/* Nodes */}
        {nodes.map((node) => {
          const pos = positions[node.id];
          if (!pos) return null;

          const color = NODE_COLORS[node.state] || NODE_COLORS.default;

          return (
            <g key={`node-${node.id}`} style={{ transition: 'all 0.3s ease' }}>
              {/* Circle */}
              <circle
                cx={pos.x}
                cy={pos.y}
                r={NODE_RADIUS}
                fill={color}
                stroke="#3f3f46"
                strokeWidth={2}
                style={{ transition: 'fill 0.3s ease' }}
              />

              {/* Value label */}
              <text
                x={pos.x}
                y={pos.y}
                textAnchor="middle"
                dominantBaseline="central"
                fill="#fff"
                fontSize={13}
                fontWeight="bold"
              >
                {node.value !== undefined ? node.value : node.id}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
});
