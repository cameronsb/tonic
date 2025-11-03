import { useCallback, useEffect, useState } from 'react';
import { Piano } from './Piano';
import { ChordDisplay } from './ChordDisplay';
import { useSettings } from '../hooks/useSettings';
import { useResizableHorizontal } from '../hooks/useResizableHorizontal';
import './LearnMode.css';

export function LearnMode() {
  const { settings, setLearnSidebarWidth, setLearnSidebarOpen } = useSettings();
  const isSidebarOpen = settings.ui.learnSidebar.isOpen;
  const [isTabletView, setIsTabletView] = useState(window.innerWidth <= 1024);

  // Check if we're in tablet view
  useEffect(() => {
    const handleResize = () => {
      setIsTabletView(window.innerWidth <= 1024);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleSidebar = useCallback(() => {
    setLearnSidebarOpen(!isSidebarOpen);
  }, [isSidebarOpen, setLearnSidebarOpen]);

  // Resizable sidebar width
  const handleResize = useCallback((newWidth: number) => {
    setLearnSidebarWidth(newWidth);
  }, [setLearnSidebarWidth]);

  const { width: sidebarWidth, isResizing, handleMouseDown, setWidth } = useResizableHorizontal({
    initialWidth: settings.ui.learnSidebar.width,
    minWidth: 280,
    maxWidth: 600,
    onResize: handleResize,
  });

  // Update width from settings if it changes
  useEffect(() => {
    setWidth(settings.ui.learnSidebar.width);
  }, [settings.ui.learnSidebar.width, setWidth]);

  // Tablet-optimized layout
  if (isTabletView) {
    return (
      <div className="learn-mode learn-mode-tablet">
        <div className="tablet-diatonic-chords">
          <ChordDisplay layout="diatonic-only" />
        </div>
        <div className="tablet-piano-container">
          <Piano startOctave={4} octaveCount={2} showScaleDegrees={true} />
        </div>
        <div className="tablet-borrowed-chords">
          <ChordDisplay layout="borrowed-only" />
        </div>
      </div>
    );
  }

  // Desktop layout
  return (
    <div
      className={`learn-mode learn-mode-sidebar ${isSidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}
      style={{
        gridTemplateColumns: isSidebarOpen ? `${sidebarWidth}px 1fr` : '0px 1fr',
      }}
    >
      {/* Backdrop overlay for mobile */}
      {isSidebarOpen && (
        <div
          className="sidebar-backdrop"
          onClick={toggleSidebar}
          aria-hidden="true"
        />
      )}

      {/* Collapsible sidebar */}
      <aside
        className={`chord-sidebar ${isSidebarOpen ? 'open' : 'closed'}`}
        style={{ width: sidebarWidth }}
      >
        <button
          className="sidebar-close-btn"
          onClick={toggleSidebar}
          aria-label="Close chord sidebar"
          title="Close sidebar"
        >
          ×
        </button>
        <ChordDisplay layout="sidebar" />
      </aside>

      {/* Resize handle */}
      {isSidebarOpen && (
        <div
          className={`sidebar-resize-handle ${isResizing ? 'resizing' : ''}`}
          onMouseDown={handleMouseDown}
          title="Drag to resize sidebar"
          style={{ left: sidebarWidth }}
        >
          <div className="sidebar-resize-indicator" />
        </div>
      )}

      {/* Main piano area */}
      <main className="piano-main">
        <Piano startOctave={4} octaveCount={2} showScaleDegrees={true} />

        {/* Floating Action Button to open sidebar */}
        {!isSidebarOpen && (
          <button
            className="sidebar-fab"
            onClick={toggleSidebar}
            aria-label="Open chord sidebar"
            title="Show chords"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect width="18" height="18" x="3" y="3" rx="2"/>
              <path d="M9 3v18"/>
            </svg>
          </button>
        )}
      </main>
    </div>
  );
}
