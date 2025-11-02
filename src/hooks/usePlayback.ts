import { useRef, useCallback, useEffect } from 'react';
import type { ChordBlock } from '../types/music';
import type { Player } from 'soundfont-player';

interface ScheduledEvent {
  blockId: string;
  scheduledTime: number;
}

interface UsePlaybackOptions {
  tempo: number;
  chordBlocks: ChordBlock[];
  loop: boolean;
  audioContext: AudioContext | null;
  instrument: Player | null;
  onTimeUpdate?: (timeInEighths: number) => void;
  onPlaybackEnd?: () => void;
}

const LOOKAHEAD_TIME = 0.1;
const SCHEDULE_INTERVAL = 25;

export function usePlayback({
  tempo,
  chordBlocks,
  loop,
  audioContext,
  instrument,
  onTimeUpdate,
  onPlaybackEnd,
}: UsePlaybackOptions) {
  const isPlayingRef = useRef(false);
  const schedulerIdRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const rafIdRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const currentTimeInEighthsRef = useRef<number>(0);
  const scheduledEventsRef = useRef<ScheduledEvent[]>([]);

  const getSecondsPerEighth = useCallback(() => {
    return (60 / tempo) / 2;
  }, [tempo]);

  const getTotalDurationInEighths = useCallback(() => {
    if (chordBlocks.length === 0) return 0;
    return chordBlocks.reduce((sum, block) => sum + block.duration, 0);
  }, [chordBlocks]);

  const scheduleChord = useCallback(
    (block: ChordBlock, when: number) => {
      if (!instrument || !audioContext) return;

      const frequencies = getChordFrequenciesForBlock(block);
      const durationInSeconds = block.duration * getSecondsPerEighth();

      frequencies.forEach((freq) => {
        const midiNote = frequencyToMidi(freq);
        instrument.play(midiNote, audioContext.currentTime + when, {
          duration: durationInSeconds,
          gain: 0.6,
        });
      });
    },
    [instrument, audioContext, getSecondsPerEighth]
  );

  const scheduleAheadEvents = useCallback(() => {
    if (!audioContext || !isPlayingRef.current) return;

    const currentTime = audioContext.currentTime;
    const elapsedTime = currentTime - startTimeRef.current;
    const currentTimeInEighths = elapsedTime / getSecondsPerEighth();

    const scheduleAheadTime = currentTimeInEighths + (LOOKAHEAD_TIME / getSecondsPerEighth());

    for (const block of chordBlocks) {
      const blockStartTime = block.position;

      const alreadyScheduled = scheduledEventsRef.current.some(
        (event) => event.blockId === block.id && event.scheduledTime === blockStartTime
      );

      if (alreadyScheduled) continue;

      if (blockStartTime >= currentTimeInEighths && blockStartTime < scheduleAheadTime) {
        const timeUntilBlock = blockStartTime - currentTimeInEighths;
        const whenToPlay = timeUntilBlock * getSecondsPerEighth();

        scheduleChord(block, whenToPlay);

        scheduledEventsRef.current.push({
          blockId: block.id,
          scheduledTime: blockStartTime,
        });
      }
    }
  }, [
    audioContext,
    chordBlocks,
    getSecondsPerEighth,
    scheduleChord,
  ]);

  const pause = useCallback(() => {
    if (!isPlayingRef.current) return;

    isPlayingRef.current = false;

    if (schedulerIdRef.current) {
      clearInterval(schedulerIdRef.current);
      schedulerIdRef.current = null;
    }

    if (rafIdRef.current) {
      cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
    }
  }, []);

  const updatePlayhead = useCallback(() => {
    if (!audioContext || !isPlayingRef.current) return;

    const currentTime = audioContext.currentTime;
    const elapsedTime = currentTime - startTimeRef.current;
    const currentTimeInEighths = elapsedTime / getSecondsPerEighth();

    currentTimeInEighthsRef.current = currentTimeInEighths;

    if (onTimeUpdate) {
      onTimeUpdate(currentTimeInEighths);
    }

    const totalDuration = getTotalDurationInEighths();

    if (currentTimeInEighths >= totalDuration) {
      if (loop) {
        startTimeRef.current = audioContext.currentTime;
        currentTimeInEighthsRef.current = 0;
        scheduledEventsRef.current = [];
        scheduleAheadEvents();
      } else {
        pause();
        currentTimeInEighthsRef.current = 0;
        scheduledEventsRef.current = [];
        if (onTimeUpdate) {
          onTimeUpdate(0);
        }
        if (onPlaybackEnd) {
          onPlaybackEnd();
        }
        return;
      }
    }

    rafIdRef.current = requestAnimationFrame(updatePlayhead);
  }, [
    audioContext,
    getSecondsPerEighth,
    getTotalDurationInEighths,
    loop,
    onTimeUpdate,
    onPlaybackEnd,
    pause,
    scheduleAheadEvents,
  ]);

  const play = useCallback(() => {
    if (!audioContext || !instrument || chordBlocks.length === 0) return;
    if (isPlayingRef.current) return;

    if (audioContext.state === 'suspended') {
      audioContext.resume();
    }

    isPlayingRef.current = true;
    startTimeRef.current = audioContext.currentTime;
    currentTimeInEighthsRef.current = 0;
    scheduledEventsRef.current = [];

    scheduleAheadEvents();

    schedulerIdRef.current = setInterval(() => {
      scheduleAheadEvents();
    }, SCHEDULE_INTERVAL);

    rafIdRef.current = requestAnimationFrame(updatePlayhead);
  }, [audioContext, instrument, chordBlocks, scheduleAheadEvents, updatePlayhead]);

  const stop = useCallback(() => {
    pause();
    currentTimeInEighthsRef.current = 0;
    scheduledEventsRef.current = [];
    if (onTimeUpdate) {
      onTimeUpdate(0);
    }
  }, [pause, onTimeUpdate]);

  useEffect(() => {
    return () => {
      if (schedulerIdRef.current) {
        clearInterval(schedulerIdRef.current);
      }
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, []);

  return {
    play,
    pause,
    stop,
    isPlaying: isPlayingRef.current,
    currentTimeInEighths: currentTimeInEighthsRef.current,
  };
}

function getChordFrequenciesForBlock(block: ChordBlock): number[] {
  const rootFreq = noteToFrequency(block.rootNote, 4);
  const frequencies = [rootFreq];

  block.intervals.forEach((interval) => {
    const freq = rootFreq * Math.pow(2, interval / 12);
    frequencies.push(freq);
  });

  return frequencies;
}

function noteToFrequency(note: string, octave: number): number {
  const A4 = 440;
  const notes: { [key: string]: number } = {
    'C': -9, 'C#': -8, 'D': -7, 'D#': -6, 'E': -5, 'F': -4,
    'F#': -3, 'G': -2, 'G#': -1, 'A': 0, 'A#': 1, 'B': 2
  };

  const semitonesFromA4 = notes[note] + (octave - 4) * 12;
  return A4 * Math.pow(2, semitonesFromA4 / 12);
}

function frequencyToMidi(frequency: number): number {
  return Math.round(69 + 12 * Math.log2(frequency / 440));
}

