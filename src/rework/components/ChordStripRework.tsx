import { useState } from 'react';
import { useMusic } from '../../hooks/useMusic';
import { useSettings } from '../../hooks/useSettings';
import { getScaleChords, getBorrowedChords, getChordFrequencies } from '../../utils/musicTheory';
import { ChordTabRework } from './ChordTabRework';
import { ChordInfoBlock } from './ChordInfoBlock';
import { PianoVisualization } from '../../components/PianoVisualization';
import { CHORD_MODIFIERS } from '../../config/chords';
import type { Note } from '../../types/music';
import './ChordStripRework.css';

interface ChordStripReworkProps {
  layout?: 'default' | 'sidebar';
}

export function ChordStripRework({ layout = 'default' }: ChordStripReworkProps) {
  const { state, audio, actions } = useMusic();
  const { settings, setShowMiniPreview } = useSettings();
  const { key, mode } = state.song;
  const [showBorrowed, setShowBorrowed] = useState(false);
  const [activeChordIndex, setActiveChordIndex] = useState<number | null>(null);
  const [activeModifiers, setActiveModifiers] = useState<Set<string>>(new Set());
  const [currentIntervals, setCurrentIntervals] = useState<number[]>([]);

  const diatonicChords = getScaleChords(key, mode);
  const borrowedChords = getBorrowedChords(key, mode);

  const allChords = [...diatonicChords, ...borrowedChords];
  const activeChord = activeChordIndex !== null ? allChords[activeChordIndex] : null;

  const handleChordActivate = (index: number, baseIntervals: number[]) => {
    setActiveChordIndex(index);
    setActiveModifiers(new Set());
    setCurrentIntervals(baseIntervals);
  };

  const applyModifier = (modifierLabel: string, rootNote: Note, baseIntervals: number[]) => {
    const newModifiers = new Set(activeModifiers);

    if (activeModifiers.has(modifierLabel)) {
      newModifiers.delete(modifierLabel);
    } else {
      newModifiers.add(modifierLabel);
    }

    let newIntervals = [...baseIntervals];

    newModifiers.forEach(modLabel => {
      const mod = CHORD_MODIFIERS.find(m => m.label === modLabel);
      if (!mod) return;

      if (mod.replaceWith) {
        newIntervals = mod.replaceWith;
      } else if (mod.intervalsToAdd) {
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

    // Update keyboard preview if enabled
    if (state.keyboardPreviewEnabled && activeChord) {
      actions.selectChord(rootNote, newIntervals, activeChord.numeral);
    }
  };

  // For sidebar layout, use vertical stack
  if (layout === 'sidebar') {
    return (
      <div className="chord-strip-sidebar">
        <div className="chord-strip-section">
          <h3 className="chord-strip-title">Diatonic Chords</h3>
          <div className="chord-tabs-vertical">
            {diatonicChords.map((chord, index) => (
              <ChordTabRework
                key={chord.numeral}
                numeral={chord.numeral}
                rootNote={chord.rootNote}
                intervals={chord.intervals}
                type={chord.type}
                isDiatonic={true}
                isActive={activeChordIndex === index}
                onActivate={() => setActiveChordIndex(index)}
                layout="sidebar"
              />
            ))}
          </div>
        </div>

        <div className="chord-strip-section">
          <h3 className="chord-strip-title">Borrowed Chords</h3>
          <div className="chord-tabs-vertical">
            {borrowedChords.map((chord, index) => (
              <ChordTabRework
                key={chord.numeral}
                numeral={chord.numeral}
                rootNote={chord.rootNote}
                intervals={chord.intervals}
                type={chord.type}
                isDiatonic={false}
                isActive={activeChordIndex === index + diatonicChords.length}
                onActivate={() => setActiveChordIndex(index + diatonicChords.length)}
                layout="sidebar"
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Default tablet/desktop layout: horizontal chord strip
  return (
    <div className="chord-strip-container">
      {/* Header with toggles */}
      <div className="chord-strip-header">
        <h3 className="chord-strip-header-title">
          {key} {mode} Scale Chords
        </h3>
        <div className="chord-strip-header-controls">
          <label className="header-toggle">
            <input
              type="checkbox"
              checked={settings.ui.piano.showMiniPreview}
              onChange={(e) => setShowMiniPreview(e.target.checked)}
              className="toggle-checkbox"
            />
            <span className="toggle-label">Key Preview</span>
          </label>
          <button
            className={`borrowed-toggle-btn ${showBorrowed ? 'active' : ''}`}
            onClick={() => setShowBorrowed(!showBorrowed)}
          >
            Borrowed ({borrowedChords.length})
          </button>
        </div>
      </div>

      {/* Horizontal chord tabs - all 7 diatonic chords visible */}
      <div className="chord-tabs-horizontal">
        {diatonicChords.map((chord, index) => (
          <ChordTabRework
            key={chord.numeral}
            numeral={chord.numeral}
            rootNote={chord.rootNote}
            intervals={chord.intervals}
            type={chord.type}
            isDiatonic={true}
            isActive={activeChordIndex === index && !showBorrowed}
            onActivate={() => {
              handleChordActivate(index, chord.intervals);
            }}
            showMiniPreview={settings.ui.piano.showMiniPreview}
          />
        ))}
      </div>

      {/* Borrowed chords - shown when toggled */}
      {showBorrowed && (
        <div className="chord-tabs-horizontal borrowed-chords-row">
          {borrowedChords.map((chord, index) => (
            <ChordTabRework
              key={chord.numeral}
              numeral={chord.numeral}
              rootNote={chord.rootNote}
              intervals={chord.intervals}
              type={chord.type}
              isDiatonic={false}
              isActive={activeChordIndex === (index + diatonicChords.length)}
              onActivate={() => handleChordActivate(index + diatonicChords.length, chord.intervals)}
              showMiniPreview={settings.ui.piano.showMiniPreview}
            />
          ))}
        </div>
      )}

      {/* Detail panel for active chord - compact layout with piano preview */}
      {activeChord && (
        <div className="chord-detail-panel">
          <div className="chord-detail-left">
            <h4 className="chord-detail-title">Variations</h4>
            <div className="chord-modifier-grid">
              {CHORD_MODIFIERS.map(modifier => (
                <button
                  key={modifier.label}
                  className={`chord-modifier-btn ${activeModifiers.has(modifier.label) ? 'active' : ''}`}
                  onClick={() => applyModifier(modifier.label, activeChord.rootNote, activeChord.intervals)}
                  title={modifier.label}
                >
                  {modifier.label}
                </button>
              ))}
            </div>
          </div>
          <div className="chord-detail-right">
            <ChordInfoBlock
              numeral={activeChord.numeral}
              rootNote={activeChord.rootNote}
              baseType={activeChord.type}
              baseIntervals={activeChord.intervals}
              intervals={currentIntervals}
              activeModifiers={activeModifiers}
            />
            <div className="chord-detail-piano-preview">
              <PianoVisualization
                rootNote={activeChord.rootNote}
                intervals={currentIntervals}
                showLabels={true}
                labelFontSize={5}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
