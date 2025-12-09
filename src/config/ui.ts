/**
 * UI Configuration
 *
 * Size constraints for resizable panels and components.
 */

/**
 * Size constraints for resizable panels and components
 */
export const SIZES = {
  // Learn mode sidebar (desktop layout)
  learnSidebar: {
    min: 280,
    max: 600,
    default: 420,
  },

  // Learn mode piano height (tablet layout)
  learnTabletPiano: {
    min: 200,
    max: 500,
    default: 300,
  },

  // Builder panel height (bottom panel in build mode)
  builderPanel: {
    min: 150,
    max: 600,
    default: 250,
  },

  // Chord palette width
  chordPalette: {
    width: 280,
    minWidth: 280,
  },

  // Touch target minimum (iOS guideline)
  minTouchTarget: 44,

  // ConfigBar heights
  configBar: {
    normal: 56,
    collapsed: 10,
  },
} as const;
