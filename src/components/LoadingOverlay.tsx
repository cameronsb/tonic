import { useMusic } from '../hooks/useMusic';
import { useState, useEffect } from 'react';
import './LoadingOverlay.css';

const MUSIC_TIPS = [
  'The Circle of Fifths helps you understand key relationships and chord progressions',
  'Borrowed chords come from parallel modes and add color to progressions',
  'The I-V-vi-IV progression is one of the most popular in modern music',
  'Seventh chords add complexity and tension to basic triads',
  'The diminished vii° chord functions as a dominant and wants to resolve to I',
  'Sus chords create tension by replacing the third with a second or fourth',
  'Modal interchange lets you borrow chords from parallel scales',
  'The ii-V-I progression is the foundation of jazz harmony',
  'Adding 9ths and 11ths creates more sophisticated, jazzy sounds',
  'The ♭VII borrowed chord creates a strong pull back to the tonic',
];

export function LoadingOverlay() {
  const { audio } = useMusic();
  const [progress, setProgress] = useState(0);
  const [currentTip, setCurrentTip] = useState(0);

  // Simulate progress since soundfont-player doesn't provide real progress
  useEffect(() => {
    if (!audio.loading) return;

    const duration = 20000; // Expected ~20 second load time
    const interval = 100; // Update every 100ms
    const increment = (interval / duration) * 100;

    const timer = setInterval(() => {
      setProgress((prev) => {
        // Slow down as we approach 95% to avoid completing before actual load
        if (prev >= 95) return prev;
        return Math.min(prev + increment * (1 - prev / 150), 95);
      });
    }, interval);

    return () => clearInterval(timer);
  }, [audio.loading]);

  // Rotate through tips every 4 seconds
  useEffect(() => {
    if (!audio.loading) return;

    const tipTimer = setInterval(() => {
      setCurrentTip((prev) => (prev + 1) % MUSIC_TIPS.length);
    }, 4000);

    return () => clearInterval(tipTimer);
  }, [audio.loading]);

  // Reset when loading completes
  useEffect(() => {
    if (!audio.loading) {
      setProgress(0);
      setCurrentTip(0);
    }
  }, [audio.loading]);

  if (!audio.loading) {
    return null;
  }

  return (
    <div className="loading-overlay">
      <div className="loading-content">
        <div className="loading-piano">
          <div className="loading-key white"></div>
          <div className="loading-key black"></div>
          <div className="loading-key white"></div>
          <div className="loading-key black"></div>
          <div className="loading-key white"></div>
          <div className="loading-key white"></div>
          <div className="loading-key black"></div>
          <div className="loading-key white"></div>
        </div>

        <div className="loading-info">
          <p className="loading-text">Loading high-quality piano samples...</p>
          <div className="loading-progress-container">
            <div className="loading-progress-bar">
              <div className="loading-progress-fill" style={{ width: `${progress}%` }} />
            </div>
            <span className="loading-percentage">{Math.round(progress)}%</span>
          </div>
        </div>

        <div className="loading-tip">
          <span className="loading-tip-label">Music Tip:</span>
          <p className="loading-tip-text">{MUSIC_TIPS[currentTip]}</p>
        </div>
      </div>
    </div>
  );
}
