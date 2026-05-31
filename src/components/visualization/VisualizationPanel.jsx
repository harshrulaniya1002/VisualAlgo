import React, { useRef, useState, useEffect, useCallback } from 'react';
import BarRenderer from '../../engine/renderers/BarRenderer';
import TreeRenderer from '../../engine/renderers/TreeRenderer';
import GraphRenderer from '../../engine/renderers/GraphRenderer';
import GridRenderer from '../../engine/renderers/GridRenderer';
import PlaybackControls from './PlaybackControls';

const RENDERERS = {
  bar: BarRenderer,
  tree: TreeRenderer,
  graph: GraphRenderer,
  grid: GridRenderer,
};

export default React.memo(function VisualizationPanel({
  steps,
  currentStep,
  isPlaying,
  speed,
  onPlay,
  onPause,
  onStepForward,
  onStepBack,
  onReset,
  onSpeedChange,
  onJumpTo,
  rendererType = 'bar',
}) {
  const containerRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 600, height: 400 });

  const handleResize = useCallback((entries) => {
    for (const entry of entries) {
      const w = entry.contentRect.width;
      const h = Math.max(300, entry.contentRect.height - 80);
      setDimensions(prev => {
        if (prev.width === w && prev.height === h) return prev;
        return { width: w, height: h };
      });
    }
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver(handleResize);
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [handleResize]);

  const step = currentStep >= 0 && steps[currentStep] ? steps[currentStep] : null;
  const Renderer = RENDERERS[rendererType] || BarRenderer;

  return (
    <div ref={containerRef} className="flex flex-col h-full">
      <div className="flex-1 flex items-center justify-center p-4 min-h-0">
        <Renderer
          steps={steps}
          currentStep={currentStep}
          width={dimensions.width}
          height={dimensions.height}
        />
      </div>

      {step && step.explanation && (
        <div className="px-4 py-2.5 mx-4 mb-2 glass glass-border rounded-xl">
          <p className="text-sm text-gray-300 leading-relaxed">{step.explanation}</p>
        </div>
      )}

      <div className="px-4 pb-4">
        <PlaybackControls
          isPlaying={isPlaying}
          speed={speed}
          currentStep={currentStep}
          totalSteps={steps.length}
          onPlay={onPlay}
          onPause={onPause}
          onStepForward={onStepForward}
          onStepBack={onStepBack}
          onReset={onReset}
          onSpeedChange={onSpeedChange}
          onJumpTo={onJumpTo}
        />
      </div>
    </div>
  );
});
