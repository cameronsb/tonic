import { useState } from 'react';
import { useMusic } from '../hooks/useMusic';
import { getScaleChords, getBorrowedChords } from '../utils/musicTheory';
import { ChordCard } from './ChordCard';
import './ChordDisplay.css';

type SortMode = 'default' | 'grouped';

// Functional groupings for diatonic chords by harmonic function
const DIATONIC_GROUPS = {
  major: {
    tonic: { label: 'Tonic (Stable, Home)', numerals: ['I', 'vi'] },
    subdominant: { label: 'Subdominant (Departure)', numerals: ['ii', 'IV'] },
    dominant: { label: 'Dominant (Tension)', numerals: ['V', 'vii°'] },
    mediant: { label: 'Mediant (Transitional)', numerals: ['iii'] },
  },
  minor: {
    tonic: { label: 'Tonic (Stable, Home)', numerals: ['i', 'VI'] },
    subdominant: { label: 'Subdominant (Departure)', numerals: ['ii°', 'iv'] },
    dominant: { label: 'Dominant (Tension)', numerals: ['v', 'VII'] },
    mediant: { label: 'Mediant (Transitional)', numerals: ['III'] },
  },
};

// Emotional groupings for borrowed chords
const BORROWED_GROUPS = {
  major: {
    darkening: { label: 'Darkening/Emotional', numerals: ['iv', 'bIII'] },
    brightening: { label: 'Brightening/Modal', numerals: ['bVI', 'bVII'] },
  },
  minor: {
    brightening: { label: 'Brightening/Uplifting', numerals: ['IV', 'VI', 'III'] },
    resolving: { label: 'Resolving', numerals: ['VII'] },
  },
};

type ViewMode = 'full' | 'compact';

export function ChordDisplay() {
  const { state, actions } = useMusic();
  const { key, mode } = state.song;

  const [diatonicSort, setDiatonicSort] = useState<SortMode>('default');
  const [borrowedSort, setBorrowedSort] = useState<SortMode>('default');
  const [viewMode, _setViewMode] = useState<ViewMode>('full'); // Default to full (buttons mode)

  const diatonicChords = getScaleChords(key, mode);
  const borrowedChords = getBorrowedChords(key, mode);

  const groups = DIATONIC_GROUPS[mode];
  const borrowedGroups = BORROWED_GROUPS[mode] as any;

  // Helper to get chords by numerals
  const getChordsByNumerals = (chords: typeof diatonicChords, numerals: string[]) => {
    return chords.filter(chord => numerals.includes(chord.numeral));
  };

  // Render chord cards
  const renderChordCard = (chord: typeof diatonicChords[0], isDiatonic: boolean) => (
    <ChordCard
      key={chord.numeral}
      numeral={chord.numeral}
      rootNote={chord.rootNote}
      intervals={chord.intervals}
      type={chord.type}
      isDiatonic={isDiatonic}
      variationMode={viewMode === 'compact' ? 'select' : 'buttons'}
    />
  );

  return (
    <div className="chord-display">
      {/* Keyboard Preview Toggle */}
      <label className="keyboard-preview-control">
        <input
          type="checkbox"
          checked={state.keyboardPreviewEnabled}
          onChange={actions.toggleKeyboardPreview}
          className="keyboard-preview-checkbox"
        />
        <span className="keyboard-preview-text">
          Show chords on keyboard
        </span>
      </label>

      {/* View mode toggle - hidden for now
      <div className="view-mode-toggle">
        <button
          className={`view-mode-btn ${viewMode === 'full' ? 'active' : ''}`}
          onClick={() => setViewMode('full')}
          title="Full layout with visible variations"
        >
          Full
        </button>
        <button
          className={`view-mode-btn ${viewMode === 'compact' ? 'active' : ''}`}
          onClick={() => setViewMode('compact')}
          title="Compact layout with dropdown variations"
        >
          Compact
        </button>
      </div>
      */}
      <div className="chord-sections-container">
        {/* Diatonic Chords Section */}
        <div className="chord-section">
          <div className="section-header">
            <h3 className="section-title">Diatonic Chords in {key} {mode}</h3>
            <select
              className="sort-dropdown"
              value={diatonicSort}
              onChange={(e) => setDiatonicSort(e.target.value as SortMode)}
            >
              <option value="default">Default Order</option>
              <option value="grouped">Grouped by Function</option>
            </select>
          </div>

          <div className="chord-grid">
            {diatonicSort === 'default' ? (
              // Default: All chords in order, no grouping
              diatonicChords.map((chord) => renderChordCard(chord, true))
            ) : (
              // Grouped: Show subsections
              Object.entries(groups).map(([key, group]) => (
                <div key={key} className="chord-subsection">
                  <h4 className="subsection-title">{group.label}</h4>
                  {getChordsByNumerals(diatonicChords, group.numerals).map((chord) =>
                    renderChordCard(chord, true)
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Borrowed Chords Section */}
        <div className="chord-section">
          <div className="section-header">
            <h3 className="section-title">Borrowed Chords from parallel {mode === 'major' ? 'minor' : 'major'}</h3>
            <select
              className="sort-dropdown"
              value={borrowedSort}
              onChange={(e) => setBorrowedSort(e.target.value as SortMode)}
            >
              <option value="default">Default Order</option>
              <option value="grouped">Grouped by Impact</option>
            </select>
          </div>

          <div className="chord-grid">
            {borrowedSort === 'default' ? (
              // Default: All chords in order, no grouping
              borrowedChords.map((chord) => renderChordCard(chord, false))
            ) : (
              // Grouped: Show subsections
              Object.entries(borrowedGroups).map(([key, group]: [string, any]) => (
                <div key={key} className="chord-subsection">
                  <h4 className="subsection-title">{group.label}</h4>
                  {getChordsByNumerals(borrowedChords, group.numerals).map((chord) =>
                    renderChordCard(chord, false)
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

