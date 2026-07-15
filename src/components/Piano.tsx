import React, { useMemo, useRef, useState, useEffect, useCallback } from 'react';
import { useMusic } from '../hooks/useMusic';
import { usePianoLayout } from '../hooks/usePianoLayout';
import { useMidiInput } from '../hooks/useMidiInput';
import { useGlissando } from '../hooks/useGlissando';
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
  adjustHeight = false,
}: PianoProps) {
  const { state, settings, audio } = useMusic();
  const pianoContainerRef = useRef<HTMLDivElement>(null);

  // Roving tabindex: only one key is a tab stop at a time. `focusedIndex` is the
  // active key; ArrowLeft/ArrowRight move it. Refs to each key's DOM node let us
  // move focus programmatically.
  const [focusedIndex, setFocusedIndex] = useState(0);
  const keyRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Track glissando state (mouse down or touch active)
  const [isGlissandoActive, setIsGlissandoActive] = useState(false);

  // Track the note currently under the finger during a touch glissando, so its
  // pressed visual follows the finger across keys (touchmove never retargets to
  // the keys the finger slides onto, so they can't light themselves up).
  const [glissandoNote, setGlissandoNote] = useState<string | null>(null);

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

  // Map each key's identifier (its aria-label, e.g. "C#4") to its frequency so
  // the glissando hook — which resolves keys by aria-label under the pointer —
  // can play them.
  const noteFrequencies = useMemo(() => {
    const map = new Map<string, number>();
    keys.forEach((keyData) => map.set(keyData.note, keyData.frequency));
    return map;
  }, [keys]);

  // Get scale notes for highlighting
  const scaleNotes = useMemo(() => {
    const notes = getScaleNotes(state.key, state.mode);
    return new Set(notes);
  }, [state.key, state.mode]);

  // Get chord notes for highlighting (only when keyboard preview is enabled)
  const chordNotes = useMemo(() => {
    const notes = new Set<Note>();
    if (settings.ui.piano.keyboardPreviewEnabled) {
      state.selectedChords.forEach((chord) => {
        const rootIndex = NOTES.indexOf(chord.rootNote);
        chord.intervals.forEach((interval) => {
          const noteIndex = (rootIndex + interval) % 12;
          notes.add(NOTES[noteIndex]);
        });
      });
    }
    return notes;
  }, [state.selectedChords, settings.ui.piano.keyboardPreviewEnabled]);

  const handleKeyPress = async (frequency: number) => {
    await audio.playNote(frequency);
  };

  // Keep the roving tab stop in bounds when the key count changes (e.g. the
  // flexible layout adds/removes octaves), so a valid key always has tabIndex 0.
  useEffect(() => {
    setFocusedIndex((i) => Math.min(i, keys.length - 1));
  }, [keys.length]);

  // Arrow-key navigation for the roving tabindex. Handled on the container so a
  // single listener covers every key; Enter/Space bubble past it untouched.
  const handleKeyboardNav = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
      e.preventDefault();
      const delta = e.key === 'ArrowRight' ? 1 : -1;
      const next = Math.min(Math.max(focusedIndex + delta, 0), keys.length - 1);
      if (next === focusedIndex) return;
      setFocusedIndex(next);
      keyRefs.current[next]?.focus();
    },
    [focusedIndex, keys.length]
  );

  // Touch glissando: play each key the finger slides onto exactly once and mark
  // it as the pressed key. The initial note is played by the key's own
  // touch-start handler, so the hook is configured with `triggerOnStart: false`
  // to avoid double-triggering it.
  const handleGlissandoTrigger = useCallback(
    (note: string) => {
      const frequency = noteFrequencies.get(note);
      if (frequency === undefined) return;
      setGlissandoNote(note);
      audio.playNote(frequency);
    },
    [noteFrequencies, audio]
  );

  const getKeyIdentifier = useCallback(
    (element: Element) => element.getAttribute('aria-label'),
    []
  );

  const glissando = useGlissando<string>({
    onTrigger: handleGlissandoTrigger,
    selector: '.piano-key',
    getIdentifier: getKeyIdentifier,
    triggerOnStart: false,
  });

  // MIDI to frequency conversion
  const midiToFrequency = useCallback((midiNote: number): number => {
    return 440 * Math.pow(2, (midiNote - 69) / 12);
  }, []);

  // MIDI note handlers
  const handleMidiNoteOn = useCallback(
    (midiNote: number, velocity: number) => {
      const frequency = midiToFrequency(midiNote);
      const volume = (velocity / 127) * 0.8; // Normalize velocity to 0-0.8

      // Add to active MIDI notes
      setActiveMidiNotes((prev) => new Set(prev).add(midiNote));

      audio.playNote(frequency, 0.3, volume);
    },
    [midiToFrequency, audio]
  );

  const handleMidiNoteOff = useCallback((midiNote: number) => {
    // Remove from active MIDI notes
    setActiveMidiNotes((prev) => {
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
      setGlissandoNote(null);
    };

    window.addEventListener('mouseup', handleGlobalMouseUp);
    window.addEventListener('touchend', handleGlobalTouchEnd);
    window.addEventListener('touchcancel', handleGlobalTouchEnd);

    return () => {
      window.removeEventListener('mouseup', handleGlobalMouseUp);
      window.removeEventListener('touchend', handleGlobalTouchEnd);
      window.removeEventListener('touchcancel', handleGlobalTouchEnd);
    };
  }, []);

  return (
    <div className="piano" ref={pianoContainerRef}>
      {midi.isConnected && (
        <div
          style={{
            position: 'absolute',
            top: '8px',
            left: '8px',
            padding: '4px 8px',
            background: '#22c55e',
            color: 'white',
            fontSize: '12px',
            borderRadius: '4px',
            zIndex: 10,
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <span
            style={{
              width: '8px',
              height: '8px',
              background: 'white',
              borderRadius: '50%',
              animation: 'pulse 2s infinite',
            }}
          />
          MIDI: {midi.devices[0]}
        </div>
      )}
      <div
        className={`piano-keys ${isGlissandoActive ? 'glissando-active' : ''}`}
        style={
          {
            '--white-key-count': whiteKeyCount,
            '--white-key-width': flexible ? `${layout.whiteKeyWidth}px` : undefined,
            '--white-key-height': flexible ? `${layout.whiteKeyHeight}px` : undefined,
            '--black-key-width': flexible ? `${layout.blackKeyWidth}px` : undefined,
            '--black-key-height': flexible ? `${layout.blackKeyHeight}px` : undefined,
          } as React.CSSProperties
        }
        onMouseDown={() => setIsGlissandoActive(true)}
        onTouchStart={(e) => {
          setIsGlissandoActive(true);
          glissando.handlers.onTouchStart(e);
        }}
        onTouchMove={glissando.handlers.onTouchMove}
        onTouchEnd={glissando.handlers.onTouchEnd}
        onTouchCancel={glissando.handlers.onTouchCancel}
        onKeyDown={handleKeyboardNav}
      >
        {keys.map((keyData, index) => (
          <PianoKey
            key={keyData.note}
            keyData={keyData}
            tabIndex={index === focusedIndex ? 0 : -1}
            onFocus={() => setFocusedIndex(index)}
            keyRef={(el) => {
              keyRefs.current[index] = el;
            }}
            onPress={handleKeyPress}
            isInScale={scaleNotes.has(keyData.baseNote)}
            isInChord={chordNotes.has(keyData.baseNote)}
            showScaleHighlighting={settings.ui.piano.showInScaleColors}
            showScaleDegree={showScaleDegrees}
            selectedKey={state.key}
            mode={state.mode}
            showScaleLabels={scaleNotes.has(keyData.baseNote)}
            isGlissandoActive={isGlissandoActive}
            isGlissandoPressed={glissandoNote === keyData.note}
            isMidiActive={activeMidiNotes.has(keyData.midiNumber)}
          />
        ))}
      </div>
    </div>
  );
}
