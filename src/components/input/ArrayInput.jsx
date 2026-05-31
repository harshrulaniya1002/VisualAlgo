import { useState, useEffect } from 'react';

const WEIGHTED_GRAPH_CATEGORIES = new Set([
  'mst-connectivity', 'shortest-paths', 'network-flow',
]);

const UNWEIGHTED_GRAPH_CATEGORIES = new Set([
  'graph-traversal', 'advanced-trees',
]);

const GEOMETRY_CATEGORY = 'computational-geometry';

const GRAPH_TYPE_OPTIONS_UNWEIGHTED = [
  { id: 'undirected', label: 'Undirected' },
  { id: 'directed', label: 'Directed' },
  { id: 'dag', label: 'DAG' },
];

const GRAPH_TYPE_OPTIONS_WEIGHTED = [
  { id: 'undirected-weighted', label: 'Undirected Weighted' },
  { id: 'directed-weighted', label: 'Directed Weighted' },
];

function isWeightedType(type) {
  return type === 'undirected-weighted' || type === 'directed-weighted';
}

function getFormatInfo(rendererType, category, graphType) {
  if (rendererType === 'tree') {
    return { placeholder: '50, 30, 70, 20, 40, 60, 80', hint: 'Values to insert into tree' };
  }
  if (rendererType === 'grid') {
    return { placeholder: '4, 1,0,1,0, 1,1,1,1, 0,1,0,1, 1,1,1,1', hint: 'Format: size, row values...' };
  }
  if (category === GEOMETRY_CATEGORY) {
    return { placeholder: '8, 0,3, 1,1, 2,2, 4,4, 0,0, 1,2, 3,1, 3,3', hint: 'Format: numPoints, x,y, x,y, ...' };
  }

  if (graphType && isWeightedType(graphType)) {
    return {
      placeholder: '6, 0,1,4, 0,2,3, 1,2,1, 1,3,2, 3,4,2, 4,5,6',
      hint: 'Format: numNodes, from,to,weight, from,to,weight, ...',
    };
  }
  if (graphType && !isWeightedType(graphType)) {
    return {
      placeholder: '6, 0,1, 0,2, 1,3, 2,3, 3,4, 4,5',
      hint: 'Format: numNodes, from,to, from,to, ...',
    };
  }

  if (WEIGHTED_GRAPH_CATEGORIES.has(category)) {
    return { placeholder: '6, 0,1,4, 0,2,3, 1,2,1, 1,3,2, 3,4,2, 4,5,6', hint: 'Format: numNodes, from,to,weight, from,to,weight, ...' };
  }
  if (UNWEIGHTED_GRAPH_CATEGORIES.has(category) || rendererType === 'graph') {
    return { placeholder: '6, 0,1, 0,2, 1,3, 2,3, 3,4, 4,5', hint: 'Format: numNodes, from,to, from,to, ...' };
  }
  return { placeholder: '64, 34, 25, 12, 22, 11, 90', hint: 'Comma-separated values' };
}

function generateRandomUnweightedGraph() {
  const numNodes = Math.floor(Math.random() * 4) + 4;
  const edges = [];
  for (let i = 1; i < numNodes; i++) {
    const from = Math.floor(Math.random() * i);
    edges.push(from, i);
  }
  const extra = Math.floor(Math.random() * 3) + 1;
  for (let k = 0; k < extra; k++) {
    const u = Math.floor(Math.random() * numNodes);
    const v = Math.floor(Math.random() * numNodes);
    if (u !== v) edges.push(u, v);
  }
  return [numNodes, ...edges];
}

function generateRandomDirectedGraph() {
  const numNodes = Math.floor(Math.random() * 4) + 4;
  const edges = [];
  for (let i = 1; i < numNodes; i++) {
    const from = Math.floor(Math.random() * i);
    edges.push(from, i);
  }
  const extra = Math.floor(Math.random() * 3) + 2;
  for (let k = 0; k < extra; k++) {
    const u = Math.floor(Math.random() * numNodes);
    const v = Math.floor(Math.random() * numNodes);
    if (u !== v) edges.push(u, v);
  }
  return [numNodes, ...edges];
}

function generateRandomDAG() {
  const numNodes = Math.floor(Math.random() * 4) + 4;
  const edges = [];
  for (let i = 1; i < numNodes; i++) {
    const from = Math.floor(Math.random() * i);
    edges.push(from, i);
  }
  const extra = Math.floor(Math.random() * 3) + 1;
  for (let k = 0; k < extra; k++) {
    const u = Math.floor(Math.random() * (numNodes - 1));
    const v = u + 1 + Math.floor(Math.random() * (numNodes - u - 1));
    if (v < numNodes) edges.push(u, v);
  }
  return [numNodes, ...edges];
}

function generateRandomWeightedGraph() {
  const numNodes = Math.floor(Math.random() * 3) + 4;
  const edges = [];
  for (let i = 1; i < numNodes; i++) {
    const from = Math.floor(Math.random() * i);
    const weight = Math.floor(Math.random() * 9) + 1;
    edges.push(from, i, weight);
  }
  const extra = Math.floor(Math.random() * 3) + 2;
  for (let k = 0; k < extra; k++) {
    const u = Math.floor(Math.random() * numNodes);
    const v = Math.floor(Math.random() * numNodes);
    if (u !== v) {
      const weight = Math.floor(Math.random() * 15) + 1;
      edges.push(u, v, weight);
    }
  }
  return [numNodes, ...edges];
}

function generateRandomDirectedWeightedGraph() {
  const numNodes = Math.floor(Math.random() * 3) + 4;
  const edges = [];
  for (let i = 1; i < numNodes; i++) {
    const from = Math.floor(Math.random() * i);
    const weight = Math.floor(Math.random() * 9) + 1;
    edges.push(from, i, weight);
  }
  const extra = Math.floor(Math.random() * 3) + 2;
  for (let k = 0; k < extra; k++) {
    const u = Math.floor(Math.random() * numNodes);
    const v = Math.floor(Math.random() * numNodes);
    if (u !== v) {
      const weight = Math.floor(Math.random() * 15) + 1;
      edges.push(u, v, weight);
    }
  }
  return [numNodes, ...edges];
}

function generateRandomPoints() {
  const numPoints = Math.floor(Math.random() * 5) + 5;
  const coords = [];
  for (let i = 0; i < numPoints; i++) {
    coords.push(Math.floor(Math.random() * 40) + 1, Math.floor(Math.random() * 40) + 1);
  }
  return [numPoints, ...coords];
}

function generateRandomTreeValues(minVal, maxVal) {
  const len = Math.floor(Math.random() * 6) + 4;
  const values = new Set();
  while (values.size < len) {
    values.add(Math.floor(Math.random() * (maxVal - minVal + 1)) + minVal);
  }
  return [...values];
}

function generateRandomForType(type) {
  switch (type) {
    case 'undirected': return generateRandomUnweightedGraph();
    case 'directed': return generateRandomDirectedGraph();
    case 'dag': return generateRandomDAG();
    case 'undirected-weighted': return generateRandomWeightedGraph();
    case 'directed-weighted': return generateRandomDirectedWeightedGraph();
    default: return generateRandomUnweightedGraph();
  }
}

function generateRandom(rendererType, category, minValue, maxValue, graphType) {
  if (rendererType === 'tree') {
    return generateRandomTreeValues(minValue, maxValue);
  }
  if (category === GEOMETRY_CATEGORY) {
    return generateRandomPoints();
  }
  if (graphType) {
    return generateRandomForType(graphType);
  }
  if (WEIGHTED_GRAPH_CATEGORIES.has(category)) {
    return generateRandomWeightedGraph();
  }
  if (UNWEIGHTED_GRAPH_CATEGORIES.has(category) || rendererType === 'graph') {
    return generateRandomUnweightedGraph();
  }
  const len = Math.floor(Math.random() * 10) + 5;
  return Array.from({ length: len }, () =>
    Math.floor(Math.random() * (maxValue - minValue + 1)) + minValue
  );
}

function getGraphTypeOptions(selectedType, category) {
  const weighted = selectedType
    ? isWeightedType(selectedType)
    : WEIGHTED_GRAPH_CATEGORIES.has(category);
  return weighted ? GRAPH_TYPE_OPTIONS_WEIGHTED : GRAPH_TYPE_OPTIONS_UNWEIGHTED;
}

export default function ArrayInput({
  value, onChange, constraints = {}, hasTarget = false, targetValue, onTargetChange,
  rendererType = 'bar', category = '', graphType: graphTypeProp, onGraphTypeChange,
}) {
  const { minLength = 2, maxLength = 50, minValue = 0, maxValue = 999 } = constraints;
  const [text, setText] = useState(Array.isArray(value) ? value.join(', ') : '');
  const [error, setError] = useState('');
  const [selectedGraphType, setSelectedGraphType] = useState(graphTypeProp || null);

  useEffect(() => {
    if (Array.isArray(value)) {
      setText(value.join(', '));
    }
  }, [value]);

  useEffect(() => {
    if (graphTypeProp) setSelectedGraphType(graphTypeProp);
  }, [graphTypeProp]);

  const isGraphType = rendererType === 'graph' || WEIGHTED_GRAPH_CATEGORIES.has(category) || UNWEIGHTED_GRAPH_CATEGORIES.has(category) || category === GEOMETRY_CATEGORY;
  const showGraphTypeSelector = isGraphType && category !== GEOMETRY_CATEGORY && rendererType !== 'grid' && rendererType !== 'tree';
  const graphTypeOptions = showGraphTypeSelector ? getGraphTypeOptions(selectedGraphType, category) : null;
  const fmt = getFormatInfo(rendererType, category, selectedGraphType);

  function handleChange(raw) {
    setText(raw);
    setError('');
    const nums = raw.split(',').map(s => s.trim()).filter(s => s !== '').map(Number);
    if (nums.some(isNaN)) {
      setError('All values must be numbers');
      return;
    }
    if (nums.length < minLength) {
      setError(`Need at least ${minLength} elements`);
      return;
    }
    if (nums.length > maxLength) {
      setError(`Maximum ${maxLength} elements`);
      return;
    }
    onChange(nums);
  }

  function handleRandomize() {
    const arr = generateRandom(rendererType, category, minValue, maxValue, selectedGraphType);
    setText(arr.join(', '));
    onChange(arr);
  }

  function handleSorted() {
    let arr;
    if (isGraphType) {
      arr = generateRandom(rendererType, category, minValue, maxValue, selectedGraphType);
    } else if (rendererType === 'tree') {
      arr = generateRandomTreeValues(minValue, maxValue).sort((a, b) => a - b);
    } else {
      const len = Math.floor(Math.random() * 10) + 5;
      arr = Array.from({ length: len }, () =>
        Math.floor(Math.random() * (maxValue - minValue + 1)) + minValue
      ).sort((a, b) => a - b);
    }
    setText(arr.join(', '));
    onChange(arr);
  }

  function handleGraphTypeChange(type) {
    setSelectedGraphType(type);
    if (onGraphTypeChange) onGraphTypeChange(type);
    const arr = generateRandomForType(type);
    setText(arr.join(', '));
    onChange(arr);
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
        </svg>
        <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Input</label>
      </div>

      {showGraphTypeSelector && graphTypeOptions && (
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[11px] text-gray-500 font-medium mr-0.5">Graph:</span>
          {graphTypeOptions.map(opt => (
            <button
              key={opt.id}
              onClick={() => handleGraphTypeChange(opt.id)}
              className={`px-2.5 py-1 text-[11px] rounded-lg transition-all font-medium border ${
                selectedGraphType === opt.id
                  ? 'bg-teal-500/15 text-teal-300 border-teal-400/25'
                  : 'theme-bg-subtle theme-text-dim theme-border hover:text-teal-500 hover:border-teal-400/30'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}

      <p className="text-[11px] text-gray-500 -mt-1">{fmt.hint}</p>
      <textarea
        value={text}
        onChange={e => handleChange(e.target.value)}
        rows={2}
        className="w-full px-3 py-2.5 theme-bg-subtle border theme-border rounded-xl text-sm theme-text-secondary focus:outline-none focus:border-teal-400/40 focus:ring-1 focus:ring-teal-400/15 focus:bg-white/[0.06] font-mono resize-none transition-all placeholder-gray-700"
        placeholder={fmt.placeholder}
      />
      {error && (
        <p className="text-xs text-red-400 flex items-center gap-1">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {error}
        </p>
      )}

      {hasTarget && (
        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-gray-400">Target:</label>
          <input
            type="number"
            value={targetValue || ''}
            onChange={e => onTargetChange(Number(e.target.value))}
            className="w-24 px-2.5 py-1.5 theme-bg-subtle border theme-border rounded-lg text-sm theme-text-secondary focus:outline-none focus:border-teal-400/40 focus:ring-1 focus:ring-teal-400/15 font-mono transition-all"
          />
        </div>
      )}

      <div className="flex gap-2">
        <button
          onClick={handleRandomize}
          className="px-3 py-1.5 theme-bg-muted hover:bg-teal-500/10 text-gray-300 text-xs rounded-lg transition-all border theme-border hover:border-white/[0.15] active:scale-95 font-medium"
        >
          Random
        </button>
        <button
          onClick={handleSorted}
          className="px-3 py-1.5 theme-bg-muted hover:bg-teal-500/10 text-gray-300 text-xs rounded-lg transition-all border theme-border hover:border-white/[0.15] active:scale-95 font-medium"
        >
          {isGraphType ? 'New Graph' : 'Sorted'}
        </button>
      </div>
    </div>
  );
}
