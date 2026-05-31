import React, { useMemo, useCallback } from 'react';

const SPEED_OPTIONS = [0.25, 0.5, 1, 1.5, 2, 4];

export default React.memo(function PlaybackControls({
  isPlaying,
  speed,
  currentStep,
  totalSteps,
  onPlay,
  onPause,
  onStepForward,
  onStepBack,
  onReset,
  onSpeedChange,
  onJumpTo,
}) {
  const progress = useMemo(
    () => totalSteps > 0 ? ((Math.max(0, currentStep + 1)) / totalSteps) * 100 : 0,
    [currentStep, totalSteps]
  );

  const handleSliderChange = useCallback(
    (e) => onJumpTo(Number(e.target.value)),
    [onJumpTo]
  );

  return (
    <div className="flex items-center gap-3 px-4 py-3 glass glass-border rounded-2xl">
      <button
        onClick={onReset}
        className="p-2 theme-text-tertiary hover:text-teal-500 transition-all rounded-xl hover:bg-teal-500/10 active:scale-90"
        title="Reset (R)"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      </button>

      <button
        onClick={onStepBack}
        disabled={currentStep <= 0}
        className="p-2 theme-text-tertiary hover:text-teal-500 transition-all rounded-xl hover:bg-teal-500/10 disabled:opacity-20 disabled:cursor-not-allowed active:scale-90"
        title="Step Back"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0019 16V8a1 1 0 00-1.6-.8l-5.333 4zM4.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0011 16V8a1 1 0 00-1.6-.8l-5.334 4z" />
        </svg>
      </button>

      <button
        onClick={isPlaying ? onPause : onPlay}
        className="p-3.5 bg-gradient-to-br from-teal-500 to-teal-600 hover:from-teal-400 hover:to-teal-500 text-white rounded-2xl transition-all shadow-lg shadow-teal-500/25 active:scale-90 hover:shadow-teal-500/40"
        title={isPlaying ? 'Pause (Space)' : 'Play (Space)'}
      >
        {isPlaying ? (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
          </svg>
        ) : (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z" />
          </svg>
        )}
      </button>

      <button
        onClick={onStepForward}
        disabled={currentStep >= totalSteps - 1}
        className="p-2 theme-text-tertiary hover:text-teal-500 transition-all rounded-xl hover:bg-teal-500/10 disabled:opacity-20 disabled:cursor-not-allowed active:scale-90"
        title="Step Forward"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.933 12.8a1 1 0 000-1.6L6.6 7.2A1 1 0 005 8v8a1 1 0 001.6.8l5.333-4zM19.933 12.8a1 1 0 000-1.6l-5.333-4A1 1 0 0013 8v8a1 1 0 001.6.8l5.333-4z" />
        </svg>
      </button>

      <div className="flex-1 mx-3">
        <div className="relative">
          <div className="absolute inset-0 h-1.5 top-1/2 -translate-y-1/2 rounded-full theme-bg-muted pointer-events-none">
            <div
              className="h-full rounded-full bg-gradient-to-r from-teal-500 to-teal-400 transition-all duration-150"
              style={{ width: `${progress}%` }}
            />
          </div>
          <input
            type="range"
            min={0}
            max={Math.max(0, totalSteps - 1)}
            value={Math.max(0, currentStep)}
            onChange={handleSliderChange}
            className="w-full relative z-10 cursor-pointer"
            style={{ background: 'transparent' }}
          />
        </div>
        <div className="flex justify-between text-[11px] text-gray-500 mt-1 font-mono">
          <span>{Math.max(0, currentStep + 1)}</span>
          <span>{totalSteps} steps</span>
        </div>
      </div>

      <div className="flex items-center gap-0.5">
        {SPEED_OPTIONS.map(s => (
          <button
            key={s}
            onClick={() => onSpeedChange(s)}
            className={`px-2 py-1 text-[11px] rounded-lg transition-all font-medium ${
              speed === s
                ? 'bg-teal-500/15 text-teal-300 shadow-sm'
                : 'theme-text-dim hover:text-teal-500 hover:bg-teal-500/10'
            }`}
          >
            {s}x
          </button>
        ))}
      </div>
    </div>
  );
});
