import { useMusic } from '../../hooks/useMusic';
import { getFullChordName, getChordFrequencies, NOTES } from '../../utils/musicTheory';
import type { Note, ChordType } from '../../types/music';
import './ChordTabRework.css';

interface ChordTabReworkProps {
  numeral: string;
  rootNote: Note;
  intervals: number[];
  type: ChordType;
  isDiatonic: boolean;
  isActive: boolean;
  onActivate: () => void;
  showMiniPreview?: boolean;
  layout?: 'default' | 'sidebar';
}

export function ChordTabRework({
  numeral,
  rootNote,
  intervals,
  type,
  isDiatonic,
  isActive,
  onActivate,
  showMiniPreview = false,
  layout = 'default'
}: ChordTabReworkProps) {
  const { audio, actions, state } = useMusic();

  const handleClick = () => {
    // Play the chord sound
    try {
      const frequencies = getChordFrequencies(rootNote, intervals);
      if (frequencies && frequencies.length > 0) {
        audio.playChord(frequencies, 0.8);
      }
    } catch (error) {
      console.error('Error playing chord:', error);
    }

    // If keyboard preview is enabled, show on piano
    if (state.keyboardPreviewEnabled) {
      actions.selectChord(rootNote, intervals, numeral);
    }

    // Activate this tab to show detail panel
    onActivate();
  };

  const chordName = getFullChordName(rootNote, intervals);

  // Check if this chord is currently selected on the keyboard
  const isChordSelected = state.selectedChords.length > 0 &&
    state.selectedChords[0].rootNote === rootNote &&
    state.selectedChords[0].numeral === numeral &&
    JSON.stringify(state.selectedChords[0].intervals) === JSON.stringify(intervals);

  // Mini keyboard preview component
  const MiniKeyboardPreview = () => {
    if (!showMiniPreview) return null;

    const whiteKeyPositions = [0, 2, 4, 5, 7, 9, 11]; // C, D, E, F, G, A, B
    const blackKeyPositions = [
      { key: 1, x: 5.5 },    // C#
      { key: 3, x: 12 },     // D#
      { key: 6, x: 25 },     // F#
      { key: 8, x: 31.5 },   // G#
      { key: 10, x: 38 }     // A#
    ];

    // Get the chromatic position of the root note (0-11 where C=0)
    const rootIndex = NOTES.indexOf(rootNote);

    // Calculate which chromatic keys should be highlighted
    const activeKeys = new Set<number>();
    intervals.forEach(interval => {
      const chromaticPosition = (rootIndex + interval) % 12;
      activeKeys.add(chromaticPosition);
    });

    const isNoteActive = (chromaticKey: number) => activeKeys.has(chromaticKey);

    return (
      <svg viewBox="0 0 45 15" className="mini-keyboard-preview">
        {/* White Keys - smaller, 7 keys total */}
        {whiteKeyPositions.map((keyNum, idx) => {
          const active = isNoteActive(keyNum);
          const x = idx * 6.5;

          return (
            <rect
              key={keyNum}
              x={x}
              y="0"
              width="6"
              height="15"
              className={`mini-white-key ${active ? "active" : ""}`}
            />
          );
        })}

        {/* Black Keys - smaller */}
        {blackKeyPositions.map(({ key, x }) => {
          const active = isNoteActive(key);

          return (
            <rect
              key={key}
              x={x}
              y="0"
              width="3"
              height="9"
              className={`mini-black-key ${active ? "active" : ""}`}
            />
          );
        })}
      </svg>
    );
  };

  if (layout === 'sidebar') {
    return (
      <button
        className={`chord-tab-sidebar ${isDiatonic ? 'diatonic' : 'borrowed'} ${isActive ? 'active' : ''} ${isChordSelected ? 'selected' : ''}`}
        onClick={handleClick}
      >
        <div className="chord-tab-info">
          <span className="chord-tab-numeral">{numeral}</span>
          <span className="chord-tab-name">{chordName}</span>
        </div>
      </button>
    );
  }

  // Default horizontal tab layout
  return (
    <button
      className={`chord-tab ${isDiatonic ? 'diatonic' : 'borrowed'} ${isActive ? 'active' : ''} ${isChordSelected ? 'selected' : ''}`}
      onClick={handleClick}
    >
      <div className="chord-tab-content">
        <div className="chord-tab-numeral">{numeral}</div>
        <div className="chord-tab-name">{chordName}</div>
        <MiniKeyboardPreview />
      </div>
    </button>
  );
}
