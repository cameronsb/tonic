import { useState } from 'react';
import { useMusic } from '../hooks/useMusic';
import { NOTES } from '../utils/musicTheory';
import './ConfigBar.css';

type Mode = 'learn' | 'build';

 
interface ConfigBarProps {
  mode: Mode;
  onModeChange: (mode: Mode) => void;
}
 

export function ConfigBar({ mode, onModeChange }: ConfigBarProps) {
  const { state, actions } = useMusic();
  const [menuOpen, setMenuOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className={`config-bar ${isCollapsed ? 'collapsed' : ''}`}>
      {/* Collapse Toggle Button */}
      <button
        className="collapse-toggle"
        onClick={() => setIsCollapsed(!isCollapsed)}
        aria-label={isCollapsed ? 'Expand config bar' : 'Collapse config bar'}
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
          <path d={isCollapsed ?
            "M6 9l4 4 4-4" : // Down arrow when collapsed
            "M14 11l-4-4-4 4"  // Up arrow when expanded
          } stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      <div className="mode-toggle">
        <button
          className={mode === 'learn' ? 'active' : ''}
          onClick={() => onModeChange('learn')}
        >
          Learn
        </button>
        <button
          className={mode === 'build' ? 'active' : ''}
          onClick={() => onModeChange('build')}
        >
          Build
        </button>
      </div>

      <button
        className="menu-toggle"
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label="Toggle settings menu"
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
          <path d="M3 5h14M3 10h14M3 15h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      </button>

      <div className={`config-controls ${menuOpen ? 'open' : ''}`}>
        <div className="control-group">
          <label>Key</label>
          <select
            value={state.song.key}
            onChange={(e) => actions.selectKey(e.target.value as typeof NOTES[number])}
          >
            {NOTES.map((note) => (
              <option key={note} value={note}>
                {note}
              </option>
            ))}
          </select>
        </div>

        <div className="control-group">
          <label>Scale</label>
          <select
            value={state.song.mode}
            onChange={(e) => actions.setMode(e.target.value as 'major' | 'minor')}
          >
            <option value="major">Major</option>
            <option value="minor">Minor</option>
          </select>
        </div>

        {mode === 'build' && (
          <div className="control-group">
            <label>Time</label>
            <select defaultValue="4/4">
              <option value="4/4">4/4</option>
              <option value="3/4">3/4</option>
              <option value="6/8">6/8</option>
            </select>
          </div>
        )}
      </div>

      {menuOpen && (
        <div
          className="menu-overlay"
          onClick={() => setMenuOpen(false)}
        />
      )}
    </div>
  );
}
