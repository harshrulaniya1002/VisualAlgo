import React, { useMemo } from 'react';

const BAR_COLORS = {
  default: '#64748b',
  comparing: '#facc15',
  swapping: '#ef4444',
  sorted: '#22c55e',
  found: '#3b82f6',
  visit: '#8b5cf6',
  highlight: '#06b6d4',
  eliminate: '#475569',
  insert: '#f97316',
  compute: '#a78bfa',
  partition: '#ec4899',
  merge: '#14b8a6',
  message: '#64748b',
};

function getBarColor(index, highlightIndices, stepType, sortedIndices) {
  if (highlightIndices.includes(index)) {
    return BAR_COLORS[stepType] || BAR_COLORS.comparing;
  }
  if (sortedIndices && sortedIndices.includes(index)) return BAR_COLORS.sorted;
  return BAR_COLORS.default;
}

function getBarOpacity(index, stepType, highlightIndices) {
  if (stepType === 'eliminate' && highlightIndices.includes(index)) return 0.35;
  return 1;
}

export default React.memo(function BarRenderer({ steps, currentStep, width = 600, height = 400 }) {
  const padding = { top: 24, bottom: 44, left: 12, right: 12 };
  const drawWidth = width - padding.left - padding.right;
  const drawHeight = height - padding.top - padding.bottom;

  const stepData = currentStep >= 0 && steps && steps[currentStep] ? steps[currentStep] : null;
  const snapshot = stepData ? stepData.snapshot
    : (steps && steps.length > 0 && steps[0].snapshot ? steps[0].snapshot : null);

  const highlightIndices = stepData ? (stepData.indices || []) : [];
  const stepType = stepData ? (stepData.type || 'default') : 'default';
  const sortedIndices = stepData?.data?.sortedIndices || null;

  const bars = useMemo(() => {
    if (!snapshot || !Array.isArray(snapshot) || snapshot.length === 0) return null;

    const n = snapshot.length;
    const gap = Math.max(1, Math.min(4, drawWidth / n * 0.08));
    const barWidth = (drawWidth - gap * (n - 1)) / n;
    const maxValue = Math.max(...snapshot, 1);

    const heightScale = 0.55;
    return snapshot.map((value, index) => {
      const barHeight = Math.max(2, (value / maxValue) * drawHeight * heightScale);
      const x = padding.left + index * (barWidth + gap);
      const y = padding.top + drawHeight - barHeight;
      return { value, index, barHeight, x, y, barWidth, gap };
    });
  }, [snapshot, drawWidth, drawHeight, padding.left, padding.top]);

  if (!bars) {
    return (
      <div className="flex items-center justify-center" style={{ width, height }}>
        <svg width={width} height={height}>
          <text x={width / 2} y={height / 2} textAnchor="middle" fill="#475569" fontSize={14} fontFamily="system-ui">
            No data to display
          </text>
        </svg>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center">
      <svg width={width} height={height}>
        <defs>
          <linearGradient id="bar-glow" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(255,255,255,0.15)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0)" />
          </linearGradient>
        </defs>
        {bars.map(({ value, index, barHeight, x, y, barWidth }) => {
          const color = getBarColor(index, highlightIndices, stepType, sortedIndices);
          const opacity = getBarOpacity(index, stepType, highlightIndices);
          const isHighlighted = highlightIndices.includes(index);

          return (
            <g key={index}>
              {isHighlighted && (
                <rect
                  x={x - 2}
                  y={y - 2}
                  width={barWidth + 4}
                  height={barHeight + 4}
                  fill="none"
                  stroke={color}
                  strokeWidth={1.5}
                  rx={4}
                  ry={4}
                  opacity={0.4}
                  style={{ transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)' }}
                />
              )}
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={barHeight}
                fill={color}
                rx={Math.min(3, barWidth / 4)}
                ry={Math.min(3, barWidth / 4)}
                opacity={opacity}
                style={{ transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)' }}
              />
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={Math.min(barHeight, barHeight * 0.4)}
                fill="url(#bar-glow)"
                rx={Math.min(3, barWidth / 4)}
                ry={Math.min(3, barWidth / 4)}
                opacity={opacity}
                style={{ transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)' }}
              />
              <text
                x={x + barWidth / 2}
                y={barHeight > 24 ? y + 16 : y - 6}
                textAnchor="middle"
                fill={barHeight > 24 ? '#fff' : '#94a3b8'}
                fontSize={Math.min(11, barWidth * 0.55)}
                fontWeight="600"
                fontFamily="system-ui"
                style={{ transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)' }}
              >
                {value}
              </text>
              <text
                x={x + barWidth / 2}
                y={height - padding.bottom + 18}
                textAnchor="middle"
                fill="#475569"
                fontSize={Math.min(9, barWidth * 0.45)}
                fontFamily="monospace"
              >
                {index}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
});
