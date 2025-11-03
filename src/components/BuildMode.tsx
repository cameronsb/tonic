import { useState, useEffect, useCallback } from 'react';
import { useMusic } from '../hooks/useMusic';
import { useSettings } from '../hooks/useSettings';
import { useResizable } from '../hooks/useResizable';
import { ChordPalette } from './ChordPalette';
import { ChordTimeline } from './ChordTimeline';
import { DrumTrack } from './DrumTrack';
import { Piano } from './Piano';
import './BuildMode.css';

type BottomView = 'piano' | 'drums';

export function BuildMode() {
  const { actions } = useMusic();
  const {
    settings,
    setBuilderPanelHeight,
    setBuilderPanelTab,
    setBuilderPanelRememberedHeight
  } = useSettings();

  // Load saved tab preference
  const [bottomView, setBottomView] = useState<BottomView>(
    settings.ui.builderPanel.activeTab
  );

  // Save panel height to settings when it changes
  const handleResize = useCallback((newHeight: number) => {
    setBuilderPanelHeight(newHeight);
    setBuilderPanelRememberedHeight(bottomView, newHeight);
  }, [bottomView, setBuilderPanelHeight, setBuilderPanelRememberedHeight]);

  // Load remembered height for the active tab
  const initialHeight = settings.ui.builderPanel.rememberedHeights[bottomView];

  // Resizable bottom panel
  const { height: bottomHeight, isResizing, handleMouseDown, setHeight } = useResizable({
    initialHeight,
    minHeight: 150,
    maxHeight: 600,
    onResize: handleResize,
  });

  // Update height when switching tabs
  useEffect(() => {
    const rememberedHeight = settings.ui.builderPanel.rememberedHeights[bottomView];
    setHeight(rememberedHeight);
    setBuilderPanelHeight(rememberedHeight);
  }, [bottomView, settings.ui.builderPanel.rememberedHeights, setBuilderPanelHeight, setHeight]);

  // Handle tab change
  const handleTabChange = useCallback((tab: BottomView) => {
    setBottomView(tab);
    setBuilderPanelTab(tab);
  }, [setBuilderPanelTab]);

  // Set to build mode when component mounts
  useEffect(() => {
    actions.setChordDisplayMode('build');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="build-mode">
      <div className="build-mode-top" style={{ flex: 1, minHeight: 0 }}>
        <div className="chord-palette-container">
          <ChordPalette />
        </div>
        <div className="timeline-container">
          <ChordTimeline />
        </div>
      </div>

      {/* Resize handle */}
      <div
        className={`panel-resize-handle ${isResizing ? 'resizing' : ''}`}
        onMouseDown={handleMouseDown}
        title="Drag to resize"
      >
        <div className="panel-resize-indicator" />
      </div>

      <div className="build-mode-bottom" style={{ height: bottomHeight }}>
        <div className="bottom-view-tabs">
          <button
            className={`view-tab ${bottomView === 'piano' ? 'active' : ''}`}
            onClick={() => handleTabChange('piano')}
          >
            Piano
          </button>
          <button
            className={`view-tab ${bottomView === 'drums' ? 'active' : ''}`}
            onClick={() => handleTabChange('drums')}
          >
            Drums
          </button>
        </div>
        <div className={`bottom-view-content ${bottomView === 'piano' ? 'piano-view' : 'drums-view'}`}>
          {bottomView === 'piano' && <Piano showScaleDegrees={false} />}
          {bottomView === 'drums' && <DrumTrack />}
        </div>
      </div>
    </div>
  );
}
