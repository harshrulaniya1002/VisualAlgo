import { useState, useRef, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { categories } from '../../data/categoryRegistry';
import { algorithmsByCategory } from '../../data/algorithmRegistry';

const CATEGORY_ICONS = {
  sorting: (
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
  ),
  searching: (
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
  ),
  'arrays-strings': (
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
  ),
  'linked-lists': (
    <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
  ),
  'stacks-queues': (
    <path strokeLinecap="round" strokeLinejoin="round" d="M6.429 9.75L2.25 12l4.179 2.25m0-4.5l5.571 3 5.571-3m-11.142 0L2.25 7.5 12 2.25l9.75 5.25-4.179 2.25m0 0L12 12.75 6.429 9.75m11.142 0l4.179 2.25L12 17.25 2.25 12l4.179-2.25" />
  ),
  hashing: (
    <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 8.25h15m-16.5 7.5h15m-1.8-13.5l-3.9 19.5m-2.1-19.5l-3.9 19.5" />
  ),
  trees: (
    <>
      <circle cx="12" cy="5" r="2" />
      <circle cx="7" cy="12" r="2" />
      <circle cx="17" cy="12" r="2" />
      <circle cx="4" cy="19" r="2" />
      <circle cx="10" cy="19" r="2" />
      <path strokeLinecap="round" d="M12 7v3l-5 2M12 10l5 2M7 14v3l-3 2M7 17l3 2" />
    </>
  ),
  'advanced-trees': (
    <>
      <circle cx="12" cy="4" r="1.5" />
      <circle cx="7" cy="10" r="1.5" />
      <circle cx="17" cy="10" r="1.5" />
      <circle cx="4" cy="16" r="1.5" />
      <circle cx="10" cy="16" r="1.5" />
      <circle cx="14" cy="16" r="1.5" />
      <circle cx="20" cy="16" r="1.5" />
      <path strokeLinecap="round" d="M12 5.5v3l-5 1.5M12 8.5l5 1.5M7 11.5v3l-3 1.5M7 14.5l3 1.5M17 11.5v3l-3 1.5M17 14.5l3 1.5" />
    </>
  ),
  heaps: (
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3L2 21h20L12 3zm0 4v8m-4 2h8" />
  ),
  'graph-traversal': (
    <>
      <circle cx="5" cy="6" r="2" />
      <circle cx="19" cy="6" r="2" />
      <circle cx="5" cy="18" r="2" />
      <circle cx="19" cy="18" r="2" />
      <circle cx="12" cy="12" r="2" />
      <path strokeLinecap="round" d="M7 6h10M7 18h10M5 8v8M19 8v8M7 7.5l3.5 3M14.5 13.5L17 16.5M7 16.5l3.5-3M14.5 10.5l2.5-3" />
    </>
  ),
  'shortest-paths': (
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z" />
  ),
  'mst-connectivity': (
    <>
      <circle cx="6" cy="6" r="2.5" />
      <circle cx="18" cy="6" r="2.5" />
      <circle cx="12" cy="18" r="2.5" />
      <path strokeLinecap="round" strokeWidth="2" d="M8.5 6h7M7.5 8l3.5 8M16.5 8l-3.5 8" />
    </>
  ),
  'network-flow': (
    <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
  ),
  'dynamic-programming': (
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.375 19.5h17.25m-17.25 0a1.125 1.125 0 01-1.125-1.125M3.375 19.5h7.5c.621 0 1.125-.504 1.125-1.125m-9.75 0V5.625m0 12.75v-1.5c0-.621.504-1.125 1.125-1.125m18.375 2.625V5.625m0 12.75c0 .621-.504 1.125-1.125 1.125m1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125m0 3.75h-7.5A1.125 1.125 0 0112 18.375m9.75-12.75c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125m19.5 0v1.5c0 .621-.504 1.125-1.125 1.125M2.25 5.625v1.5c0 .621.504 1.125 1.125 1.125m0 0h17.25m-17.25 0h7.5c.621 0 1.125.504 1.125 1.125M3.375 8.25c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125m17.25-3.75h-7.5c-.621 0-1.125.504-1.125 1.125m8.625-1.125c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125m-17.25 0h7.5m-7.5 0c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125M12 10.875v-1.5m0 1.5c0 .621-.504 1.125-1.125 1.125M12 10.875c0 .621.504 1.125 1.125 1.125m-2.25 0c.621 0 1.125.504 1.125 1.125M13.125 12h7.5m-7.5 0c-.621 0-1.125.504-1.125 1.125M20.625 12c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125m-17.25 0h7.5M12 14.625v-1.5m0 1.5c0 .621-.504 1.125-1.125 1.125M12 14.625c0 .621.504 1.125 1.125 1.125m-2.25 0c.621 0 1.125.504 1.125 1.125m0 0v1.5c0 .621-.504 1.125-1.125 1.125" />
  ),
  greedy: (
    <>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="5" />
      <circle cx="12" cy="12" r="1.5" fill="currentColor" />
    </>
  ),
  'divide-conquer': (
    <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 3.75H6A2.25 2.25 0 003.75 6v1.5M16.5 3.75H18A2.25 2.25 0 0120.25 6v1.5m0 9V18A2.25 2.25 0 0118 20.25h-1.5m-9 0H6A2.25 2.25 0 013.75 18v-1.5M15 12H9m6 0l-3-3m3 3l-3 3" />
  ),
  backtracking: (
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
  ),
  'string-algorithms': (
    <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
  ),
  'computational-geometry': (
    <>
      <polygon points="12,3 21,18 3,18" fill="none" />
      <circle cx="12" cy="3" r="1.5" fill="currentColor" />
      <circle cx="21" cy="18" r="1.5" fill="currentColor" />
      <circle cx="3" cy="18" r="1.5" fill="currentColor" />
    </>
  ),
  'number-theory': (
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 15.75V18m-7.5-6.75h.008v.008H8.25v-.008zm0 2.25h.008v.008H8.25V13.5zm0 2.25h.008v.008H8.25v-.008zm0 2.25h.008v.008H8.25V18zm2.498-6.75h.007v.008h-.007v-.008zm0 2.25h.007v.008h-.007V13.5zm0 2.25h.007v.008h-.007v-.008zm0 2.25h.007v.008h-.007V18zm2.504-6.75h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V13.5zm0 2.25h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V18zm2.498-6.75h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V13.5zM8.25 6h7.5v2.25h-7.5V6zM12 2.25c-1.892 0-3.758.11-5.593.322C5.307 2.7 4.5 3.65 4.5 4.757V19.5a2.25 2.25 0 002.25 2.25h10.5a2.25 2.25 0 002.25-2.25V4.757c0-1.108-.806-2.057-1.907-2.185A48.507 48.507 0 0012 2.25z" />
  ),
  'bit-manipulation': (
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
  ),
  'union-find': (
    <>
      <circle cx="8" cy="8" r="4" />
      <circle cx="16" cy="16" r="4" />
      <path strokeLinecap="round" d="M11 11l2 2" />
    </>
  ),
};

function CategoryIcon({ slug, className }) {
  const icon = CATEGORY_ICONS[slug];
  if (!icon) {
    return (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <circle cx="12" cy="12" r="9" />
      </svg>
    );
  }
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      {icon}
    </svg>
  );
}

export default function Sidebar({ open, onToggle, isMobile }) {
  const { slug } = useParams();
  const [expanded, setExpanded] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!open) setSearchQuery('');
  }, [open]);

  const filteredCategories = searchQuery
    ? categories.filter(cat => {
        const algos = algorithmsByCategory[cat.slug] || [];
        return (
          cat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          algos.some(a => a.name.toLowerCase().includes(searchQuery.toLowerCase()))
        );
      })
    : categories;

  const showExpanded = isMobile || open;

  return (
    <aside
      className="sidebar glass border-r theme-border flex flex-col h-screen sticky top-0 overflow-hidden"
      style={{ width: isMobile ? 288 : (open ? 288 : 60) }}
    >
      {/* Logo */}
      <div className="flex items-center border-b theme-border px-3 py-3.5 gap-2.5 min-h-[56px]">
        <Link to="/" className="flex items-center gap-2.5 flex-1 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-400 to-rose-500 flex items-center justify-center shadow-md shadow-teal-500/25 flex-shrink-0">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          {showExpanded && (
            <div className="animate-fade-in min-w-0">
              <h1 className="text-lg font-bold text-zinc-900 dark:text-white leading-tight truncate">
                Visual<span className="text-gradient">Algo</span>
              </h1>
              <p className="text-[10px] text-zinc-500 truncate">DSA Visualization Platform</p>
            </div>
          )}
        </Link>
        <button
          onClick={onToggle}
          className="p-1.5 rounded-lg theme-text-muted hover:text-teal-500 hover:bg-teal-500/10 transition-all flex-shrink-0"
          title={isMobile ? 'Close sidebar' : (open ? 'Collapse sidebar' : 'Expand sidebar')}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            {isMobile ? (
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            ) : open ? (
              <path strokeLinecap="round" strokeLinejoin="round" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
            )}
          </svg>
        </button>
      </div>

      {/* Search */}
      {showExpanded && (
        <div className="px-3 py-2.5 animate-fade-in">
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search algorithms..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-3 py-2 theme-input border rounded-xl text-sm placeholder-zinc-600 focus:outline-none focus:border-teal-400/40 focus:ring-1 focus:ring-teal-400/15 transition-all"
            />
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-2 pb-4 pt-1">
        {filteredCategories.map(cat => {
          const algos = algorithmsByCategory[cat.slug] || [];
          const isExpanded = expanded === cat.slug;
          const filteredAlgos = searchQuery
            ? algos.filter(a => a.name.toLowerCase().includes(searchQuery.toLowerCase()))
            : algos;
          const implemented = algos.filter(a => a.implemented).length;

          return (
            <div key={cat.slug} className="mb-0.5">
              <button
                onClick={() => {
                  if (!showExpanded) {
                    onToggle();
                    setExpanded(cat.slug);
                  } else {
                    setExpanded(isExpanded ? null : cat.slug);
                  }
                }}
                className={`w-full flex items-center gap-2.5 rounded-xl text-sm font-medium transition-all ${
                  showExpanded ? 'px-3 py-2' : 'px-0 py-2 justify-center'
                } ${
                  isExpanded && showExpanded
                    ? 'theme-bg-muted theme-text-primary border theme-border'
                    : 'theme-text-tertiary hover:text-teal-500 theme-hover-bg border border-transparent'
                }`}
                title={!showExpanded ? cat.name : undefined}
              >
                <CategoryIcon
                  slug={cat.slug}
                  className={`w-[18px] h-[18px] flex-shrink-0 transition-colors ${
                    isExpanded && showExpanded ? 'text-teal-400' : ''
                  }`}
                />
                {showExpanded && (
                  <>
                    <span className="flex-1 text-left truncate">{cat.name}</span>
                    {implemented > 0 && (
                      <span className="text-[10px] font-semibold text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded-full">
                        {implemented}
                      </span>
                    )}
                    <span className="text-[10px] text-zinc-600">{algos.length}</span>
                    <svg
                      className={`w-3 h-3 transition-transform duration-300 flex-shrink-0 text-zinc-600 ${
                        isExpanded ? 'rotate-90' : ''
                      }`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </>
                )}
              </button>

              {showExpanded && (
                <div className={`sidebar-section-content ${isExpanded ? 'open' : ''}`}>
                  <div>
                    <div className="ml-4 mt-1 mb-1 space-y-0.5 border-l theme-border pl-2">
                      {filteredAlgos.map((algo, i) => (
                        <Link
                          key={algo.slug}
                          to={`/algo/${algo.slug}`}
                          className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[13px] transition-all ${
                            slug === algo.slug
                              ? 'bg-teal-500/12 text-teal-300 font-medium border border-teal-500/15'
                              : algo.implemented
                              ? 'theme-text-tertiary hover:text-teal-500 theme-hover-bg'
                              : 'theme-text-dim hover:text-teal-500 theme-hover-bg'
                          }`}
                          style={{ transitionDelay: isExpanded ? `${i * 20}ms` : '0ms' }}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                            slug === algo.slug ? 'bg-teal-400' : algo.implemented ? 'bg-emerald-400' : 'bg-zinc-700'
                          }`} />
                          <span className="truncate">{algo.name}</span>
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Footer */}
      {showExpanded && (
        <div className="px-4 py-3 border-t theme-border animate-fade-in">
          <div className="flex items-center justify-between text-xs text-zinc-500">
            <span>{Object.values(algorithmsByCategory).flat().length}+ Algorithms</span>
            <span className="text-emerald-400">
              {Object.values(algorithmsByCategory).flat().filter(a => a.implemented).length} Ready
            </span>
          </div>
        </div>
      )}
    </aside>
  );
}
