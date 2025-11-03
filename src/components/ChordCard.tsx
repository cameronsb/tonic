import React, { useState } from 'react';
import type { Note, ChordType } from '../types/music';
import { getFullChordName, getChordFrequencies } from '../utils/musicTheory';
import { useMusic } from '../hooks/useMusic';
import './ChordCard.css';

interface ChordModifier {
  label: string;
  intervalToAdd?: number;
  intervalsToAdd?: number[]; // For extended chords that add multiple intervals
  intervalToRemove?: number;
  replaceWith?: number[];
}

// Organized in 2 rows of 6 for complete harmonic palette
// Row 1: Seventh chords, suspended, and altered triads
// Row 2: Extended harmony and added tones
const CHORD_MODIFIERS: ChordModifier[] = [
  // Row 1: Seventh chords, suspended, diminished
  { label: '7', intervalToAdd: 10 },           // Dominant 7th: adds b7
  { label: 'maj7', intervalToAdd: 11 },        // Major 7th: adds maj7
  { label: '6', intervalToAdd: 9 },            // Major 6th: adds 6th
  { label: 'sus2', replaceWith: [0, 2, 7] },   // Suspended 2nd: replaces 3rd with 2nd
  { label: 'sus4', replaceWith: [0, 5, 7] },   // Suspended 4th: replaces 3rd with 4th
  { label: 'dim', replaceWith: [0, 3, 6] },    // Diminished triad: b3 + b5

  // Row 2: Extended chords and augmented
  { label: '9', intervalsToAdd: [10, 14] },      // Dominant 9th: b7 + 9th
  { label: 'maj9', intervalsToAdd: [11, 14] },   // Major 9th: maj7 + 9th
  { label: '11', intervalsToAdd: [10, 14, 17] }, // Dominant 11th: b7 + 9th + 11th
  { label: '13', intervalsToAdd: [10, 14, 21] }, // Dominant 13th: b7 + 9th + 13th
  { label: 'add9', intervalToAdd: 14 },          // Add 9: just 9th (no 7th)
  { label: 'aug', replaceWith: [0, 4, 8] },      // Augmented triad: major 3rd + #5
];

interface ChordCardProps {
  numeral: string;
  rootNote: Note;
  intervals: number[];
  type: ChordType;
  isDiatonic?: boolean;
  compact?: boolean; // deprecated, use variationMode instead
  variationMode?: 'buttons' | 'select';
}

export function ChordCard({
  numeral,
  rootNote,
  intervals,
  type,
  isDiatonic = true,
  compact = false,
  variationMode = 'buttons'
}: ChordCardProps) {
  const [activeModifiers, setActiveModifiers] = useState<Set<string>>(new Set());
  const [currentIntervals, setCurrentIntervals] = useState<number[]>(intervals);
  const { audio } = useMusic();

  // Backwards compatibility: if compact prop is used, override variationMode
  const effectiveMode = compact ? 'select' : variationMode;

  const applyModifier = (modifier: ChordModifier) => {
    const newModifiers = new Set(activeModifiers);

    if (activeModifiers.has(modifier.label)) {
      newModifiers.delete(modifier.label);
    } else {
      newModifiers.add(modifier.label);
    }

    let newIntervals = [...intervals];

    newModifiers.forEach(modLabel => {
      const mod = CHORD_MODIFIERS.find(m => m.label === modLabel);
      if (!mod) return;

      if (mod.replaceWith) {
        newIntervals = mod.replaceWith;
      } else if (mod.intervalsToAdd) {
        // Add multiple intervals (for extended chords like 9, 11, 13)
        mod.intervalsToAdd.forEach(interval => {
          if (!newIntervals.includes(interval)) {
            newIntervals.push(interval);
          }
        });
      } else if (mod.intervalToAdd !== undefined) {
        if (!newIntervals.includes(mod.intervalToAdd)) {
          newIntervals.push(mod.intervalToAdd);
        }
      } else if (mod.intervalToRemove !== undefined) {
        newIntervals = newIntervals.filter(i => i !== mod.intervalToRemove);
      }
    });

    newIntervals.sort((a, b) => a - b);

    setActiveModifiers(newModifiers);
    setCurrentIntervals(newIntervals);

    // Play the modified chord
    try {
      const frequencies = getChordFrequencies(rootNote, newIntervals);
      if (frequencies && frequencies.length > 0) {
        audio.playChord(frequencies, 0.8);
      }
    } catch (error) {
      console.error('Error playing chord:', error);
    }
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedLabel = e.target.value;

    if (!selectedLabel) {
      // Reset to base chord
      setActiveModifiers(new Set());
      setCurrentIntervals(intervals);

      // Play the base chord
      try {
        const frequencies = getChordFrequencies(rootNote, intervals);
        if (frequencies && frequencies.length > 0) {
          audio.playChord(frequencies, 0.8);
        }
      } catch (error) {
        console.error('Error playing chord:', error);
      }
      return;
    }

    const modifier = CHORD_MODIFIERS.find(m => m.label === selectedLabel);
    if (!modifier) return;

    const newModifiers = new Set([selectedLabel]);
    let newIntervals = [...intervals];

    if (modifier.replaceWith) {
      newIntervals = modifier.replaceWith;
    } else if (modifier.intervalsToAdd) {
      // Add multiple intervals (for extended chords like 9, 11, 13)
      modifier.intervalsToAdd.forEach(interval => {
        if (!newIntervals.includes(interval)) {
          newIntervals.push(interval);
        }
      });
    } else if (modifier.intervalToAdd !== undefined) {
      if (!newIntervals.includes(modifier.intervalToAdd)) {
        newIntervals.push(modifier.intervalToAdd);
      }
    } else if (modifier.intervalToRemove !== undefined) {
      newIntervals = newIntervals.filter(i => i !== modifier.intervalToRemove);
    }

    newIntervals.sort((a, b) => a - b);

    setActiveModifiers(newModifiers);
    setCurrentIntervals(newIntervals);

    // Play the modified chord
    try {
      const frequencies = getChordFrequencies(rootNote, newIntervals);
      if (frequencies && frequencies.length > 0) {
        audio.playChord(frequencies, 0.8);
      }
    } catch (error) {
      console.error('Error playing chord:', error);
    }
  };

  const handleCardClick = (e: React.MouseEvent) => {
    // Ignore clicks on modifier buttons
    if ((e.target as HTMLElement).classList.contains('modifier-btn')) {
      return;
    }

    try {
      const frequencies = getChordFrequencies(rootNote, currentIntervals);
      if (frequencies && frequencies.length > 0) {
        audio.playChord(frequencies, 0.8);
      }
    } catch (error) {
      console.error('Error playing chord:', error);
    }
  };

  const getChordDisplayName = () => {
    if (activeModifiers.size === 0) {
      return getFullChordName(rootNote, intervals);
    }

    let name = rootNote;
    const baseType = type;
    const modArray = Array.from(activeModifiers);

    // Handle diminished - replaces entire triad
    if (modArray.includes('dim')) {
      return rootNote + '°';
    }

    // Handle augmented - replaces entire triad
    if (modArray.includes('aug')) {
      return rootNote + '+';
    }

    // Handle sus chords - they replace the quality and take priority
    if (modArray.includes('sus2') || modArray.includes('sus4')) {
      const sus = modArray.find(m => m.startsWith('sus'));
      name = rootNote + sus;

      // Can still add extensions to sus chords
      const extensions = modArray.filter(m => !m.startsWith('sus') && !m.includes('7'));
      if (extensions.length > 0) {
        name += extensions.join('');
      }

      return name;
    }

    // Add base quality (minor/diminished from base type)
    if (baseType === 'min') {
      name += 'm';
    } else if (baseType === 'dim') {
      name += '°';
    }

    // Determine the highest/dominant extension
    // Priority: 13 > 11 > maj9/9 > maj7/7/6
    const hasThirteenth = modArray.includes('13');
    const hasEleventh = modArray.includes('11');
    const hasNinth = modArray.includes('9');
    const hasMaj9 = modArray.includes('maj9');
    const hasMaj7 = modArray.includes('maj7');
    const hasSeventh = modArray.includes('7');
    const hasSix = modArray.includes('6');
    const hasAdd9 = modArray.includes('add9');

    // If we have 13, it implies 9 and 11, so just show 13
    if (hasThirteenth) {
      name += '13';
    }
    // If we have 11, it implies 9, so just show 11
    else if (hasEleventh) {
      name += '11';
    }
    // Major 9th (maj7 + 9th)
    else if (hasMaj9) {
      name += 'maj9';
    }
    // Dominant 9th (b7 + 9th)
    else if (hasNinth) {
      name += '9';
    }
    // Just 7th chords
    else if (hasMaj7) {
      name += 'maj7';
    } else if (hasSeventh) {
      name += '7';
    } else if (hasSix) {
      name += '6';
    }
    // add9 is different - it doesn't imply a 7th
    else if (hasAdd9) {
      name += 'add9';
    }

    return name;
  };

  const availableModifiers = intervals.length === 3
    ? CHORD_MODIFIERS
    : CHORD_MODIFIERS.filter(m => m.label !== '7' && m.label !== 'maj7');

  // Select dropdown mode
  if (effectiveMode === 'select') {
    return (
      <div
        className={`chord-card chord-card-select ${isDiatonic ? 'diatonic' : 'borrowed'}`}
        onClick={handleCardClick}
      >
        <div className="chord-card-main">
          <div className="chord-info">
            <div className="chord-numeral">{numeral}</div>
            <div className="chord-name">{getChordDisplayName()}</div>
          </div>
          <select
            className="variations-select"
            value={Array.from(activeModifiers)[0] || ''}
            onChange={handleSelectChange}
            onClick={(e) => e.stopPropagation()}
          >
            <option value="">-</option>
            {availableModifiers.map(modifier => (
              <option key={modifier.label} value={modifier.label}>
                {modifier.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    );
  }

  // Button mode (default)
  return (
    <div
      className={`chord-card chord-card-buttons ${isDiatonic ? 'diatonic' : 'borrowed'}`}
      onClick={handleCardClick}
    >
      <div className="chord-card-main">
        <div className="chord-info">
          <div className="chord-numeral">{numeral}</div>
          <div className="chord-name">{getChordDisplayName()}</div>
        </div>
        <div className="modifier-buttons-grid" onClick={(e) => e.stopPropagation()}>
          {availableModifiers.map(modifier => (
            <button
              key={modifier.label}
              className={`modifier-btn ${activeModifiers.has(modifier.label) ? 'active' : ''}`}
              onClick={() => applyModifier(modifier)}
              title={`Add ${modifier.label}`}
            >
              {modifier.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

