import { useMusic } from '../hooks/useMusic';
import { DrumSequencer } from './DrumSequencer';
import { VolumeKnob } from './VolumeKnob';
import './DrumTrack.css';

export function DrumTrack() {
  const { state, settings, actions } = useMusic();

  // Calculate how many measures we need based on the chord blocks
  const chordBlocks = state.song.tracks.chords.blocks;
  const timeSignature = state.song.timeSignature;

  // Find the last block's end position
  const lastBlockEnd = chordBlocks.length > 0
    ? Math.max(...chordBlocks.map(b => b.position + b.duration))
    : 0;

  // Convert 8th notes to measures (assuming 4/4 = 8 eighths per measure)
  const eighthsPerMeasure = (timeSignature.numerator * 8) / timeSignature.denominator;
  const measuresNeeded = Math.max(4, Math.ceil(lastBlockEnd / eighthsPerMeasure));

  return (
    <div className="drum-track">
      <div className="drum-track-header">
        <div className="drum-track-header-left">
          <h3>Drum Track</h3>
          <div className="drum-track-info">
            {measuresNeeded} {measuresNeeded === 1 ? 'measure' : 'measures'}
          </div>
        </div>
        <VolumeKnob
          value={settings.volume.tracks.drums}
          onChange={(v) => actions.setTrackVolume('drums', v)}
          size={36}
          color="#4facfe"
          label="Vol"
        />
      </div>
      <div className="drum-track-content">
        {Array.from({ length: measuresNeeded }).map((_, i) => (
          <DrumSequencer key={i} measure={i} />
        ))}
      </div>
    </div>
  );
}
