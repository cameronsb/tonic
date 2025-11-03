import { useRef, useCallback, useEffect, useState } from "react";
import type { Player } from "soundfont-player";
import Soundfont from "soundfont-player";

interface AudioEngine {
    context: AudioContext | null;
    instrument: Player | null;
    initialized: boolean;
    loading: boolean;
}

export function useAudioEngine() {
    const [loading, setLoading] = useState(false);
    const audioRef = useRef<AudioEngine>({
        context: null,
        instrument: null,
        initialized: false,
        loading: false,
    });

    useEffect(() => {
        const initAudio = async () => {
            if (audioRef.current.initialized || audioRef.current.loading)
                return;

            audioRef.current.loading = true;
            setLoading(true);

            try {
                const AudioContextClass =
                    window.AudioContext || (window as any).webkitAudioContext;
                const context = new AudioContextClass();

                // Load acoustic grand piano soundfont
                const instrument = await Soundfont.instrument(
                    context,
                    "acoustic_grand_piano",
                    {
                        soundfont: "MusyngKite",
                        // You can also use "FluidR3_GM" for a different sound
                    }
                );

                audioRef.current = {
                    context,
                    instrument,
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

    const playNote = useCallback(async (frequency: number, duration = 0.3, volume = 0.8) => {
        const { instrument, initialized, context } = audioRef.current;
        if (!instrument || !initialized || !context) {
            console.warn('Audio engine not ready yet');
            return;
        }

        // Resume audio context if suspended
        if (context.state === 'suspended') {
            await context.resume();
        }

        // Convert frequency to MIDI note number
        const midiNote = frequencyToMidi(frequency);

        // Play the note with the sampled piano sound - use currentTime for immediate playback
        instrument.play(midiNote, context.currentTime, { duration, gain: volume });
    }, []);

    const playChord = useCallback(async (frequencies: number[], duration = 0.8, volume = 0.6) => {
        const { instrument, initialized, context } = audioRef.current;
        if (!instrument || !initialized || !context) {
            console.warn('Audio engine not ready yet');
            return;
        }

        // Resume audio context if suspended
        if (context.state === 'suspended') {
            await context.resume();
        }

        // Play all notes simultaneously - use currentTime for immediate playback
        const now = context.currentTime;
        frequencies.forEach((freq) => {
            const midiNote = frequencyToMidi(freq);
            instrument.play(midiNote, now, { duration, gain: volume });
        });
    }, []);

    const playKick = useCallback((time?: number, volume = 1.0) => {
        const { context } = audioRef.current;
        if (!context) return;

        const when = time ?? context.currentTime;
        const duration = 0.35; // Shortened from 0.5

        // Create oscillator for kick drum (low frequency sweep)
        const osc = context.createOscillator();
        const gain = context.createGain();

        osc.frequency.setValueAtTime(150, when);
        osc.frequency.exponentialRampToValueAtTime(0.01, when + duration);

        gain.gain.setValueAtTime(1 * volume, when);
        gain.gain.exponentialRampToValueAtTime(0.001, when + duration);

        osc.connect(gain);
        gain.connect(context.destination);

        osc.start(when);
        osc.stop(when + duration + 0.01);
    }, []);

    const playSnare = useCallback((time?: number, volume = 1.0) => {
        const { context } = audioRef.current;
        if (!context) return;

        const when = time ?? context.currentTime;

        // Create noise for snare drum
        const bufferSize = context.sampleRate * 0.2;
        const buffer = context.createBuffer(1, bufferSize, context.sampleRate);
        const data = buffer.getChannelData(0);

        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }

        const noise = context.createBufferSource();
        noise.buffer = buffer;

        const noiseGain = context.createGain();
        noiseGain.gain.setValueAtTime(0.7 * volume, when);
        noiseGain.gain.exponentialRampToValueAtTime(0.01, when + 0.2);

        // Add tonal component
        const osc = context.createOscillator();
        const oscGain = context.createGain();
        osc.frequency.value = 200;

        oscGain.gain.setValueAtTime(0.3 * volume, when);
        oscGain.gain.exponentialRampToValueAtTime(0.01, when + 0.1);

        noise.connect(noiseGain);
        noiseGain.connect(context.destination);

        osc.connect(oscGain);
        oscGain.connect(context.destination);

        noise.start(when);
        osc.start(when);
        noise.stop(when + 0.2);
        osc.stop(when + 0.1);
    }, []);

    const playHiHat = useCallback((time?: number, volume = 1.0) => {
        const { context } = audioRef.current;
        if (!context) return;

        const when = time ?? context.currentTime;

        // Create noise for hi-hat
        const bufferSize = context.sampleRate * 0.05;
        const buffer = context.createBuffer(1, bufferSize, context.sampleRate);
        const data = buffer.getChannelData(0);

        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }

        const noise = context.createBufferSource();
        noise.buffer = buffer;

        const highpass = context.createBiquadFilter();
        highpass.type = 'highpass';
        highpass.frequency.value = 7000;

        const gain = context.createGain();
        gain.gain.setValueAtTime(0.3 * volume, when);
        gain.gain.exponentialRampToValueAtTime(0.01, when + 0.05);

        noise.connect(highpass);
        highpass.connect(gain);
        gain.connect(context.destination);

        noise.start(when);
        noise.stop(when + 0.05);
    }, []);

    return {
        playNote,
        playChord,
        playKick,
        playSnare,
        playHiHat,
        loading,
        audioContext: audioRef.current.context,
        instrument: audioRef.current.instrument,
    };
}

// Helper function to convert frequency to MIDI note number
function frequencyToMidi(frequency: number): number {
    return Math.round(69 + 12 * Math.log2(frequency / 440));
}
