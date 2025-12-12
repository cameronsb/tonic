import { useState, useCallback, useEffect } from 'react';
import { useMusic } from '../hooks/useMusic';
import { useSettings } from '../hooks/useSettings';
import { NOTES } from '../utils/musicTheory';
import { VolumeSlider } from './VolumeSlider';
import './ConfigBar.css';

export function ConfigBar() {
  const { state, actions } = useMusic();
  const { settings } = useSettings();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const toggleDrawer = useCallback(() => {
    setIsDrawerOpen(prev => !prev);
  }, []);

  const closeDrawer = useCallback(() => {
    setIsDrawerOpen(false);
  }, []);

  // Close drawer on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isDrawerOpen) {
        closeDrawer();
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isDrawerOpen, closeDrawer]);

  return (
    <>
      {/* Minimal header bar */}
      <header className="header-bar">
        <div className="header-brand">
          <span className="header-title">Tonic</span>
          <select
            id="key-scale-select"
            className="header-key-badge-select"
            value={`${state.key}-${state.mode}`}
            onChange={(e) => {
              const [key, mode] = e.target.value.split('-') as [typeof NOTES[number], 'major' | 'minor'];
              actions.selectKey(key);
              actions.setMode(mode);
            }}
            aria-label="Select key and scale"
          >
            <optgroup label="Major Keys">
              {NOTES.map((note) => (
                <option key={`${note}-major`} value={`${note}-major`}>
                  {note} Major
                </option>
              ))}
            </optgroup>
            <optgroup label="Minor Keys">
              {NOTES.map((note) => (
                <option key={`${note}-minor`} value={`${note}-minor`}>
                  {note} Minor
                </option>
              ))}
            </optgroup>
          </select>
        </div>

        <button
          className="settings-button"
          onClick={toggleDrawer}
          aria-label="Open settings"
          aria-expanded={isDrawerOpen}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
        </button>
      </header>

      {/* Settings drawer backdrop */}
      {isDrawerOpen && (
        <div
          className="drawer-backdrop"
          onClick={closeDrawer}
          aria-hidden="true"
        />
      )}

      {/* Settings drawer */}
      <aside className={`settings-drawer ${isDrawerOpen ? 'open' : ''}`}>
        <div className="drawer-header">
          <h2 className="drawer-title">Settings</h2>
          <button
            className="drawer-close"
            onClick={closeDrawer}
            aria-label="Close settings"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="drawer-content">
          {/* Volume Section */}
          <section className="settings-section">
            <h3 className="section-title">Audio</h3>
            <div className="setting-item">
              <label className="setting-label">Master Volume</label>
              <VolumeSlider
                value={settings.volume.master}
                onChange={actions.setMasterVolume}
                color="#667eea"
                orientation="horizontal"
              />
            </div>
          </section>

          {/* Key & Scale Section */}
          <section className="settings-section">
            <h3 className="section-title">Key & Scale</h3>

            <div className="setting-item">
              <label className="setting-label" htmlFor="key-select">Key</label>
              <select
                id="key-select"
                className="setting-select"
                value={state.key}
                onChange={(e) => actions.selectKey(e.target.value as typeof NOTES[number])}
              >
                {NOTES.map((note) => (
                  <option key={note} value={note}>
                    {note}
                  </option>
                ))}
              </select>
            </div>

            <div className="setting-item">
              <label className="setting-label" htmlFor="scale-select">Scale</label>
              <select
                id="scale-select"
                className="setting-select"
                value={state.mode}
                onChange={(e) => actions.setMode(e.target.value as 'major' | 'minor')}
              >
                <option value="major">Major</option>
                <option value="minor">Minor</option>
              </select>
            </div>
          </section>

          {/* About Section */}
          <section className="settings-section settings-section-about">
            <h3 className="section-title">About</h3>
            <p className="about-text">
              A music theory learning tool for exploring chords, scales, and progressions.
            </p>
            <p className="about-credit">
              Built by Cameron Brown
            </p>
          </section>
        </div>
      </aside>
    </>
  );
}
