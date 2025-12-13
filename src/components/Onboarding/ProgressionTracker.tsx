import { PROGRESSION_TARGET_CHORDS } from '../../config/onboarding';

interface ProgressionTrackerProps {
  playedChords: Set<string>;
  progressionIndex: number;
  isComplete: boolean;
  hasError: boolean;
  song: { lyric: string; song: string; artist: string };
}

export function ProgressionTracker({
  playedChords,
  progressionIndex,
  isComplete,
  hasError,
  song,
}: ProgressionTrackerProps) {
  return (
    <div className="progression-tracker-wrapper">
      <div
        className={`progression-tracker ${isComplete ? 'complete' : ''} ${hasError ? 'error' : ''}`}
      >
        {PROGRESSION_TARGET_CHORDS.map((chord, index) => {
          const isPlayed = playedChords.has(chord);
          const isNext = index === progressionIndex && !isComplete;

          return (
            <div key={chord} className="progression-step">
              <div
                className={`progression-chord ${isPlayed ? 'played' : ''} ${isNext ? 'next' : ''}`}
              >
                <span className="progression-numeral">{chord}</span>
                {isPlayed && (
                  <svg className="progression-check" viewBox="0 0 24 24" width="14" height="14">
                    <path
                      fill="currentColor"
                      d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"
                    />
                  </svg>
                )}
              </div>
              {index < PROGRESSION_TARGET_CHORDS.length - 1 && (
                <span className="progression-arrow">{'\u2192'}</span>
              )}
            </div>
          );
        })}
      </div>

      {isComplete && (
        <div className="progression-lyric">
          <span className="lyric-text">"{song.lyric}"</span>
          <span className="lyric-attribution">
            — {song.song}, {song.artist}
          </span>
        </div>
      )}
    </div>
  );
}
