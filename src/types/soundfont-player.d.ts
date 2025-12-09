// Type definitions for soundfont-player
declare module "soundfont-player" {
    export interface Player {
        play(
            note: string | number,
            time?: number,
            options?: {
                duration?: number;
                gain?: number;
                attack?: number;
                decay?: number;
                sustain?: number;
                release?: number;
            }
        ): void;
        stop(time?: number): void;
    }

    export interface InstrumentOptions {
        soundfont?: string;
        format?: string;
        nameToUrl?: (name: string, soundfont: string, format: string) => string;
        destination?: AudioNode;
        gain?: number;
        attack?: number;
        decay?: number;
        sustain?: number;
        release?: number;
    }

    function instrument(
        context: AudioContext,
        instrumentName: string,
        options?: InstrumentOptions
    ): Promise<Player>;

    export default {
        instrument,
    };
}
