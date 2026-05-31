import { useState, useCallback, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768);
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)');
    const handler = (e) => setIsMobile(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);
  return isMobile;
}

export default function Layout() {
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    if (isMobile) setSidebarOpen(false);
  }, [isMobile]);

  const toggleFullscreen = useCallback(() => {
    setIsFullscreen(prev => {
      if (!prev) setSidebarOpen(false);
      return !prev;
    });
  }, []);

  const toggleSidebar = useCallback(() => setSidebarOpen(v => !v), []);

  return (
    <div className="flex h-screen overflow-hidden">
      {!isFullscreen && (
        <>
          {isMobile && sidebarOpen && (
            <div
              className="fixed inset-0 bg-black/50 z-40 md:hidden"
              onClick={() => setSidebarOpen(false)}
            />
          )}
          <div className={isMobile ? 'fixed inset-y-0 left-0 z-50' : ''} style={isMobile && !sidebarOpen ? { display: 'none' } : undefined}>
            <Sidebar open={sidebarOpen} onToggle={toggleSidebar} isMobile={isMobile} />
          </div>
        </>
      )}
      <div className="flex-1 flex flex-col overflow-hidden">
        {!isFullscreen && (
          <Header onToggleSidebar={toggleSidebar} sidebarOpen={!isMobile && sidebarOpen} />
        )}
        <main className="flex-1 overflow-auto">
          <Outlet context={{ isFullscreen, toggleFullscreen }} />
        </main>
      </div>
    </div>
  );
}
