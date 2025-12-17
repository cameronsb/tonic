import { useState, useEffect } from 'react';
import { useMusic } from '../hooks/useMusic';
import {
  getFullChordName,
  getChordDisplayName,
  getChordFrequencies,
  NOTES,
  getScaleDegreeLabel,
} from '../utils/musicTheory';
import { CHORD_MODIFIERS } from '../config/chords';
import type { Note, Mode, ChordType } from '../types/music';
import './ChordCard.css';

interface ChordCardProps {
  numeral: string;
  rootNote: Note;
  intervals: number[];
  type: ChordType;
  isDiatonic: boolean;
  keyRoot: Note;
  mode: Mode;
  showPreview?: boolean;
}

export function ChordCard({
  numeral,
  rootNote,
  intervals: baseIntervals,
  type: baseType,
  isDiatonic,
  keyRoot,
  mode,
  showPreview = true,
}: ChordCardProps) {
  const { audio, actions, state } = useMusic();

  // Local state for this card's active modifiers (persists between plays)
  const [activeModifiers, setActiveModifiers] = useState<Set<string>>(new Set());
  const [currentIntervals, setCurrentIntervals] = useState<number[]>(baseIntervals);

  // Reset modifiers when key or mode changes
  useEffect(() => {
    setActiveModifiers(new Set());
    setCurrentIntervals(baseIntervals);
  }, [keyRoot, mode, baseIntervals]);

  // Get display name based on current modifiers
  const chordName =
    activeModifiers.size > 0
      ? getChordDisplayName(rootNote, baseType, baseIntervals, activeModifiers)
      : getFullChordName(rootNote, baseIntervals);

  // Check if this chord is currently selected on the main piano
  const isSelected =
    state.selectedChords.length > 0 &&
    state.selectedChords[0].rootNote === rootNote &&
    state.selectedChords[0].numeral === numeral;

  // Play the chord with current intervals
  const playChord = (intervals: number[]) => {
    try {
      const frequencies = getChordFrequencies(rootNote, intervals);
      if (frequencies && frequencies.length > 0) {
        audio.playChord(frequencies, 0.8);
      }
    } catch (error) {
      console.error('Error playing chord:', error);
    }

    // Update main piano selection
    actions.selectChord(rootNote, intervals, numeral);
  };

  // Handle clicking the main chord area (header/preview)
  const handleChordClick = () => {
    playChord(currentIntervals);
  };

  // Handle clicking a modifier button
  const handleModifierClick = (modifierLabel: string) => {
    const newModifiers = new Set(activeModifiers);

    if (activeModifiers.has(modifierLabel)) {
      newModifiers.delete(modifierLabel);
    } else {
      newModifiers.add(modifierLabel);
    }

    // Calculate new intervals based on all active modifiers
    let newIntervals = [...baseIntervals];

    newModifiers.forEach((modLabel) => {
      const mod = CHORD_MODIFIERS.find((m) => m.label === modLabel);
      if (!mod) return;

      if (mod.replaceWith) {
        newIntervals = mod.replaceWith;
      } else if (mod.intervalsToAdd) {
        mod.intervalsToAdd.forEach((interval) => {
          if (!newIntervals.includes(interval)) {
            newIntervals.push(interval);
          }
        });
      } else if (mod.intervalToAdd !== undefined) {
        if (!newIntervals.includes(mod.intervalToAdd)) {
          newIntervals.push(mod.intervalToAdd);
        }
      } else if (mod.intervalToRemove !== undefined) {
        newIntervals = newIntervals.filter((i) => i !== mod.intervalToRemove);
      }
    });

    newIntervals.sort((a, b) => a - b);

    setActiveModifiers(newModifiers);
    setCurrentIntervals(newIntervals);

    // Play the modified chord
    playChord(newIntervals);
  };

  // Piano preview component with scale degree numbers
  const PianoPreview = () => {
    if (!showPreview) return null;

    const whiteKeyPositions = [0, 2, 4, 5, 7, 9, 11]; // C, D, E, F, G, A, B
    const blackKeyPositions = [
      { key: 1, x: 11 }, // C#
      { key: 3, x: 25 }, // D#
      { key: 6, x: 53 }, // F#
      { key: 8, x: 67 }, // G#
      { key: 10, x: 81 }, // A#
    ];

    const rootIndex = NOTES.indexOf(rootNote);

    // Map intervals to chromatic positions
    const activeKeys = new Map<number, number>();
    currentIntervals.forEach((interval) => {
      const chromaticPosition = (rootIndex + interval) % 12;
      activeKeys.set(chromaticPosition, interval);
    });

    const isNoteActive = (chromaticKey: number) => activeKeys.has(chromaticKey);

    const getNoteLabel = (chromaticKey: number): string | null => {
      if (!activeKeys.has(chromaticKey)) return null;
      return getScaleDegreeLabel(chromaticKey, keyRoot, mode);
    };

    return (
      <svg viewBox="-1 -1 100 42" className="chord-card-piano">
        {/* White Keys */}
        {whiteKeyPositions.map((keyNum, idx) => {
          const active = isNoteActive(keyNum);
          const label = getNoteLabel(keyNum);
          const x = idx * 14;

          return (
            <g key={keyNum}>
              <rect
                x={x}
                y="0"
                width="13"
                height="24"
                rx="1"
                className={`chord-card-white-key ${active ? 'active' : ''}`}
              />
              {label && (
                <text
                  x={x + 6.5}
                  y="36"
                  className="chord-card-key-label"
                >
                  {label}
                </text>
              )}
            </g>
          );
        })}

        {/* Black Keys */}
        {blackKeyPositions.map(({ key, x }) => {
          const active = isNoteActive(key);
          const label = getNoteLabel(key);

          return (
            <g key={key}>
              <rect
                x={x}
                y="0"
                width="8"
                height="15"
                rx="1"
                className={`chord-card-black-key ${active ? 'active' : ''}`}
              />
              {label && (
                <text
                  x={x + 4}
                  y="36"
                  className="chord-card-key-label"
                >
                  {label}
                </text>
              )}
            </g>
          );
        })}
      </svg>
    );
  };

  return (
    <div
      className={`chord-card ${isDiatonic ? 'diatonic' : 'borrowed'} ${isSelected ? 'selected' : ''}`}
    >
      {/* Clickable header area */}
      <button
        className="chord-card-header"
        onClick={handleChordClick}
        type="button"
      >
        <div className="chord-card-numeral">{numeral}</div>
        <div className="chord-card-name">{chordName}</div>
        <PianoPreview />
      </button>

      {/* Modifier buttons grid */}
      <div className="chord-card-modifiers">
        {CHORD_MODIFIERS.map((modifier) => (
          <button
            key={modifier.label}
            className={`chord-card-modifier-btn ${activeModifiers.has(modifier.label) ? 'active' : ''}`}
            onClick={() => handleModifierClick(modifier.label)}
            title={modifier.label}
            type="button"
          >
            {modifier.label}
          </button>
        ))}
      </div>
    </div>
  );
}
