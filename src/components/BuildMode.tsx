import React from 'react';
import { useMusic } from '../hooks/useMusic';
import { ChordPalette } from './ChordPalette';
import { ChordTimeline } from './ChordTimeline';
import { Piano } from './Piano';
import './BuildMode.css';

export function BuildMode() {
  const { actions } = useMusic();

  // Set to build mode when component mounts
  React.useEffect(() => {
    actions.setChordDisplayMode('build');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="build-mode">
      <div className="build-mode-top">
        <div className="chord-palette-container">
          <ChordPalette />
        </div>
        <div className="timeline-container">
          <ChordTimeline />
        </div>
      </div>
      <div className="build-mode-bottom">
        <Piano showScaleDegrees={false} />
      </div>
    </div>
  );
}
