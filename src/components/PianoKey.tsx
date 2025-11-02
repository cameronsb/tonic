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
  showScaleDegree?: boolean;
  selectedKey: Note;
  mode: 'major' | 'minor';
}
 

export function PianoKey({
  keyData,
  onPress,
  isInScale,
  isInChord,
  showScaleDegree,
  selectedKey,
  mode
}: PianoKeyProps) {
  const [isPressed, setIsPressed] = useState(false);

  const handlePress = useCallback(() => {
    setIsPressed(true);
    onPress(keyData.frequency);
    setTimeout(() => setIsPressed(false), 200);
  }, [keyData.frequency, onPress]);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    handlePress();
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    handlePress();
  };

  // Get scale degree numeral if in scale
  const scaleDegree = isInScale
    ? getScaleDegreeNumeral(keyData.baseNote, selectedKey, mode)
    : null;

  // Calculate position
  // White keys: positioned at their index
  // Black keys: positioned between white keys (65% into the left white key)
  const leftPosition = keyData.isBlack
    ? `calc(${keyData.whiteKeyIndex} * var(--white-key-width) + var(--white-key-width) * 0.65)`
    : `calc(${keyData.whiteKeyIndex} * var(--white-key-width))`;

  return (
    <div
      className={`piano-key ${keyData.isBlack ? 'black' : 'white'} ${isPressed ? 'pressed' : ''} ${
        isInChord ? 'in-chord' : isInScale ? 'in-scale' : ''
      }`}
      style={{ left: leftPosition }}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
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
