import { Link } from 'react-router-dom';
import { useState, useEffect, useRef, useCallback } from 'react';
import { getAllAlgorithms } from '../../data/algorithmRegistry';
import { useTheme } from '../../contexts/ThemeContext';
import KeyboardShortcutsModal from './KeyboardShortcutsModal';

export default function Header({ onToggleSidebar, sidebarOpen }) {
  const [search, setSearch] = useState('');
  const [results, setResults] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const inputRef = useRef(null);
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    function handleKey(e) {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
      if (e.key === 'Escape') {
        setSearch('');
        setResults([]);
        setIsOpen(false);
        setShowShortcuts(false);
        inputRef.current?.blur();
      }
      if (e.key === '?' && e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
        e.preventDefault();
        setShowShortcuts(prev => !prev);
      }
    }
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  const handleSearch = useCallback((query) => {
    setSearch(query);
    if (query.length < 2) {
      setResults([]);
      setIsOpen(false);
      return;
    }
    const all = getAllAlgorithms();
    const matched = all
      .filter(a => a.name.toLowerCase().includes(query.toLowerCase()))
      .slice(0, 8);
    setResults(matched);
    setIsOpen(true);
  }, []);

  return (
    <>
      <header className="h-14 glass border-b theme-border flex items-center px-4 md:px-6 gap-2 md:gap-4 sticky top-0 z-40">
        {!sidebarOpen && (
          <button
            onClick={onToggleSidebar}
            className="p-2 -ml-2 rounded-lg theme-text-muted hover:text-teal-500 hover:bg-teal-500/10 transition-all"
            title="Open sidebar"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
          </button>
        )}
        <div className="relative flex-1 max-w-lg">
          <div className="relative">
            <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              ref={inputRef}
              type="text"
              placeholder="Search algorithms..."
              value={search}
              onChange={e => handleSearch(e.target.value)}
              onFocus={() => results.length > 0 && setIsOpen(true)}
              onBlur={() => setTimeout(() => setIsOpen(false), 200)}
              className="w-full pl-10 pr-16 py-2 theme-input border rounded-xl text-sm placeholder-zinc-600 focus:outline-none focus:border-teal-400/40 focus:ring-1 focus:ring-teal-400/15 transition-all"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 theme-kbd rounded text-[10px] font-mono">Ctrl</kbd>
              <kbd className="px-1.5 py-0.5 theme-kbd rounded text-[10px] font-mono">K</kbd>
            </div>
          </div>
          {isOpen && results.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 glass glass-border rounded-xl shadow-2xl shadow-black/40 overflow-hidden z-50 animate-scale-in">
              {results.map((algo) => (
                <Link
                  key={algo.slug}
                  to={`/algo/${algo.slug}`}
                  onClick={() => { setSearch(''); setResults([]); setIsOpen(false); }}
                  className="flex items-center gap-3 px-4 py-3 text-sm theme-text-secondary theme-hover-bg transition-colors border-b theme-border last:border-0"
                >
                  <span className={`w-2 h-2 rounded-full flex-shrink-0 ${algo.implemented ? 'bg-emerald-400' : 'bg-gray-600'}`} />
                  <span className="font-medium theme-text-primary">{algo.name}</span>
                  <span className="text-gray-600 text-xs ml-auto">{algo.category}</span>
                </Link>
              ))}
            </div>
          )}
        </div>

        <Link
          to="/compare"
          className="px-2 md:px-4 py-1.5 text-sm theme-text-muted hover:text-teal-500 transition-colors rounded-lg hover:bg-teal-500/10 flex items-center gap-1.5"
          title="Compare algorithms"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
          </svg>
          <span className="hidden md:inline">Compare</span>
        </Link>

        <Link
          to="/practice"
          className="px-2 md:px-4 py-1.5 text-sm theme-text-muted hover:text-teal-500 transition-colors rounded-lg hover:bg-teal-500/10"
          title="Practice problems"
        >
          <span className="hidden md:inline">Practice</span>
          <svg className="w-4 h-4 md:hidden" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342" />
          </svg>
        </Link>

        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg theme-text-muted hover:text-teal-500 hover:bg-teal-500/10 transition-all"
          title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        >
          {theme === 'dark' ? (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
            </svg>
          )}
        </button>

        <button
          onClick={() => setShowShortcuts(true)}
          className="p-2 rounded-lg theme-text-muted hover:text-teal-500 hover:bg-teal-500/10 transition-all"
          title="Keyboard shortcuts (?)"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
          </svg>
        </button>
      </header>

      {showShortcuts && <KeyboardShortcutsModal onClose={() => setShowShortcuts(false)} />}
    </>
  );
}
