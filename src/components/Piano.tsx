import React, { useMemo } from 'react';
import { useMusic } from '../hooks/useMusic';
import { PianoKey } from './PianoKey';
import { generatePianoKeys, getWhiteKeyCount } from '../utils/pianoUtils';
import { getScaleNotes, NOTES } from '../utils/musicTheory';
import type { Note } from '../types/music';
import './Piano.css';

interface PianoProps {
  startOctave?: number;
  octaveCount?: number;
  showScaleDegrees?: boolean;
}

export function Piano({
  startOctave = 4,
  octaveCount = 2,
  showScaleDegrees = false
}: PianoProps) {
  const { state, audio, actions } = useMusic();

  // Generate piano keys
  const keys = useMemo(() => {
    return generatePianoKeys(startOctave, octaveCount);
  }, [startOctave, octaveCount]);

  const whiteKeyCount = useMemo(() => getWhiteKeyCount(keys), [keys]);

  // Get scale notes for highlighting
  const scaleNotes = useMemo(() => {
    const notes = getScaleNotes(state.song.key, state.song.mode);
    return new Set(notes);
  }, [state.song.key, state.song.mode]);

  // Get chord notes for highlighting
  const chordNotes = useMemo(() => {
    const notes = new Set<Note>();
    state.selectedChords.forEach((chord) => {
      const rootIndex = NOTES.indexOf(chord.rootNote);
      chord.intervals.forEach((interval) => {
        const noteIndex = (rootIndex + interval) % 12;
        notes.add(NOTES[noteIndex]);
      });
    });
    return notes;
  }, [state.selectedChords]);

  const handleKeyPress = async (frequency: number) => {
    await audio.playNote(frequency);
  };

  return (
    <div className="piano">
      {/* In-scale colors toggle */}
      <label className="in-scale-colors-control">
        <input
          type="checkbox"
          checked={state.showInScaleColors}
          onChange={actions.toggleInScaleColors}
          className="in-scale-colors-checkbox"
        />
        <span className="in-scale-colors-text">
          Highlight scale notes
        </span>
      </label>

      <div
        className="piano-keys"
        style={{
          '--white-key-count': whiteKeyCount,
        } as React.CSSProperties}
      >
        {keys.map((keyData) => (
          <PianoKey
            key={keyData.note}
            keyData={keyData}
            onPress={handleKeyPress}
            isInScale={state.showInScaleColors && scaleNotes.has(keyData.baseNote)}
            isInChord={chordNotes.has(keyData.baseNote)}
            showScaleDegree={showScaleDegrees}
            selectedKey={state.song.key}
            mode={state.song.mode}
            showScaleLabels={state.keyboardPreviewEnabled && scaleNotes.has(keyData.baseNote)}
          />
        ))}
      </div>
    </div>
  );
}
