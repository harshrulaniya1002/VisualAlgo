import React from 'react';

/**
 * Color map for grid cell states.
 */
const CELL_COLORS = {
  default: '#ffffff',   // white
  computing: '#facc15', // yellow-400
  computed: '#bfdbfe',  // blue-200
  optimal: '#4ade80',   // green-400
};

const CELL_TEXT_COLORS = {
  default: '#3f3f46',
  computing: '#713f12',
  computed: '#1e3a5f',
  optimal: '#14532d',
};

const HEADER_BG = '#f4f4f5';   // zinc-100
const HEADER_TEXT = '#52525b';  // zinc-600
const BORDER_COLOR = '#d4d4d8'; // zinc-300

/**
 * SVG-based renderer for DP tables, matrices, and 2D grids.
 *
 * Grid data comes from step snapshots:
 *   {
 *     grid: [[ ... ], [ ... ], ...],
 *     highlights: [{ row, col, state }],
 *     rowHeaders: [],
 *     colHeaders: []
 *   }
 *
 * @param {Object}  props
 * @param {Array}   props.steps       - Array of step objects from StepRecorder.
 * @param {number}  props.currentStep - Index of the current step (-1 = not started).
 * @param {number}  props.width       - SVG viewport width.
 * @param {number}  props.height      - SVG viewport height.
 */
export default React.memo(function GridRenderer({ steps, currentStep, width = 600, height = 400 }) {
  // Determine snapshot
  let snapshot = null;
  if (currentStep >= 0 && steps && steps[currentStep]) {
    snapshot = steps[currentStep].snapshot;
  } else if (steps && steps.length > 0 && steps[0].snapshot) {
    snapshot = steps[0].snapshot;
  }

  if (!snapshot || !snapshot.grid || snapshot.grid.length === 0) {
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
            No grid data to display
          </text>
        </svg>
      </div>
    );
  }

  const { grid, highlights = [], rowHeaders, colHeaders } = snapshot;
  const rows = grid.length;
  const cols = grid[0].length;

  // Build a highlight lookup: "row,col" -> state
  const highlightMap = {};
  highlights.forEach((h) => {
    highlightMap[`${h.row},${h.col}`] = h.state || 'computing';
  });

  // Layout calculations
  const hasRowHeaders = rowHeaders && rowHeaders.length > 0;
  const hasColHeaders = colHeaders && colHeaders.length > 0;

  const padding = 10;
  const headerOffset = 30;

  const gridStartX = padding + (hasRowHeaders ? headerOffset : 0);
  const gridStartY = padding + (hasColHeaders ? headerOffset : 0);

  const availableWidth = width - gridStartX - padding;
  const availableHeight = height - gridStartY - padding;

  const cellWidth = Math.min(60, availableWidth / cols);
  const cellHeight = Math.min(40, availableHeight / rows);

  /**
   * Get the fill color for a cell.
   */
  function getCellColor(row, col) {
    const key = `${row},${col}`;
    const state = highlightMap[key];
    return CELL_COLORS[state] || CELL_COLORS.default;
  }

  /**
   * Get the text color for a cell.
   */
  function getCellTextColor(row, col) {
    const key = `${row},${col}`;
    const state = highlightMap[key];
    return CELL_TEXT_COLORS[state] || CELL_TEXT_COLORS.default;
  }

  /**
   * Format a cell value for display.
   */
  function formatValue(val) {
    if (val === null || val === undefined) return '';
    if (val === Infinity) return '∞';
    if (val === -Infinity) return '-∞';
    if (typeof val === 'number' && !Number.isInteger(val)) return val.toFixed(1);
    return String(val);
  }

  return (
    <div className="flex items-center justify-center overflow-auto">
      <svg
        width={Math.max(width, gridStartX + cols * cellWidth + padding)}
        height={Math.max(height, gridStartY + rows * cellHeight + padding)}
      >
        {/* Column headers */}
        {hasColHeaders &&
          colHeaders.map((header, col) => (
            <g key={`col-header-${col}`}>
              <rect
                x={gridStartX + col * cellWidth}
                y={padding}
                width={cellWidth}
                height={headerOffset - 2}
                fill={HEADER_BG}
                stroke={BORDER_COLOR}
                strokeWidth={1}
              />
              <text
                x={gridStartX + col * cellWidth + cellWidth / 2}
                y={padding + (headerOffset - 2) / 2}
                textAnchor="middle"
                dominantBaseline="central"
                fill={HEADER_TEXT}
                fontSize={11}
                fontWeight="600"
              >
                {header}
              </text>
            </g>
          ))}

        {/* Row headers */}
        {hasRowHeaders &&
          rowHeaders.map((header, row) => (
            <g key={`row-header-${row}`}>
              <rect
                x={padding}
                y={gridStartY + row * cellHeight}
                width={headerOffset - 2}
                height={cellHeight}
                fill={HEADER_BG}
                stroke={BORDER_COLOR}
                strokeWidth={1}
              />
              <text
                x={padding + (headerOffset - 2) / 2}
                y={gridStartY + row * cellHeight + cellHeight / 2}
                textAnchor="middle"
                dominantBaseline="central"
                fill={HEADER_TEXT}
                fontSize={11}
                fontWeight="600"
              >
                {header}
              </text>
            </g>
          ))}

        {/* Grid cells */}
        {grid.map((rowData, row) =>
          rowData.map((value, col) => {
            const x = gridStartX + col * cellWidth;
            const y = gridStartY + row * cellHeight;
            const fillColor = getCellColor(row, col);
            const textColor = getCellTextColor(row, col);

            return (
              <g key={`cell-${row}-${col}`}>
                {/* Cell background */}
                <rect
                  x={x}
                  y={y}
                  width={cellWidth}
                  height={cellHeight}
                  fill={fillColor}
                  stroke={BORDER_COLOR}
                  strokeWidth={1}
                  style={{ transition: 'fill 0.3s ease' }}
                />

                {/* Cell value */}
                <text
                  x={x + cellWidth / 2}
                  y={y + cellHeight / 2}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fill={textColor}
                  fontSize={Math.min(13, cellWidth * 0.35)}
                  fontWeight="500"
                  style={{ transition: 'fill 0.3s ease' }}
                >
                  {formatValue(value)}
                </text>
              </g>
            );
          }),
        )}
      </svg>
    </div>
  );
});
