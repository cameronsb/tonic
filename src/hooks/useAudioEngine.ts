import { useRef, useCallback, useEffect, useState } from "react";
import type { Player } from "soundfont-player";
import Soundfont from "soundfont-player";

interface AudioEngine {
    context: AudioContext | null;
    instrument: Player | null;
    masterGain: GainNode | null;
    initialized: boolean;
    loading: boolean;
}

// Global reference to AudioContext for iOS unlock
let globalAudioContext: AudioContext | null = null;
let unlockListenersAdded = false;

// iOS audio unlock handler - must be called synchronously within user gesture
function unlockAudioContext() {
    if (globalAudioContext && globalAudioContext.state === 'suspended') {
        globalAudioContext.resume();
    }
}

// Set up global unlock listeners once (called early, before context may exist)
function setupUnlockListeners() {
    if (unlockListenersAdded) return;
    unlockListenersAdded = true;

    const events = ['touchstart', 'touchend', 'click', 'keydown'];

    const handleUnlock = () => {
        unlockAudioContext();
        // Only remove listeners once audio is actually running
        if (globalAudioContext && globalAudioContext.state === 'running') {
            events.forEach(event => {
                document.removeEventListener(event, handleUnlock, true);
            });
        }
    };

    // Use capture phase to ensure we intercept before any other handler
    events.forEach(event => {
        document.addEventListener(event, handleUnlock, true);
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
        // Set up unlock listeners immediately on mount
        setupUnlockListeners();

        const initAudio = async () => {
            if (audioRef.current.initialized || audioRef.current.loading)
                return;

            audioRef.current.loading = true;
            setLoading(true);

            try {
                const AudioContextClass =
                    window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
                const context = new AudioContextClass();

                // Store reference for global unlock handler
                globalAudioContext = context;

                const masterGain = context.createGain();
                masterGain.gain.value = 1.5;
                masterGain.connect(context.destination);

                const instrument = await Soundfont.instrument(
                    context,
                    "acoustic_grand_piano",
                    {
                        soundfont: "MusyngKite",
                        destination: masterGain,
                    }
                );

                audioRef.current = {
                    context,
                    instrument,
                    masterGain,
                    initialized: true,
                    loading: false,
                };

                setLoading(false);
            } catch (error) {
                console.error("Failed to load piano soundfont:", error);
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

        const midiNote = frequencyToMidi(frequency);
        instrument.play(midiNote, context.currentTime, { duration, gain: volume });
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
