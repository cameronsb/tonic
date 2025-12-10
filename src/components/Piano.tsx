import React, { useMemo, useRef, useState, useEffect, useCallback } from 'react';
import { useMusic } from '../hooks/useMusic';
import { usePianoLayout } from '../hooks/usePianoLayout';
import { useMidiInput } from '../hooks/useMidiInput';
import { PianoKey } from './PianoKey';
import { generatePianoKeys, getWhiteKeyCount } from '../utils/pianoUtils';
import { getScaleNotes, NOTES } from '../utils/musicTheory';
import type { Note } from '../types/music';
import './Piano.css';

interface PianoProps {
  startOctave?: number;
  octaveCount?: number;
  showScaleDegrees?: boolean;
  flexible?: boolean; // Enable dynamic width (octave count) based on container
  adjustHeight?: boolean; // Enable dynamic height adjustment (disabled by default)
}

export function Piano({
  startOctave = 4,
  octaveCount = 2,
  showScaleDegrees = false,
  flexible = true,
  adjustHeight = false
}: PianoProps) {
  const { state, audio } = useMusic();
  const pianoContainerRef = useRef<HTMLDivElement>(null);

  // Track glissando state (mouse down or touch active)
  const [isGlissandoActive, setIsGlissandoActive] = useState(false);

  // Track active MIDI notes
  const [activeMidiNotes, setActiveMidiNotes] = useState<Set<number>>(new Set());

  // Use flexible layout if enabled
  const layout = usePianoLayout(pianoContainerRef as React.RefObject<HTMLDivElement>, {
    startOctave,
    octaveCount,
    adjustHeight,
  });

  // Use layout values if flexible, otherwise use props
  const effectiveStartOctave = flexible ? layout.startOctave : startOctave;
  const effectiveOctaveCount = flexible ? layout.octaveCount : octaveCount;

  // Generate piano keys
  const keys = useMemo(() => {
    return generatePianoKeys(effectiveStartOctave, effectiveOctaveCount);
  }, [effectiveStartOctave, effectiveOctaveCount]);

  const whiteKeyCount = useMemo(() => getWhiteKeyCount(keys), [keys]);

  // Get scale notes for highlighting
  const scaleNotes = useMemo(() => {
    const notes = getScaleNotes(state.key, state.mode);
    return new Set(notes);
  }, [state.key, state.mode]);

  // Get chord notes for highlighting (only when keyboard preview is enabled)
  const chordNotes = useMemo(() => {
    const notes = new Set<Note>();
    if (state.keyboardPreviewEnabled) {
      state.selectedChords.forEach((chord) => {
        const rootIndex = NOTES.indexOf(chord.rootNote);
        chord.intervals.forEach((interval) => {
          const noteIndex = (rootIndex + interval) % 12;
          notes.add(NOTES[noteIndex]);
        });
      });
    }
    return notes;
  }, [state.selectedChords, state.keyboardPreviewEnabled]);

  const handleKeyPress = async (frequency: number) => {
    await audio.playNote(frequency);
  };

  // MIDI to frequency conversion
  const midiToFrequency = useCallback((midiNote: number): number => {
    return 440 * Math.pow(2, (midiNote - 69) / 12);
  }, []);

  // MIDI note handlers
  const handleMidiNoteOn = useCallback((midiNote: number, velocity: number) => {
    const frequency = midiToFrequency(midiNote);
    const volume = (velocity / 127) * 0.8; // Normalize velocity to 0-0.8

    // Add to active MIDI notes
    setActiveMidiNotes(prev => new Set(prev).add(midiNote));

    audio.playNote(frequency, 0.3, volume);
  }, [midiToFrequency, audio]);

  const handleMidiNoteOff = useCallback((midiNote: number) => {
    // Remove from active MIDI notes
    setActiveMidiNotes(prev => {
      const next = new Set(prev);
      next.delete(midiNote);
      return next;
    });
  }, []);

  // Initialize MIDI
  const midi = useMidiInput({
    onNoteOn: handleMidiNoteOn,
    onNoteOff: handleMidiNoteOff,
  });

  // MIDI status is available via midi.isConnected and midi.devices

  // Global mouse up listener to end glissando
  useEffect(() => {
    const handleGlobalMouseUp = () => {
      setIsGlissandoActive(false);
    };

    const handleGlobalTouchEnd = () => {
      setIsGlissandoActive(false);
    };

    window.addEventListener('mouseup', handleGlobalMouseUp);
    window.addEventListener('touchend', handleGlobalTouchEnd);

    return () => {
      window.removeEventListener('mouseup', handleGlobalMouseUp);
      window.removeEventListener('touchend', handleGlobalTouchEnd);
    };
  }, []);

  return (
    <div className="piano" ref={pianoContainerRef}>
      {midi.isConnected && (
        <div style={{
          position: 'absolute',
          top: '8px',
          right: '8px',
          padding: '4px 8px',
          background: '#22c55e',
          color: 'white',
          fontSize: '12px',
          borderRadius: '4px',
          zIndex: 10,
          display: 'flex',
          alignItems: 'center',
          gap: '6px'
        }}>
          <span style={{
            width: '8px',
            height: '8px',
            background: 'white',
            borderRadius: '50%',
            animation: 'pulse 2s infinite'
          }} />
          MIDI: {midi.devices[0]}
        </div>
      )}
      <div
        className={`piano-keys ${isGlissandoActive ? 'glissando-active' : ''}`}
        style={{
          '--white-key-count': whiteKeyCount,
          '--white-key-width': flexible ? `${layout.whiteKeyWidth}px` : undefined,
          '--white-key-height': flexible ? `${layout.whiteKeyHeight}px` : undefined,
          '--black-key-width': flexible ? `${layout.blackKeyWidth}px` : undefined,
          '--black-key-height': flexible ? `${layout.blackKeyHeight}px` : undefined,
        } as React.CSSProperties}
        onMouseDown={() => setIsGlissandoActive(true)}
        onTouchStart={() => setIsGlissandoActive(true)}
      >
        {keys.map((keyData) => (
          <PianoKey
            key={keyData.note}
            keyData={keyData}
            onPress={handleKeyPress}
            isInScale={scaleNotes.has(keyData.baseNote)}
            isInChord={chordNotes.has(keyData.baseNote)}
            showScaleHighlighting={state.showInScaleColors}
            showScaleDegree={showScaleDegrees}
            selectedKey={state.key}
            mode={state.mode}
            showScaleLabels={scaleNotes.has(keyData.baseNote)}
            isGlissandoActive={isGlissandoActive}
            isMidiActive={activeMidiNotes.has(keyData.midiNumber)}
          />
        ))}
      </div>
    </div>
  );
}
