import { useState, useEffect, useRef } from 'react';
import type React from 'react';

interface PianoLayoutConfig {
  whiteKeyWidth: number;
  whiteKeyHeight: number;
  blackKeyWidth: number;
  blackKeyHeight: number;
  startOctave: number;
  octaveCount: number;
  adjustHeight: boolean; // Whether to scale height based on container
}

interface PianoLayout {
  whiteKeyWidth: number;
  whiteKeyHeight: number;
  blackKeyWidth: number;
  blackKeyHeight: number;
  startOctave: number;
  octaveCount: number;
}

const WHITE_KEY_WIDTH = 60; // Fixed as requested
const WHITE_KEYS_PER_OCTAVE = 7;
const DEFAULT_WHITE_KEY_HEIGHT = 240;
const DEFAULT_BLACK_KEY_HEIGHT = 150;
const BLACK_TO_WHITE_HEIGHT_RATIO = DEFAULT_BLACK_KEY_HEIGHT / DEFAULT_WHITE_KEY_HEIGHT; // 0.625
const BLACK_TO_WHITE_WIDTH_RATIO = 36 / 60; // 0.6

const MIN_OCTAVES = 1;
const MAX_OCTAVES = 7;
const DEFAULT_OCTAVES = 2;
const DEFAULT_START_OCTAVE = 4;

/**
 * Custom hook to calculate optimal piano layout based on container dimensions
 * Keeps white key width constant at 60px, adjusts octave count for width and key height for container height
 */
export function usePianoLayout<T extends HTMLElement>(
  containerRef: React.RefObject<T>,
  options: Partial<PianoLayoutConfig> = {}
): PianoLayout {
  const {
    whiteKeyWidth = WHITE_KEY_WIDTH,
    whiteKeyHeight = DEFAULT_WHITE_KEY_HEIGHT,
    blackKeyWidth = WHITE_KEY_WIDTH * BLACK_TO_WHITE_WIDTH_RATIO,
    blackKeyHeight = DEFAULT_BLACK_KEY_HEIGHT,
    startOctave = DEFAULT_START_OCTAVE,
    octaveCount = DEFAULT_OCTAVES,
    adjustHeight = false, // By default, don't adjust height - only adjust octave count
  } = options;

  const [layout, setLayout] = useState<PianoLayout>({
    whiteKeyWidth,
    whiteKeyHeight,
    blackKeyWidth,
    blackKeyHeight,
    startOctave,
    octaveCount,
  });

  const resizeObserverRef = useRef<ResizeObserver | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const calculateLayout = (width: number, height: number): PianoLayout => {
      // Calculate available space
      // Note: ResizeObserver's contentRect already excludes the element's padding
      const availableWidth = width;
      const availableHeight = height;

      // Calculate optimal octave count based on width
      // Each octave needs 7 white keys * 60px = 420px
      const octaveWidth = WHITE_KEYS_PER_OCTAVE * whiteKeyWidth;

      // We want to fit as many octaves as possible, but need at least 1 extra white key (the C at the end)
      // So we calculate: floor((availableWidth - whiteKeyWidth) / octaveWidth)
      const maxOctavesForWidth = Math.floor((availableWidth - whiteKeyWidth) / octaveWidth);
      const calculatedOctaves = Math.max(MIN_OCTAVES, Math.min(MAX_OCTAVES, maxOctavesForWidth));

      // Use provided octaveCount if it fits, otherwise use calculated
      let finalOctaveCount = octaveCount;
      const requiredWidth = (octaveCount * WHITE_KEYS_PER_OCTAVE + 1) * whiteKeyWidth; // +1 for final C

      if (requiredWidth > availableWidth) {
        // Container too narrow, use calculated octaves
        finalOctaveCount = calculatedOctaves;
      } else if (maxOctavesForWidth > octaveCount) {
        // Container has room for more octaves, use calculated if significantly more
        finalOctaveCount = calculatedOctaves;
      }

      // Calculate optimal key height based on available height
      let finalWhiteKeyHeight = whiteKeyHeight;
      let finalBlackKeyHeight = blackKeyHeight;

      // Only adjust height if explicitly enabled
      if (adjustHeight && availableHeight > 0) {
        // Use available height, constrained by reasonable limits
        // Fill the container but maintain minimum and maximum sizes
        const minHeight = 100;
        const maxHeight = DEFAULT_WHITE_KEY_HEIGHT; // Don't exceed default size (240px)
        finalWhiteKeyHeight = Math.max(minHeight, Math.min(maxHeight, availableHeight));
        finalBlackKeyHeight = Math.round(finalWhiteKeyHeight * BLACK_TO_WHITE_HEIGHT_RATIO);
      }

      // Calculate optimal starting octave to center around middle C (C4)
      // Try to center the piano around C4-C5 range
      let finalStartOctave = startOctave;
      if (finalOctaveCount >= 2) {
        // Center around C4
        finalStartOctave = Math.max(1, Math.min(6, 4 - Math.floor(finalOctaveCount / 2)));
      }

      return {
        whiteKeyWidth,
        whiteKeyHeight: finalWhiteKeyHeight,
        blackKeyWidth: Math.round(whiteKeyWidth * BLACK_TO_WHITE_WIDTH_RATIO),
        blackKeyHeight: finalBlackKeyHeight,
        startOctave: finalStartOctave,
        octaveCount: finalOctaveCount,
      };
    };

    // Initial calculation
    const rect = container.getBoundingClientRect();
    setLayout(calculateLayout(rect.width, rect.height));

    // Set up ResizeObserver for dynamic updates
    resizeObserverRef.current = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        setLayout(calculateLayout(width, height));
      }
    });

    resizeObserverRef.current.observe(container);

    return () => {
      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect();
      }
    };
  }, [
    containerRef,
    whiteKeyWidth,
    whiteKeyHeight,
    blackKeyWidth,
    blackKeyHeight,
    startOctave,
    octaveCount,
    adjustHeight,
  ]);

  return layout;
}
