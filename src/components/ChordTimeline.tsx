import { useRef, useMemo, useState, useCallback } from 'react';
import { Play, Pause, Repeat } from 'lucide-react';
import { useMusic } from '../hooks/useMusic';
import { usePlayback } from '../hooks/usePlayback';
import { useGrid } from '../hooks/useGrid';
import { getChordFrequencies } from '../utils/musicTheory';
import { Ruler } from './Ruler';
import { ChordBlock } from './ChordBlock';
import { VolumeSlider } from './VolumeSlider';
import type { ChordBlock as ChordBlockType } from '../types/music';
import './ChordTimeline.css';

export function ChordTimeline() {
  const { state, actions, audio, settings } = useMusic();
  const grid = useGrid();
  const timelineRef = useRef<HTMLDivElement>(null);
  const [playheadPosition, setPlayheadPosition] = useState(0);

  const chordBlocks = state.song.tracks.chords.blocks;

  const totalDurationInEighths = useMemo(() => {
    return chordBlocks.reduce((sum, block) => sum + block.duration, 0);
  }, [chordBlocks]);

  const totalMeasures = Math.max(8, Math.ceil(totalDurationInEighths / grid.config.eighthsPerMeasure) + 2);
  const timelineWidth = totalMeasures * grid.config.measureWidth;

  const handleTimeUpdate = useCallback((timeInEighths: number) => {
    setPlayheadPosition(grid.timeToPixels(timeInEighths));

    const currentChordIndex = chordBlocks.findIndex((block) => {
      const blockEnd = block.position + block.duration;
      return timeInEighths >= block.position && timeInEighths < blockEnd;
    });

    if (currentChordIndex !== -1) {
      actions.setPlaybackBeat(currentChordIndex);
    }
  }, [chordBlocks, grid, actions]);

  const handlePlaybackEnd = useCallback(() => {
    actions.setPlaybackPlaying(false);
    actions.setPlaybackBeat(0);
    setPlayheadPosition(0);
  }, [actions]);

  const playback = usePlayback({
    tempo: state.song.tempo,
    chordBlocks,
    drumBlocks: state.song.tracks.drums.blocks,
    drumPatterns: state.song.tracks.drums.patterns,
    loop: state.playbackState.loop,
    eighthsPerMeasure: (state.song.timeSignature.numerator * 8) / state.song.timeSignature.denominator,
    isPlaying: state.playbackState.isPlaying,
    playChord: audio.playChord,
    playKick: audio.playKick,
    playSnare: audio.playSnare,
    playHiHat: audio.playHiHat,
    audioContext: audio.audioContext,
    instrument: audio.instrument,
    onTimeUpdate: handleTimeUpdate,
    onPlaybackEnd: handlePlaybackEnd,
  });

  const handlePlayPause = () => {
    if (state.playbackState.isPlaying) {
      playback.pause();
      actions.setPlaybackPlaying(false);
      setPlayheadPosition(0);
    } else {
      if (chordBlocks.length === 0) return;
      playback.play();
      actions.setPlaybackPlaying(true);
    }
  };

  const handleChordResize = (id: string, newDuration: number) => {
    const block = chordBlocks.find(b => b.id === id);
    if (block) {
      const updatedBlock = { ...block, duration: newDuration };
      actions.updateChordBlock(updatedBlock);
    }
  };

  const handleChordDelete = (id: string) => {
    if (state.playbackState.isPlaying) {
      playback.stop();
      actions.setPlaybackPlaying(false);
      actions.setPlaybackBeat(0);
    }
    actions.removeChordBlock(id);
  };

  const handleChordPlay = async (block: ChordBlockType) => {
    const frequencies = getChordFrequencies(block.rootNote, block.intervals, 4);
    await audio.playChord(frequencies);
  };

  const handleClearProgression = () => {
    if (state.playbackState.isPlaying) {
      playback.stop();
      actions.setPlaybackPlaying(false);
      actions.setPlaybackBeat(0);
    }
    chordBlocks.forEach(block => actions.removeChordBlock(block.id));
  };

  return (
    <div className="chord-timeline-grid">
      <div className="timeline-header">
        <div className="timeline-header-left">
          <h3>Chord Timeline</h3>
          <div className="timeline-info">
            {chordBlocks.length} chords • {grid.eighthsToBeats(totalDurationInEighths).toFixed(1)} beats
          </div>
        </div>
        <div className="timeline-header-right">
          <div className="playback-controls">
            <button
              className="play-button"
              onClick={handlePlayPause}
              disabled={chordBlocks.length === 0}
            >
              {state.playbackState.isPlaying ? (
                <>
                  <Pause size={18} />
                  <span>Pause</span>
                </>
              ) : (
                <>
                  <Play size={18} />
                  <span>Play</span>
                </>
              )}
            </button>
            <button
              className={`loop-button ${state.playbackState.loop ? 'active' : ''}`}
              onClick={() => actions.toggleLoop()}
            >
              <Repeat size={18} />
              <span>Loop</span>
            </button>
            <div className="tempo-control">
              <label>Tempo:</label>
              <input
                type="number"
                min="60"
                max="180"
                value={state.song.tempo}
                onChange={(e) => actions.setTempo(parseInt(e.target.value) || 120)}
              />
              <span>BPM</span>
            </div>
          </div>
          <div className="volume-controls">
            <VolumeSlider
              value={settings.volume.master}
              onChange={actions.setMasterVolume}
              color="#667eea"
              label="Master"
              orientation="horizontal"
            />
            <VolumeSlider
              value={settings.volume.tracks.chords}
              onChange={(v) => actions.setTrackVolume('chords', v)}
              color="#764ba2"
              label="Chords"
              orientation="horizontal"
            />
          </div>
          {chordBlocks.length > 0 && (
            <button
              className="clear-button"
              onClick={handleClearProgression}
              title="Clear timeline"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      <div className="timeline-scroll-container">
        <div
          ref={timelineRef}
          className="timeline-canvas"
          style={{ width: timelineWidth }}
        >
          <Ruler totalMeasures={totalMeasures} />

          <div className="timeline-grid-background">
            {Array.from({ length: totalMeasures }, (_, i) => (
              <div
                key={i}
                className="measure-column"
                style={{ width: grid.config.measureWidth }}
              />
            ))}
          </div>

          <div className="timeline-tracks">
            <div className="chord-track">
              {chordBlocks.map((block, index) => (
                <ChordBlock
                  key={block.id}
                  block={block}
                  blockIndex={index}
                  isPlaying={state.playbackState.isPlaying && state.playbackState.currentBeat === index}
                  onResize={handleChordResize}
                  onDelete={handleChordDelete}
                  onPlay={handleChordPlay}
                  onReorder={actions.reorderChordBlocks}
                  onMove={actions.moveChordBlock}
                />
              ))}
            </div>
          </div>

          {state.playbackState.isPlaying && (
            <div
              className="playhead"
              style={{ left: `${playheadPosition}px` }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
