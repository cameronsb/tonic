import React, { useState, useCallback } from 'react';
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
  isMidiActive?: boolean; // Whether this key is currently pressed via MIDI
}


export function PianoKey({
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
  isMidiActive = false
}: PianoKeyProps) {
  const [isPressed, setIsPressed] = useState(false);
  const [touchId, setTouchId] = useState<number | null>(null);

  const handlePress = useCallback(() => {
    setIsPressed(true);
    onPress(keyData.frequency);
  }, [keyData.frequency, onPress]);

  const handleRelease = useCallback(() => {
    setIsPressed(false);
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    handlePress();
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    e.preventDefault();
    handleRelease();
  };

  const handleMouseEnter = () => {
    // Play note when mouse enters while dragging (glissando)
    if (isGlissandoActive) {
      handlePress();
    }
  };

  const handleMouseLeave = (e: React.MouseEvent) => {
    e.preventDefault();
    handleRelease();
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.touches.length > 0 && touchId === null) {
      const touch = e.touches[0];
      setTouchId(touch.identifier);
      handlePress();
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Check if this touch end is for our tracked touch
    const changedTouches = Array.from(e.changedTouches);
    if (touchId !== null && changedTouches.some(t => t.identifier === touchId)) {
      setTouchId(null);
      handleRelease();
    }
  };

  const handleTouchCancel = (e: React.TouchEvent) => {
    e.preventDefault();
    if (touchId !== null) {
      setTouchId(null);
      handleRelease();
    }
  };

  // Get scale degree numeral if in scale OR if showing labels
  const scaleDegree = (isInScale || showScaleLabels)
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
      onMouseDown={handleMouseDown}
      onMouseEnter={handleMouseEnter}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchCancel}
      role="button"
      tabIndex={0}
      aria-label={`${keyData.note}`}
    >
      <div className="key-label">
        {!keyData.isBlack && (
          <>
            <span className="note-name">{keyData.baseNote}</span>
            {showScaleDegree && scaleDegree && (
              <span className="scale-degree">{scaleDegree}</span>
            )}
          </>
        )}
      </div>
    </div>
  );
}
