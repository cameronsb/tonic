import { useCallback, useEffect, useState } from 'react';
import { Piano } from '../../components/Piano';
import { ChordStripRework } from './ChordStripRework';
import { useSettings } from '../../hooks/useSettings';
import { useMusic } from '../../hooks/useMusic';
import { useResizableHorizontal } from '../../hooks/useResizableHorizontal';
import { useResizable } from '../../hooks/useResizable';
import { isIPad } from '../../utils/deviceDetection';
import { SIZES } from '../../config';
import './LearnModeRework.css';

export function LearnModeRework() {
  const { settings, setLearnSidebarWidth, setLearnSidebarOpen, setLearnTabletPianoHeight } = useSettings();
  const { state, actions } = useMusic();
  const isSidebarOpen = settings.ui.learnSidebar.isOpen;
  const [useTabletLayout, setUseTabletLayout] = useState(isIPad());

  // Check if we're on iPad
  useEffect(() => {
    // iPad detection is static, but we can re-check on resize in case of orientation change
    const handleResize = () => {
      setUseTabletLayout(isIPad());
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

  const { width: sidebarWidth, isResizing, handleMouseDown, handleTouchStart, setWidth } = useResizableHorizontal({
    initialWidth: settings.ui.learnSidebar.width,
    minWidth: SIZES.learnSidebar.min,
    maxWidth: SIZES.learnSidebar.max,
    onResize: handleResize,
  });

  // Update width from settings if it changes
  useEffect(() => {
    setWidth(settings.ui.learnSidebar.width);
  }, [settings.ui.learnSidebar.width, setWidth]);

  // Resizable piano height for tablet
  const handlePianoResize = useCallback((newHeight: number) => {
    setLearnTabletPianoHeight(newHeight);
  }, [setLearnTabletPianoHeight]);

  const {
    height: pianoHeight,
    isResizing: isPianoResizing,
    handleMouseDown: handlePianoMouseDown,
    handleTouchStart: handlePianoTouchStart,
    setHeight: setPianoHeight
  } = useResizable({
    initialHeight: settings.ui.learnTabletPiano.height,
    minHeight: SIZES.learnTabletPiano.min,
    maxHeight: SIZES.learnTabletPiano.max,
    onResize: handlePianoResize,
  });

  // Update piano height from settings if it changes
  useEffect(() => {
    setPianoHeight(settings.ui.learnTabletPiano.height);
  }, [settings.ui.learnTabletPiano.height, setPianoHeight]);

  // iPad-optimized layout with horizontal chord strip
  if (useTabletLayout) {
    return (
      <div className="learn-mode learn-mode-tablet">
        {/* Flexible area that fills remaining space above piano */}
        <div className="tablet-content-area">
          {/* Compact horizontal chord strip showing all diatonic chords */}
          <div className="tablet-chord-strip-area">
            <ChordStripRework />
          </div>
        </div>

        {/* Resize handle */}
        <div
          className={`tablet-piano-resize-handle ${isPianoResizing ? 'resizing' : ''}`}
          onMouseDown={handlePianoMouseDown}
          onTouchStart={handlePianoTouchStart}
          title="Drag to resize piano"
        >
          <div className="tablet-piano-resize-indicator" />
        </div>

        {/* Piano at bottom - fixed height, resizable */}
        <div className="tablet-piano-container" style={{ height: pianoHeight }}>
          {/* In-scale colors toggle */}
          <label className="tablet-piano-control">
            <input
              type="checkbox"
              checked={state.showInScaleColors}
              onChange={actions.toggleInScaleColors}
              className="piano-control-checkbox"
              title="Show scale notes on piano"
            />
            <span className="piano-control-text">
              Scale
            </span>
          </label>
          <Piano startOctave={4} octaveCount={2} showScaleDegrees={true} adjustHeight={true} />
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
        <ChordStripRework layout="sidebar" />
      </aside>

      {/* Resize handle */}
      {isSidebarOpen && (
        <div
          className={`sidebar-resize-handle ${isResizing ? 'resizing' : ''}`}
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
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
