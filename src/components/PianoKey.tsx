import {
  memo,
  useState,
  useCallback,
  useRef,
  type MouseEvent,
  type TouchEvent,
  type KeyboardEvent,
} from 'react';
import type { PianoKeyData } from '../utils/pianoUtils';
import { getScaleDegreeNumeral } from '../utils/musicTheory';
import type { Note } from '../types/music';
import './PianoKey.css';

interface PianoKeyProps {
  keyData: PianoKeyData;
  onPress: (frequency: number) => void;
  isInScale: boolean;
  isInChord: boolean;
  showScaleHighlighting?: boolean; // Whether scale toggle is ON (dims non-scale keys)
  showScaleDegree?: boolean;
  selectedKey: Note;
  mode: 'major' | 'minor';
  showScaleLabels?: boolean; // Show labels even without background highlighting
  isGlissandoActive?: boolean; // Whether glissando mode is active (mouse down or touch)
  isGlissandoPressed?: boolean; // Whether this key is the one under the finger during a touch glissando
  isMidiActive?: boolean; // Whether this key is currently pressed via MIDI
  tabIndex?: number; // Roving tabindex: 0 for the active key, -1 for the rest
  index?: number; // This key's index within the keyboard, forwarded to onFocus/keyRef so those callbacks can stay referentially stable in the parent
  onFocus?: (index: number) => void; // Notify parent so the focused key becomes the roving tab stop
  keyRef?: (index: number, el: HTMLDivElement | null) => void; // Register the DOM node so the parent can move focus
}

function PianoKeyImpl({
  keyData,
  onPress,
  isInScale,
  isInChord,
  showScaleHighlighting = false,
  showScaleDegree,
  selectedKey,
  mode,
  showScaleLabels = false,
  isGlissandoActive = false,
  isGlissandoPressed = false,
  isMidiActive = false,
  tabIndex = -1,
  index = -1,
  onFocus,
  keyRef,
}: PianoKeyProps) {
  // Separate mouse and touch tracking for correct multi-touch behavior
  const [isMousePressed, setIsMousePressed] = useState(false);

  // Use ref for touch IDs (avoids re-render on every touch change)
  // State tracks whether any touches are active (for re-rendering)
  const activeTouchesRef = useRef<Set<number>>(new Set());
  const [hasTouches, setHasTouches] = useState(false);

  // Separate keyboard tracking. Kept apart from isMousePressed because
  // keyboard focus can move (arrow-key roving tabindex) before keyup fires:
  // keydown presses key A, focus moves to key B, keyup lands on B, and A's
  // state would otherwise never clear. onBlur below clears it unconditionally
  // on focus loss so a rapid Enter+arrow sequence never leaves a key stuck.
  const [isKeyboardPressed, setIsKeyboardPressed] = useState(false);

  // Combined pressed state for visual feedback.
  // isGlissandoPressed lets a touch glissando light up keys the finger slides
  // onto — those keys never receive their own touch-start, so they can't set
  // hasTouches themselves.
  const isPressed = isMousePressed || hasTouches || isGlissandoPressed || isKeyboardPressed;

  // Play the note
  const playNote = useCallback(() => {
    onPress(keyData.frequency);
  }, [keyData.frequency, onPress]);

  // ===== Mouse Handlers =====

  const handleMouseDown = useCallback(
    (e: MouseEvent) => {
      e.preventDefault();
      setIsMousePressed(true);
      playNote();
    },
    [playNote]
  );

  const handleMouseUp = useCallback((e: MouseEvent) => {
    e.preventDefault();
    setIsMousePressed(false);
  }, []);

  const handleMouseEnter = useCallback(() => {
    // Play note when mouse enters while dragging (glissando)
    if (isGlissandoActive && !isMousePressed) {
      setIsMousePressed(true);
      playNote();
    }
  }, [isGlissandoActive, isMousePressed, playNote]);

  const handleMouseLeave = useCallback((e: MouseEvent) => {
    e.preventDefault();
    setIsMousePressed(false);
  }, []);

  // ===== Touch Handlers =====
  // Properly handles multi-touch: tracks each touch by ID

  const handleTouchStart = useCallback(
    (e: TouchEvent) => {
      e.preventDefault();

      const wasEmpty = activeTouchesRef.current.size === 0;

      // Add all touches that started on this key
      // changedTouches contains ONLY the touches that triggered this event
      for (let i = 0; i < e.changedTouches.length; i++) {
        // i < e.changedTouches.length, so the item is always present.
        activeTouchesRef.current.add(e.changedTouches[i]!.identifier);
      }

      // Update state for re-render
      setHasTouches(true);

      // Play sound only on first touch (not additional fingers on same key)
      if (wasEmpty) {
        playNote();
      }
    },
    [playNote]
  );

  const handleTouchEnd = useCallback((e: TouchEvent) => {
    e.preventDefault();

    // Remove all touches that ended
    for (let i = 0; i < e.changedTouches.length; i++) {
      // i < e.changedTouches.length, so the item is always present.
      activeTouchesRef.current.delete(e.changedTouches[i]!.identifier);
    }

    // Only update state when all touches have ended
    if (activeTouchesRef.current.size === 0) {
      setHasTouches(false);
    }
  }, []);

  const handleTouchCancel = useCallback((e: TouchEvent) => {
    e.preventDefault();

    // Remove all cancelled touches
    for (let i = 0; i < e.changedTouches.length; i++) {
      // i < e.changedTouches.length, so the item is always present.
      activeTouchesRef.current.delete(e.changedTouches[i]!.identifier);
    }

    if (activeTouchesRef.current.size === 0) {
      setHasTouches(false);
    }
  }, []);

  // ===== Keyboard Handlers =====
  // Enter/Space play the focused key, mirroring a mouse press. `e.repeat` is
  // guarded so a held key doesn't machine-gun the note. Arrow-key navigation is
  // handled by the parent Piano (roving tabindex), so those keys bubble up
  // untouched here.

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        if (e.repeat) return;
        e.preventDefault();
        setIsKeyboardPressed(true);
        playNote();
      }
    },
    [playNote]
  );

  const handleKeyUp = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setIsKeyboardPressed(false);
    }
  }, []);

  // Rapidly pressing Enter then arrowing to the next key moves focus before
  // keyup fires, so keyup lands on the newly-focused key instead of this one.
  // Clearing on blur guarantees this key's pressed state is released the
  // moment it loses focus, regardless of which key (if any) gets the keyup.
  const handleBlur = useCallback(() => {
    setIsKeyboardPressed(false);
  }, []);

  // Get scale degree numeral if in scale OR if showing labels
  const scaleDegree =
    isInScale || showScaleLabels
      ? getScaleDegreeNumeral(keyData.baseNote, selectedKey, mode)
      : null;

  // Calculate position
  // White keys: positioned at their index
  // Black keys: positioned between white keys (65% into the left white key)
  const leftPosition = keyData.isBlack
    ? `calc(${keyData.whiteKeyIndex} * var(--white-key-width) + var(--white-key-width) * 0.65)`
    : `calc(${keyData.whiteKeyIndex} * var(--white-key-width))`;

  // Determine CSS classes
  // - in-chord: orange highlighting (takes priority)
  // - not-in-scale: dimmed (only when scale toggle is ON and key is NOT in scale AND NOT in chord)
  const notInScale = showScaleHighlighting && !isInScale && !isInChord;

  return (
    <div
      className={`piano-key ${keyData.isBlack ? 'black' : 'white'} ${isPressed || isMidiActive ? 'pressed' : ''} ${
        isInChord ? 'in-chord' : ''
      } ${notInScale ? 'not-in-scale' : ''} ${isMidiActive ? 'midi-active' : ''}`}
      style={{ left: leftPosition }}
      ref={(el) => keyRef?.(index, el)}
      onMouseDown={handleMouseDown}
      onMouseEnter={handleMouseEnter}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchCancel}
      onKeyDown={handleKeyDown}
      onKeyUp={handleKeyUp}
      onFocus={() => onFocus?.(index)}
      onBlur={handleBlur}
      role="button"
      tabIndex={tabIndex}
      aria-label={`${keyData.note}`}
    >
      <div className="key-label">
        <span className="note-name">{keyData.baseNote}</span>
        {showScaleDegree && scaleDegree && <span className="scale-degree">{scaleDegree}</span>}
      </div>
    </div>
  );
}

// Memoized: PianoKey is the hottest render path in the app (re-evaluated per
// note during MIDI/glissando play). All props are primitives or stable
// callbacks from Piano, so a shallow prop comparison reliably skips
// re-rendering keys whose props haven't actually changed.
export const PianoKey = memo(PianoKeyImpl);
