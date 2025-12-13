import { useCallback, useEffect } from 'react';
import { Piano } from './Piano';
import { ChordStrip } from './ChordStrip';
import { useSettings } from '../hooks/useSettings';
import { useMusic } from '../hooks/useMusic';
import { useResizable } from '../hooks/useResizable';
import { SIZES } from '../config';
import './LearnMode.css';

export function LearnMode() {
  const { settings, setLearnTabletPianoHeight } = useSettings();
  const { state, actions } = useMusic();

  // Resizable piano height
  const handlePianoResize = useCallback(
    (newHeight: number) => {
      setLearnTabletPianoHeight(newHeight);
    },
    [setLearnTabletPianoHeight]
  );

  const {
    height: pianoHeight,
    isResizing: isPianoResizing,
    handleMouseDown: handlePianoMouseDown,
    handleTouchStart: handlePianoTouchStart,
    setHeight: setPianoHeight,
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

  return (
    <div className="learn-mode learn-mode-tablet">
      {/* Flexible area that fills remaining space above piano */}
      <div className="tablet-content-area">
        {/* Compact horizontal chord strip showing all diatonic chords */}
        <div className="tablet-chord-strip-area">
          <ChordStrip />
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
        {/* Piano controls - top right floating */}
        <div className="piano-floating-controls">
          <label className="piano-control-toggle" title="Show scale notes on piano">
            <input
              type="checkbox"
              checked={state.showInScaleColors}
              onChange={actions.toggleInScaleColors}
              className="control-checkbox"
            />
            <span className="control-label">Scale</span>
          </label>
          <label className="piano-control-toggle" title="Highlight selected chord on piano">
            <input
              type="checkbox"
              checked={state.keyboardPreviewEnabled}
              onChange={actions.toggleChordHighlight}
              className="control-checkbox"
            />
            <span className="control-label">Chord</span>
          </label>
        </div>
        <Piano startOctave={4} octaveCount={2} showScaleDegrees={true} adjustHeight={true} />
      </div>
    </div>
  );
}
