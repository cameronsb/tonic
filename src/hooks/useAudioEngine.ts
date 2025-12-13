import { useRef, useCallback, useEffect, useState } from 'react';
import type { Player } from 'soundfont-player';
import Soundfont from 'soundfont-player';

interface AudioEngine {
  context: AudioContext | null;
  instrument: Player | null;
  masterGain: GainNode | null;
  initialized: boolean;
  loading: boolean;
}

// Silent audio track (base64-encoded tiny MP3) to bypass iOS mute switch
// This forces Web Audio onto the media channel instead of the ringer channel
const SILENT_AUDIO_DATA_URI =
  'data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4Ljc2LjEwMAAAAAAAAAAAAAAA//tQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWGluZwAAAA8AAAACAAABhgC7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7//////////////////////////////////////////////////////////////////8AAAAATGF2YzU4LjEzAAAAAAAAAAAAAAAAJAAAAAAAAAAAAYYoRBrWAAAAAAAAAAAAAAAAAAAA//tQZAAP8AAAaQAAAAgAAA0gAAABAAABpAAAACAAADSAAAAETEFNRTMuMTAwVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV//tQZB4P8AAAaQAAAAgAAA0gAAABAAABpAAAACAAADSAAAAEVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV';

let silentAudioElement: HTMLAudioElement | null = null;
let iOSAudioUnlocked = false;

// Detect iOS devices (including iPads reporting as macOS)
function isIOS(): boolean {
  const userAgent = navigator.userAgent.toLowerCase();
  const isIOSUserAgent = /iphone|ipad|ipod/.test(userAgent);
  const isMacWithTouch = /macintosh/.test(userAgent) && navigator.maxTouchPoints > 0;
  return isIOSUserAgent || isMacWithTouch;
}

// Unlock iOS audio by playing silent track - forces Web Audio onto media channel
function unlockIOSAudio() {
  if (iOSAudioUnlocked || !isIOS()) return;

  try {
    if (!silentAudioElement) {
      silentAudioElement = new Audio(SILENT_AUDIO_DATA_URI);
      silentAudioElement.loop = true;
      silentAudioElement.volume = 0.01; // Nearly silent but not zero
    }

    const playPromise = silentAudioElement.play();
    if (playPromise) {
      playPromise
        .then(() => {
          iOSAudioUnlocked = true;
        })
        .catch(() => {
          // Playback failed, will retry on next interaction
        });
    }
  } catch {
    // Ignore errors, will retry on next interaction
  }
}

// Set up iOS audio unlock on user interaction
let unlockListenerAdded = false;

function setupIOSAudioUnlock() {
  if (unlockListenerAdded || !isIOS()) return;
  unlockListenerAdded = true;

  const events = ['touchend', 'click'];

  const handleInteraction = () => {
    unlockIOSAudio();
    if (iOSAudioUnlocked) {
      events.forEach((event) => {
        document.removeEventListener(event, handleInteraction, true);
      });
    }
  };

  events.forEach((event) => {
    document.addEventListener(event, handleInteraction, true);
  });
}

export function useAudioEngine() {
  const [loading, setLoading] = useState(false);
  const audioRef = useRef<AudioEngine>({
    context: null,
    instrument: null,
    masterGain: null,
    initialized: false,
    loading: false,
  });

  useEffect(() => {
    // Set up iOS mute switch bypass
    setupIOSAudioUnlock();

    const initAudio = async () => {
      if (audioRef.current.initialized || audioRef.current.loading) return;

      audioRef.current.loading = true;
      setLoading(true);

      try {
        const AudioContextClass =
          window.AudioContext ||
          (
            window as unknown as {
              webkitAudioContext?: typeof AudioContext;
            }
          ).webkitAudioContext;
        const context = new AudioContextClass();

        const masterGain = context.createGain();
        masterGain.gain.value = 1.5;
        masterGain.connect(context.destination);

        const instrument = await Soundfont.instrument(context, 'acoustic_grand_piano', {
          soundfont: 'MusyngKite',
          destination: masterGain,
        });

        audioRef.current = {
          context,
          instrument,
          masterGain,
          initialized: true,
          loading: false,
        };

        setLoading(false);
      } catch (error) {
        console.error('Failed to load piano soundfont:', error);
        audioRef.current.loading = false;
        setLoading(false);
      }
    };

    initAudio();
  }, []);

  const playNote = useCallback(async (frequency: number, duration = 0.3, volume = 1.5) => {
    const { instrument, initialized, context } = audioRef.current;
    if (!instrument || !initialized || !context) {
      return;
    }

    // Resume audio context if suspended
    if (context.state === 'suspended') {
      await context.resume();
    }

    // Ensure iOS audio is unlocked
    unlockIOSAudio();

    const midiNote = frequencyToMidi(frequency);
    instrument.play(midiNote, context.currentTime, {
      duration,
      gain: volume,
    });
  }, []);

  const playChord = useCallback(async (frequencies: number[], duration = 0.8, volume = 1.3) => {
    const { instrument, initialized, context } = audioRef.current;
    if (!instrument || !initialized || !context) {
      return;
    }

    // Resume audio context if suspended
    if (context.state === 'suspended') {
      await context.resume();
    }

    // Ensure iOS audio is unlocked
    unlockIOSAudio();

    const now = context.currentTime;
    frequencies.forEach((freq) => {
      const midiNote = frequencyToMidi(freq);
      instrument.play(midiNote, now, { duration, gain: volume });
    });
  }, []);

  const setMasterVolume = useCallback((volume: number) => {
    const { masterGain } = audioRef.current;
    if (!masterGain) return;

    // Exponential scaling: 0→silent, ~40%→unity, 100%→4x gain
    const maxGain = 4.0;
    const exponent = 2.0;
    masterGain.gain.value = Math.max(0, maxGain * Math.pow(volume, exponent));
  }, []);

  return {
    playNote,
    playChord,
    setMasterVolume,
    loading,
    audioContext: audioRef.current.context,
    instrument: audioRef.current.instrument,
  };
}

// Helper function to convert frequency to MIDI note number
function frequencyToMidi(frequency: number): number {
  return Math.round(69 + 12 * Math.log2(frequency / 440));
}
