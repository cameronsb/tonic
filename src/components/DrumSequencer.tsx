import React from 'react';
import { useMusic } from '../hooks/useMusic';
import './DrumSequencer.css';

interface DrumSequencerProps {
  measure: number;
}

type DrumType = 'kick' | 'snare' | 'hihat';

const DRUM_LABELS: { type: DrumType; label: string; color: string }[] = [
  { type: 'kick', label: 'Kick', color: '#e74c3c' },
  { type: 'snare', label: 'Snare', color: '#3498db' },
  { type: 'hihat', label: 'Hi-Hat', color: '#f39c12' },
];

export function DrumSequencer({ measure }: DrumSequencerProps) {
  const { state, audio, actions } = useMusic();

  // Find or create drum pattern for this measure
  const pattern = state.song.tracks.drums.patterns.find(p => p.measure === measure);

  const toggleStep = (drumType: DrumType, step: number) => {
    // Toggle the step in state
    actions.toggleDrumStep(measure, drumType, step);

    // Preview the drum sound
    if (drumType === 'kick') audio.playKick();
    else if (drumType === 'snare') audio.playSnare();
    else if (drumType === 'hihat') audio.playHiHat();
  };

  const getStepActive = (drumType: DrumType, step: number): boolean => {
    if (!pattern) return false;
    return pattern[drumType][step];
  };

  return (
    <div className="drum-sequencer">
      <div className="drum-sequencer-header">
        <div className="measure-label">M{measure + 1}</div>
      </div>
      <div className="drum-grid">
        {DRUM_LABELS.map(({ type, label, color }) => (
          <div key={type} className="drum-row">
            <div className="drum-label" style={{ color }}>
              {label}
            </div>
            <div className="drum-steps">
              {Array.from({ length: 16 }).map((_, step) => (
                <button
                  key={step}
                  className={`drum-step ${getStepActive(type, step) ? 'active' : ''} ${
                    step % 4 === 0 ? 'beat-marker' : ''
                  }`}
                  onClick={() => toggleStep(type, step)}
                  style={{
                    '--drum-color': color,
                  } as React.CSSProperties}
                  title={`${label} - Step ${step + 1}`}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
