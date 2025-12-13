import { getChordDisplayName } from '../utils/musicTheory';
import type { Note, ChordType } from '../types/music';
import './ChordInfoBlock.css';

interface ChordInfoBlockProps {
  numeral: string;
  rootNote: Note;
  baseType: ChordType;
  baseIntervals: number[];
  intervals: number[];
  activeModifiers: Set<string>;
}

export function ChordInfoBlock({
  numeral,
  rootNote,
  baseType,
  baseIntervals,
  intervals: _intervals,
  activeModifiers,
}: ChordInfoBlockProps) {
  const chordName = getChordDisplayName(rootNote, baseType, baseIntervals, activeModifiers);

  return (
    <div className="chord-info-block">
      <div className="chord-info-numeral">{numeral}</div>
      <div className="chord-info-name">{chordName}</div>
    </div>
  );
}
