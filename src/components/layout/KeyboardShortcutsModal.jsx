import { useEffect } from 'react';

const SHORTCUTS = [
  { keys: ['Space'], action: 'Play / Pause', scope: 'Visualization' },
  { keys: ['Arrow Right'], action: 'Step Forward', scope: 'Visualization' },
  { keys: ['Arrow Left'], action: 'Step Back', scope: 'Visualization' },
  { keys: ['R'], action: 'Reset', scope: 'Visualization' },
  { keys: ['F'], action: 'Toggle Fullscreen', scope: 'Visualization' },
  { keys: ['Ctrl', 'K'], action: 'Focus Search', scope: 'Global' },
  { keys: ['Escape'], action: 'Close / Clear', scope: 'Global' },
  { keys: ['?'], action: 'Keyboard Shortcuts', scope: 'Global' },
];

export default function KeyboardShortcutsModal({ onClose }) {
  useEffect(() => {
    function handleKey(e) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-md mx-4 theme-surface theme-border rounded-2xl shadow-2xl shadow-black/40 animate-scale-in overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b theme-border-color">
          <h2 className="text-lg font-bold theme-text">Keyboard Shortcuts</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg theme-text-muted hover:theme-text transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
          {['Visualization', 'Global'].map(scope => (
            <div key={scope}>
              <h3 className="text-xs font-semibold uppercase tracking-wider theme-text-muted mb-3">{scope}</h3>
              <div className="space-y-2">
                {SHORTCUTS.filter(s => s.scope === scope).map(shortcut => (
                  <div key={shortcut.action} className="flex items-center justify-between py-1.5">
                    <span className="text-sm theme-text">{shortcut.action}</span>
                    <div className="flex items-center gap-1">
                      {shortcut.keys.map((key, i) => (
                        <span key={i}>
                          {i > 0 && <span className="text-xs theme-text-muted mx-0.5">+</span>}
                          <kbd className="inline-flex items-center px-2 py-1 text-xs font-mono rounded-lg theme-kbd">
                            {key}
                          </kbd>
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
