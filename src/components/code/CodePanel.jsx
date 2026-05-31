import React, { useMemo } from 'react';

export default React.memo(function CodePanel({ pseudocode = [], currentLine = -1, codeImplementations = {} }) {
  const languages = useMemo(() => Object.keys(codeImplementations), [codeImplementations]);
  const hasImpl = languages.length > 0;

  return (
    <div className="flex flex-col">
      <div className="px-4 py-3 border-b theme-border flex items-center gap-2">
        <svg className="w-4 h-4 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
        </svg>
        <h3 className="text-sm font-semibold theme-text-secondary">Pseudocode</h3>
      </div>

      <div className="flex-1 overflow-auto p-3 font-mono text-[13px] leading-relaxed">
        {pseudocode.map((line, index) => {
          const isActive = index === currentLine;
          const indent = line.match(/^(\s*)/)[0].length;

          return (
            <div
              key={index}
              className={`flex items-start rounded-lg px-2 py-1 transition-all duration-200 ${
                isActive
                  ? 'bg-yellow-500/15 border-l-2 border-yellow-400'
                  : 'border-l-2 border-transparent theme-hover-bg'
              }`}
            >
              <span className="w-5 text-right mr-3 text-gray-700 select-none text-[11px] leading-6 font-mono">
                {index + 1}
              </span>
              <span
                className={`${isActive ? 'text-yellow-300 font-medium' : 'text-gray-500'} transition-colors duration-200`}
                style={{ paddingLeft: indent * 10 }}
              >
                {line.trim()}
              </span>
            </div>
          );
        })}
      </div>

      {hasImpl && (
        <div className="border-t theme-border">
          <details className="group">
            <summary className="px-4 py-2.5 text-xs theme-text-dim cursor-pointer hover:text-teal-500 transition-colors flex items-center gap-2">
              <svg className="w-3.5 h-3.5 transition-transform group-open:rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              Code ({languages.join(', ')})
            </summary>
            <div className="px-4 pb-3 max-h-64 overflow-auto">
              {languages.map(lang => (
                <div key={lang} className="mb-3">
                  <span className="text-[10px] font-semibold text-teal-400 uppercase tracking-wider">{lang}</span>
                  <pre className="mt-1 text-xs theme-text-tertiary whitespace-pre-wrap theme-bg-subtle rounded-xl p-3 border theme-border">
                    {codeImplementations[lang]}
                  </pre>
                </div>
              ))}
            </div>
          </details>
        </div>
      )}
    </div>
  );
});
