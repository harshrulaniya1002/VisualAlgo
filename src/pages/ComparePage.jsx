import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { getAllAlgorithms } from '../data/algorithmRegistry';
import usePlayback from '../engine/usePlayback';
import VisualizationPanel from '../components/visualization/VisualizationPanel';

const algorithmModules = import.meta.glob('../algorithms/**/*.js');

async function loadAlgorithmModule(slug) {
  for (const [path, loader] of Object.entries(algorithmModules)) {
    const fileName = path.split('/').pop().replace('.js', '');
    const slugFromFile = fileName.replace(/([A-Z])/g, '-$1').toLowerCase().replace(/^-/, '');
    if (slugFromFile === slug || fileName === slug.replace(/-/g, '')) {
      return await loader();
    }
  }
  return null;
}

function ComparePanel({ slug, input, label }) {
  const [module, setModule] = useState(null);

  useEffect(() => {
    if (!slug) { setModule(null); return; }
    let cancelled = false;
    loadAlgorithmModule(slug).then(mod => {
      if (!cancelled) setModule(mod);
    });
    return () => { cancelled = true; };
  }, [slug]);

  const steps = useMemo(() => {
    if (!module?.generateSteps || !input) return [];
    try { return module.generateSteps(input); } catch { return []; }
  }, [module, input]);

  const playback = usePlayback(steps);
  const meta = module?.meta || {};

  if (!slug) {
    return (
      <div className="flex-1 flex items-center justify-center theme-border-color border rounded-2xl m-2">
        <p className="theme-text-muted text-sm">Select an algorithm</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-w-0 min-h-0">
      <div className="px-4 py-2 text-center border-b theme-border-color">
        <span className="text-sm font-semibold theme-text">{meta.name || slug}</span>
        {steps.length > 0 && (
          <span className="text-xs theme-text-muted ml-2">({steps.length} steps)</span>
        )}
      </div>
      <div className="flex-1 min-h-0">
        <VisualizationPanel
          steps={steps}
          currentStep={playback.currentStep}
          isPlaying={playback.isPlaying}
          speed={playback.speed}
          onPlay={playback.play}
          onPause={playback.pause}
          onStepForward={playback.stepForward}
          onStepBack={playback.stepBack}
          onReset={playback.reset}
          onSpeedChange={playback.setSpeed}
          onJumpTo={playback.jumpTo}
          rendererType={meta.rendererType || 'bar'}
        />
      </div>
    </div>
  );
}

function AlgorithmSelector({ value, onChange, exclude }) {
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
        setSearch('');
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  const allAlgorithms = useMemo(() => {
    return getAllAlgorithms().filter(a => a.implemented && a.slug !== exclude);
  }, [exclude]);

  const filtered = search.length >= 1
    ? allAlgorithms.filter(a => a.name.toLowerCase().includes(search.toLowerCase())).slice(0, 10)
    : allAlgorithms.slice(0, 10);

  const selected = allAlgorithms.find(a => a.slug === value);

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-4 py-2 rounded-xl theme-surface theme-border-color border text-sm font-medium theme-text hover:border-teal-400/40 transition-all min-w-[200px]"
      >
        <span className="flex-1 text-left truncate">{selected?.name || 'Choose algorithm...'}</span>
        <svg className={`w-4 h-4 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-1 w-72 theme-surface theme-border-color border rounded-xl shadow-2xl shadow-black/40 z-50 animate-scale-in overflow-hidden">
          <div className="p-2">
            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg bg-black/20 border theme-border-color theme-text placeholder:theme-text-muted focus:outline-none focus:border-teal-400/40"
              autoFocus
            />
          </div>
          <div className="max-h-60 overflow-y-auto">
            {filtered.map(algo => (
              <button
                key={algo.slug}
                onClick={() => { onChange(algo.slug); setOpen(false); setSearch(''); }}
                className={`w-full flex items-center gap-2 px-4 py-2.5 text-sm text-left transition-colors hover:bg-teal-500/10 ${
                  value === algo.slug ? 'bg-teal-500/15 text-teal-300' : 'theme-text'
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0" />
                <span className="truncate">{algo.name}</span>
                <span className="text-xs theme-text-muted ml-auto">{algo.category}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function ComparePage() {
  const [algoA, setAlgoA] = useState('');
  const [algoB, setAlgoB] = useState('');
  const [input, setInput] = useState([64, 34, 25, 12, 22, 11, 90, 45]);
  const [inputText, setInputText] = useState('64, 34, 25, 12, 22, 11, 90, 45');

  const handleInputApply = useCallback(() => {
    const parsed = inputText.split(',').map(s => parseInt(s.trim(), 10)).filter(n => !isNaN(n));
    if (parsed.length >= 2) setInput(parsed);
  }, [inputText]);

  const handleRandomize = useCallback(() => {
    const arr = Array.from({ length: 10 }, () => Math.floor(Math.random() * 90) + 10);
    setInput(arr);
    setInputText(arr.join(', '));
  }, []);

  return (
    <div className="h-full flex flex-col animate-fade-in">
      <div className="px-6 py-3 border-b theme-border-color flex items-center gap-4 glass">
        <Link to="/" className="theme-text-muted hover:theme-text text-sm transition-colors flex items-center gap-1">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          Home
        </Link>
        <div className="w-px h-5 bg-white/[0.08]" />
        <h2 className="text-lg font-bold theme-text flex items-center gap-2">
          <svg className="w-5 h-5 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
          </svg>
          Compare Algorithms
        </h2>
        <div className="flex-1" />

        <AlgorithmSelector value={algoA} onChange={setAlgoA} exclude={algoB} />
        <span className="text-sm font-bold text-teal-400">vs</span>
        <AlgorithmSelector value={algoB} onChange={setAlgoB} exclude={algoA} />
      </div>

      <div className="px-6 py-2 border-b theme-border-color flex items-center gap-3 glass-subtle">
        <span className="text-xs font-medium theme-text-muted">Input:</span>
        <input
          type="text"
          value={inputText}
          onChange={e => setInputText(e.target.value)}
          onBlur={handleInputApply}
          onKeyDown={e => e.key === 'Enter' && handleInputApply()}
          className="flex-1 max-w-md px-3 py-1.5 text-sm rounded-lg bg-black/20 border theme-border-color theme-text font-mono focus:outline-none focus:border-teal-400/40"
        />
        <button
          onClick={handleRandomize}
          className="px-3 py-1.5 text-xs rounded-lg bg-teal-500/10 text-teal-400 hover:bg-teal-500/20 transition-colors border border-teal-500/20 font-medium"
        >
          Randomize
        </button>
      </div>

      <div className="flex-1 flex min-h-0">
        <ComparePanel slug={algoA} input={input} label="A" />
        <div className="w-px theme-border-color bg-current opacity-10 flex-shrink-0" />
        <ComparePanel slug={algoB} input={input} label="B" />
      </div>
    </div>
  );
}
