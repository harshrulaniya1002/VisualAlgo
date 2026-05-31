function normalize(c) {
  return (c || '').replace(/\^2|²/g, '²').replace(/\^3|³/g, '³').replace(/\^n|ⁿ/g, 'ⁿ').replace(/√n|sqrt\(n\)/g, '√n');
}

const COMPLEXITY_ORDER = ['O(1)', 'O(log log n)', 'O(log n)', 'O(√n)', 'O(n)', 'O(n log n)', 'O(n²)', 'O(n³)', 'O(2ⁿ)', 'O(n!)'];
const COMPLEXITY_COLORS = {
  'O(1)': '#22c55e',
  'O(log log n)': '#34d399',
  'O(log n)': '#4ade80',
  'O(√n)': '#a3e635',
  'O(n)': '#facc15',
  'O(n log n)': '#fb923c',
  'O(n²)': '#f87171',
  'O(n³)': '#ef4444',
  'O(2ⁿ)': '#dc2626',
  'O(n!)': '#991b1b',
};

function getComplexityWidth(complexity) {
  const norm = normalize(complexity);
  const idx = COMPLEXITY_ORDER.indexOf(norm);
  if (idx === -1) return 50;
  return ((idx + 1) / COMPLEXITY_ORDER.length) * 100;
}

function getComplexityColor(complexity) {
  return COMPLEXITY_COLORS[normalize(complexity)] || '#94a3b8';
}

export default function ComplexityPanel({ timeComplexity, spaceComplexity, stable, currentStepCount = 0, totalSteps = 0 }) {
  if (!timeComplexity) return null;

  const rows = [
    { label: 'Best', value: timeComplexity.best, color: 'text-emerald-400' },
    { label: 'Average', value: timeComplexity.average, color: 'text-yellow-400' },
    { label: 'Worst', value: timeComplexity.worst, color: 'text-red-400' },
  ];

  return (
    <div className="glass glass-border rounded-2xl p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold theme-text-secondary">Complexity</h3>
        {stable !== undefined && (
          <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${
            stable ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
          }`}>
            {stable ? 'Stable' : 'Unstable'}
          </span>
        )}
      </div>

      <div className="space-y-3">
        {rows.map(row => (
          <div key={row.label}>
            <div className="flex justify-between text-xs mb-1.5">
              <span className="text-gray-500 font-medium">{row.label}</span>
              <span className={`${row.color} font-mono text-[11px]`}>{row.value}</span>
            </div>
            <div className="h-1.5 theme-bg-muted rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700 ease-out"
                style={{
                  width: `${getComplexityWidth(row.value)}%`,
                  backgroundColor: getComplexityColor(row.value),
                }}
              />
            </div>
          </div>
        ))}

        <div>
          <div className="flex justify-between text-xs mb-1.5">
            <span className="text-gray-500 font-medium">Space</span>
            <span className="text-teal-400 font-mono text-[11px]">{spaceComplexity}</span>
          </div>
          <div className="h-1.5 theme-bg-muted rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700 ease-out"
              style={{
                width: `${getComplexityWidth(spaceComplexity)}%`,
                backgroundColor: getComplexityColor(spaceComplexity),
              }}
            />
          </div>
        </div>
      </div>

      {totalSteps > 0 && (
        <div className="pt-3 border-t theme-border">
          <div className="flex justify-between text-xs mb-1.5">
            <span className="text-gray-500 font-medium">Progress</span>
            <span className="theme-text-secondary font-mono text-[11px]">{currentStepCount} / {totalSteps}</span>
          </div>
          <div className="h-1.5 theme-bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-teal-500 to-amber-400 rounded-full transition-all duration-300"
              style={{ width: `${totalSteps > 0 ? (currentStepCount / totalSteps) * 100 : 0}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
