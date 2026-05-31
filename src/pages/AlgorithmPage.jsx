import { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, Link, useOutletContext } from 'react-router-dom';
import { getAlgorithm } from '../data/algorithmRegistry';
import { getProblemsByCategory } from '../data/practiceProblems';
import usePlayback from '../engine/usePlayback';
import VisualizationPanel from '../components/visualization/VisualizationPanel';
import CodePanel from '../components/code/CodePanel';
import ComplexityPanel from '../components/complexity/ComplexityPanel';
import ArrayInput from '../components/input/ArrayInput';
import ProblemList from '../components/practice/ProblemList';

const algorithmModules = import.meta.glob('../algorithms/**/*.js');

async function loadAlgorithmModule(category, slug) {
  for (const [path, loader] of Object.entries(algorithmModules)) {
    const fileName = path.split('/').pop().replace('.js', '');
    const slugFromFile = fileName.replace(/([A-Z])/g, '-$1').toLowerCase().replace(/^-/, '');
    if (slugFromFile === slug || fileName === slug.replace(/-/g, '')) {
      return await loader();
    }
  }
  return null;
}

export default function AlgorithmPage() {
  const { slug } = useParams();
  const { isFullscreen, toggleFullscreen } = useOutletContext();
  const algoInfo = useMemo(() => getAlgorithm(slug), [slug]);
  const [module, setModule] = useState(null);
  const [input, setInput] = useState(null);
  const [target, setTarget] = useState(null);
  const [activeTab, setActiveTab] = useState('visualize');
  const [graphType, setGraphType] = useState(null);

  useEffect(() => {
    if (!algoInfo) return;
    let cancelled = false;
    loadAlgorithmModule(algoInfo.category, slug).then(mod => {
      if (cancelled) return;
      if (mod) {
        if (mod.defaultInput) {
          if (typeof mod.defaultInput === 'object' && !Array.isArray(mod.defaultInput)) {
            setInput(mod.defaultInput.array || mod.defaultInput);
            setTarget(mod.defaultInput.target || null);
          } else {
            setInput(mod.defaultInput);
          }
        }
        if (mod.meta?.graphType) {
          setGraphType(mod.meta.graphType);
        } else if (mod.meta?.rendererType === 'graph') {
          const cat = algoInfo.category;
          if (cat === 'network-flow') {
            setGraphType('directed-weighted');
          } else if (['mst-connectivity', 'shortest-paths'].includes(cat)) {
            setGraphType('undirected-weighted');
          } else {
            setGraphType('undirected');
          }
        } else {
          setGraphType(null);
        }
        setModule(mod);
      }
    });
    return () => { cancelled = true; };
  }, [slug, algoInfo]);

  const steps = useMemo(() => {
    if (!module || !module.generateSteps || !input) return [];
    try {
      if (module.meta?.inputSchema?.hasTarget && target !== null) {
        return module.generateSteps({ array: input, target });
      }
      return module.generateSteps(input);
    } catch {
      return [];
    }
  }, [module, input, target]);

  const processedSteps = useMemo(() => {
    if (!steps || steps.length === 0 || !graphType) return steps;
    const isDirected = graphType === 'directed' || graphType === 'directed-weighted' || graphType === 'dag';
    return steps.map(step => {
      if (!step.snapshot?.edges) return step;
      return {
        ...step,
        snapshot: {
          ...step.snapshot,
          edges: step.snapshot.edges.map(e => ({ ...e, directed: isDirected })),
        },
      };
    });
  }, [steps, graphType]);

  const playback = usePlayback(processedSteps);

  const handleInputChange = useCallback((arr) => {
    setInput(arr);
    playback.reset();
  }, [playback.reset]);

  const handleTargetChange = useCallback((t) => {
    setTarget(t);
    playback.reset();
  }, [playback.reset]);

  useEffect(() => {
    function handleKeyDown(e) {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      switch (e.code) {
        case 'Space':
          e.preventDefault();
          playback.isPlaying ? playback.pause() : playback.play();
          break;
        case 'ArrowRight':
          e.preventDefault();
          playback.stepForward();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          playback.stepBack();
          break;
        case 'KeyR':
          e.preventDefault();
          playback.reset();
          break;
        case 'KeyF':
          e.preventDefault();
          toggleFullscreen();
          break;
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [playback.isPlaying, playback.pause, playback.play, playback.stepForward, playback.stepBack, playback.reset, toggleFullscreen]);

  const handleGraphTypeChange = useCallback((type) => {
    setGraphType(type);
    playback.reset();
  }, [playback.reset]);

  const currentCodeLine = processedSteps[playback.currentStep]?.codeLine ?? -1;
  const problems = useMemo(() => algoInfo ? getProblemsByCategory(algoInfo.category) : [], [algoInfo]);

  if (!algoInfo) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500">Algorithm not found.</p>
      </div>
    );
  }

  if (!algoInfo.implemented || !module) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-6 animate-fade-in">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/20 flex items-center justify-center">
          <span className="text-4xl">🚧</span>
        </div>
        <div className="text-center">
          <h2 className="text-2xl font-bold theme-text-primary mb-2">{algoInfo.name}</h2>
          <p className="theme-text-tertiary mb-4">Visualization coming soon!</p>
        </div>
        <div className="glass glass-border rounded-2xl p-4 space-y-2 text-center">
          <p className="text-sm text-zinc-500">
            Time: <span className="text-amber-400 font-mono">{algoInfo.timeComplexity?.average}</span>
          </p>
          <p className="text-sm text-zinc-500">
            Space: <span className="text-teal-400 font-mono">{algoInfo.spaceComplexity}</span>
          </p>
        </div>
        <p className="text-xs text-zinc-600 max-w-md text-center leading-relaxed">{algoInfo.description}</p>
        <Link to={`/category/${algoInfo.category}`} className="text-teal-400 text-sm hover:text-teal-300 transition-colors flex items-center gap-1">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          Back to {algoInfo.category}
        </Link>
      </div>
    );
  }

  const meta = module.meta || {};

  return (
    <div className="h-full flex flex-col animate-fade-in">
      <div className="px-6 py-3 border-b theme-border flex items-center gap-4 glass">
        <Link to={`/category/${algoInfo.category}`} className="text-gray-500 hover:text-gray-300 text-sm transition-colors flex items-center gap-1">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          {algoInfo.category}
        </Link>
        <div className="w-px h-5 theme-bg-muted" />
        <h2 className="text-lg font-bold theme-text-primary">{algoInfo.name}</h2>
        <div className="flex-1" />
        <button
          onClick={toggleFullscreen}
          className={`p-2 rounded-lg transition-all ${
            isFullscreen
              ? 'bg-teal-500/15 text-teal-300'
              : 'theme-text-tertiary hover:text-teal-500 hover:bg-teal-500/10'
          }`}
          title={isFullscreen ? 'Exit fullscreen (F)' : 'Fullscreen (F)'}
        >
          {isFullscreen ? (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 9V4.5M9 9H4.5M9 9L3.75 3.75M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 9h4.5M15 9V4.5M15 9l5.25-5.25M15 15h4.5M15 15v4.5m0-4.5l5.25 5.25" />
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
            </svg>
          )}
        </button>
        <div className="flex gap-1 p-0.5 theme-bg-subtle border theme-border rounded-xl">
          {['visualize', 'practice'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-1.5 text-sm rounded-lg transition-all font-medium ${
                activeTab === tab
                  ? 'bg-teal-500/15 text-teal-300 shadow-sm'
                  : 'theme-text-dim hover:text-teal-500'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'visualize' ? (
        <div className="flex-1 flex min-h-0">
          <div className="flex-1 flex flex-col min-w-0">
            <VisualizationPanel
              steps={processedSteps}
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

          {!isFullscreen && (
            <>
              <div className="split-pane-divider" />

              <div className="w-96 flex flex-col border-l theme-border overflow-y-auto glass-subtle">
                <CodePanel
                  pseudocode={meta.pseudocode || []}
                  currentLine={currentCodeLine}
                  codeImplementations={meta.codeImplementations || {}}
                />

                <div className="p-4 border-t theme-border space-y-4">
                  <ComplexityPanel
                    timeComplexity={algoInfo.timeComplexity}
                    spaceComplexity={algoInfo.spaceComplexity}
                    stable={meta.stable}
                    currentStepCount={Math.max(0, playback.currentStep + 1)}
                    totalSteps={processedSteps.length}
                  />

                  <ArrayInput
                    value={input}
                    onChange={handleInputChange}
                    constraints={meta.inputSchema?.constraints}
                    hasTarget={meta.inputSchema?.hasTarget}
                    targetValue={target}
                    onTargetChange={handleTargetChange}
                    rendererType={meta.rendererType || 'bar'}
                    category={algoInfo.category}
                    graphType={graphType}
                    onGraphTypeChange={handleGraphTypeChange}
                  />
                </div>
              </div>
            </>
          )}
        </div>
      ) : (
        <div className="flex-1 flex min-h-0">
          <div className="flex-1 overflow-auto p-6">
            <ProblemList problems={problems} title={`Practice: ${algoInfo.name}`} />
          </div>

          <div className="split-pane-divider" />

          <div className="w-96 flex flex-col border-l theme-border overflow-y-auto glass-subtle">
            <div className="p-4 space-y-5">
              <div>
                <h3 className="text-sm font-semibold theme-text-secondary mb-2 flex items-center gap-2">
                  <svg className="w-4 h-4 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  About
                </h3>
                <p className="text-xs theme-text-tertiary leading-relaxed">{algoInfo.description}</p>
              </div>

              <div className="border-t theme-border pt-4">
                <ComplexityPanel
                  timeComplexity={algoInfo.timeComplexity}
                  spaceComplexity={algoInfo.spaceComplexity}
                  stable={meta.stable}
                />
              </div>

              {meta.pseudocode && meta.pseudocode.length > 0 && (
                <div className="border-t theme-border pt-4">
                  <h3 className="text-sm font-semibold theme-text-secondary mb-2 flex items-center gap-2">
                    <svg className="w-4 h-4 text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                    </svg>
                    Pseudocode
                  </h3>
                  <div className="bg-zinc-900/80 rounded-xl p-3 border border-zinc-800">
                    {meta.pseudocode.map((line, i) => (
                      <div key={i} className="text-[11px] text-gray-400 font-mono leading-relaxed">{line}</div>
                    ))}
                  </div>
                </div>
              )}

              <div className="border-t theme-border pt-4">
                <button
                  onClick={() => setActiveTab('visualize')}
                  className="w-full px-4 py-2.5 bg-teal-500/10 hover:bg-teal-500/20 text-teal-400 text-sm rounded-xl transition-all border border-teal-500/20 hover:border-teal-500/30 font-medium flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Visualize This Algorithm
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
