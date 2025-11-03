import { useState } from 'react';
import { useMusic } from '../hooks/useMusic';
import { VolumeSlider } from './VolumeSlider';
import './VolumeControl.css';

export function VolumeControl() {
  const { settings, actions } = useMusic();
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="volume-control">
      <button
        className="volume-control-header"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="volume-control-title">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ marginRight: 8 }}>
            <path d="M2 5v6h3l4 3V2L5 5H2z" fill="currentColor" />
            <path d="M10 4.5c1.2 1.2 1.8 2.8 1.8 4.5s-.6 3.3-1.8 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <span>Master Volume</span>
        </div>
        <svg
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
          style={{
            transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s ease'
          }}
        >
          <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      <div className={`volume-control-content ${isExpanded ? 'expanded' : ''}`}>
        <VolumeSlider
          value={settings.volume.master}
          onChange={actions.setMasterVolume}
          color="#667eea"
          label="Master"
        />

        {isExpanded && (
          <>
            <div className="volume-divider" />
            <div className="track-volumes">
              <VolumeSlider
                value={settings.volume.tracks.chords}
                onChange={(v) => actions.setTrackVolume('chords', v)}
                color="#764ba2"
                label="Chords"
              />
              <VolumeSlider
                value={settings.volume.tracks.melody}
                onChange={(v) => actions.setTrackVolume('melody', v)}
                color="#f093fb"
                label="Melody"
              />
              <VolumeSlider
                value={settings.volume.tracks.drums}
                onChange={(v) => actions.setTrackVolume('drums', v)}
                color="#4facfe"
                label="Drums"
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
