import { useMemo } from 'react';
import { useMusic } from './useMusic';

// Grid constants
export const PIXELS_PER_BEAT = 40; // How wide each quarter note is
export const PIXELS_PER_EIGHTH = PIXELS_PER_BEAT / 2; // 20px per 8th note
export const BEATS_PER_MEASURE = 4; // Default 4/4 time
export const EIGHTHS_PER_MEASURE = BEATS_PER_MEASURE * 2; // 8 eighth notes per measure
export const MEASURE_WIDTH = PIXELS_PER_BEAT * BEATS_PER_MEASURE; // 160px per measure

export interface GridConfig {
    pixelsPerBeat: number;
    pixelsPerEighth: number;
    beatsPerMeasure: number;
    eighthsPerMeasure: number;
    measureWidth: number;
}

 
export interface GridUtils {
    timeToPixels: (_timeInEighths: number) => number;
    pixelsToTime: (_pixels: number) => number;
    snapToGrid: (_pixels: number) => number;
    beatsToEighths: (_beats: number) => number;
    eighthsToBeats: (_eighths: number) => number;
    getMeasureAtTime: (_timeInEighths: number) => number;
    getBeatInMeasure: (_timeInEighths: number) => number;
    config: GridConfig;
}
 

/**
 * Hook that provides grid calculation utilities for the timeline
 * All time values are in 8th notes (the smallest unit in the grid)
 */
export function useGrid(): GridUtils {
    const { state } = useMusic();

    const config: GridConfig = useMemo(() => {
        const beatsPerMeasure = state.song.timeSignature.numerator;
        const eighthsPerMeasure = beatsPerMeasure * 2;
        const measureWidth = PIXELS_PER_BEAT * beatsPerMeasure;

        return {
            pixelsPerBeat: PIXELS_PER_BEAT,
            pixelsPerEighth: PIXELS_PER_EIGHTH,
            beatsPerMeasure,
            eighthsPerMeasure,
            measureWidth,
        };
    }, [state.song.timeSignature.numerator]);

    const timeToPixels = useMemo(() => {
        return (timeInEighths: number): number => {
            return timeInEighths * PIXELS_PER_EIGHTH;
        };
    }, []);

    const pixelsToTime = useMemo(() => {
        return (pixels: number): number => {
            return pixels / PIXELS_PER_EIGHTH;
        };
    }, []);

    const snapToGrid = useMemo(() => {
        return (pixels: number): number => {
            const timeInEighths = Math.round(pixels / PIXELS_PER_EIGHTH);
            return timeInEighths * PIXELS_PER_EIGHTH;
        };
    }, []);

    const beatsToEighths = useMemo(() => {
        return (beats: number): number => {
            return beats * 2;
        };
    }, []);

    const eighthsToBeats = useMemo(() => {
        return (eighths: number): number => {
            return eighths / 2;
        };
    }, []);

    const getMeasureAtTime = useMemo(() => {
        return (timeInEighths: number): number => {
            return Math.floor(timeInEighths / config.eighthsPerMeasure);
        };
    }, [config.eighthsPerMeasure]);

    const getBeatInMeasure = useMemo(() => {
        return (timeInEighths: number): number => {
            const eighthInMeasure = timeInEighths % config.eighthsPerMeasure;
            return Math.floor(eighthInMeasure / 2) + 1; // 1-indexed beats
        };
    }, [config.eighthsPerMeasure]);

    return {
        timeToPixels,
        pixelsToTime,
        snapToGrid,
        beatsToEighths,
        eighthsToBeats,
        getMeasureAtTime,
        getBeatInMeasure,
        config,
    };
}

