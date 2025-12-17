import { useMusic } from '../hooks/useMusic';
import { useSettings } from '../hooks/useSettings';
import { getScaleChords, getBorrowedChords } from '../utils/musicTheory';
import { ChordCard } from './ChordCard';
import './ChordStrip.css';

interface ChordStripProps {
  layout?: 'default' | 'sidebar';
}

export function ChordStrip({ layout = 'default' }: ChordStripProps) {
  const { state } = useMusic();
  const { settings, setShowMiniPreview, setShowBorrowed } = useSettings();
  const { key, mode } = state;
  const showBorrowed = settings.ui.chordStrip.showBorrowed;

  const diatonicChords = getScaleChords(key, mode);
  const borrowedChords = getBorrowedChords(key, mode);

  // For sidebar layout, use vertical stack (legacy support)
  if (layout === 'sidebar') {
    return (
      <div className="chord-strip-sidebar">
        <div className="chord-strip-section">
          <h3 className="chord-strip-title">Diatonic Chords</h3>
          <div className="chord-cards-vertical">
            {diatonicChords.map((chord) => (
              <ChordCard
                key={chord.numeral}
                numeral={chord.numeral}
                rootNote={chord.rootNote}
                intervals={chord.intervals}
                type={chord.type}
                isDiatonic={true}
                keyRoot={key}
                mode={mode}
                showPreview={settings.ui.piano.showMiniPreview}
              />
            ))}
          </div>
        </div>

        {showBorrowed && (
          <div className="chord-strip-section">
            <h3 className="chord-strip-title">Borrowed Chords</h3>
            <div className="chord-cards-vertical">
              {borrowedChords.map((chord) => (
                <ChordCard
                  key={chord.numeral}
                  numeral={chord.numeral}
                  rootNote={chord.rootNote}
                  intervals={chord.intervals}
                  type={chord.type}
                  isDiatonic={false}
                  keyRoot={key}
                  mode={mode}
                  showPreview={settings.ui.piano.showMiniPreview}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Default tablet/desktop layout: horizontal chord cards
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

      {/* Horizontal chord cards - all 7 diatonic chords */}
      <div className="chord-cards-horizontal">
        {diatonicChords.map((chord) => (
          <ChordCard
            key={chord.numeral}
            numeral={chord.numeral}
            rootNote={chord.rootNote}
            intervals={chord.intervals}
            type={chord.type}
            isDiatonic={true}
            keyRoot={key}
            mode={mode}
            showPreview={settings.ui.piano.showMiniPreview}
          />
        ))}
      </div>

      {/* Borrowed chords - shown when toggled */}
      {showBorrowed && (
        <div className="chord-cards-horizontal borrowed-chords-row">
          {borrowedChords.map((chord) => (
            <ChordCard
              key={chord.numeral}
              numeral={chord.numeral}
              rootNote={chord.rootNote}
              intervals={chord.intervals}
              type={chord.type}
              isDiatonic={false}
              keyRoot={key}
              mode={mode}
              showPreview={settings.ui.piano.showMiniPreview}
            />
          ))}
        </div>
      )}
    </div>
  );
}
