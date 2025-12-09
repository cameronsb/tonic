import type { ReactNode } from "react";
import { createContext, useReducer, useCallback, useEffect } from "react";
import type { Note, Mode, SelectedChord, ChordDisplayMode, ChordInProgression, Song, ChordBlock, DrumPattern, DrumBlock } from "../types/music";
import { useAudioEngine } from "../hooks/useAudioEngine";
import { useSettings } from "../hooks/useSettings";
import type { UserSettings } from "../types/settings";
// Note: Drum patterns feature removed (was only used in Build mode)

export type NoteSubdivision = "whole" | "quarter" | "eighth";

// Helper function to create an empty Song
function createEmptySong(): Song {
    const now = Date.now();
    return {
        id: `song-${now}`,
        name: "Untitled Song",
        tempo: 120,
        timeSignature: {
            numerator: 4,
            denominator: 4,
        },
        key: "C",
        mode: "major",
        tracks: {
            chords: { blocks: [] },
            melody: { notes: [] },
            drums: {
                patterns: [],
                blocks: []
            },
        },
        metadata: {
            createdAt: now,
            updatedAt: now,
        },
    };
}

interface MusicState {
    song: Song;
    selectedChords: SelectedChord[];
    chordDisplayMode: ChordDisplayMode;
    chordProgression: ChordInProgression[];
    scaleViewEnabled: boolean;
    keyboardPreviewEnabled: boolean;
    showInScaleColors: boolean;
    pianoRange: {
        startMidi: number;
        endMidi: number;
    };
    playbackState: {
        isPlaying: boolean;
        currentBeat: number;
        loop: boolean;
        subdivision: NoteSubdivision;
    };
}

// Action types
type MusicAction =
    | { type: "SELECT_KEY"; payload: Note }
    | { type: "SET_MODE"; payload: Mode }
    | { type: "SELECT_CHORD"; payload: SelectedChord }
    | { type: "DESELECT_CHORDS" }
    | { type: "SET_CHORD_DISPLAY_MODE"; payload: ChordDisplayMode }
    | { type: "ADD_TO_PROGRESSION"; payload: ChordInProgression }
    | { type: "REMOVE_FROM_PROGRESSION"; payload: string }
    | { type: "CLEAR_PROGRESSION" }
    | { type: "UPDATE_CHORD_DURATION"; payload: { id: string; duration: number } }
    | { type: "TOGGLE_SCALE_VIEW" }
    | { type: "TOGGLE_KEYBOARD_PREVIEW" }
    | { type: "TOGGLE_IN_SCALE_COLORS" }
    | { type: "SET_PIANO_RANGE"; payload: { startMidi: number; endMidi: number } }
    | { type: "SET_PLAYBACK_PLAYING"; payload: boolean }
    | { type: "SET_PLAYBACK_BEAT"; payload: number }
    | { type: "SET_TEMPO"; payload: number }
    | { type: "TOGGLE_LOOP" }
    | { type: "SET_SUBDIVISION"; payload: NoteSubdivision }
    | { type: "ADD_CHORD_BLOCK"; payload: ChordBlock }
    | { type: "UPDATE_CHORD_BLOCK"; payload: ChordBlock }
    | { type: "REMOVE_CHORD_BLOCK"; payload: string }
    | { type: "REORDER_CHORD_BLOCKS"; payload: { fromIndex: number; toIndex: number } }
    | { type: "MOVE_CHORD_BLOCK"; payload: { id: string; newPosition: number } }
    | { type: "UPDATE_SONG"; payload: Partial<Song> }
    | { type: "LOAD_SONG"; payload: Song }
    | { type: "ADD_DRUM_BLOCK"; payload: DrumBlock }
    | { type: "UPDATE_DRUM_BLOCK"; payload: DrumBlock }
    | { type: "REMOVE_DRUM_BLOCK"; payload: string }
    | { type: "MOVE_DRUM_BLOCK"; payload: { id: string; newPosition: number } }
    | { type: "UPDATE_DRUM_PATTERN"; payload: DrumPattern }
    | { type: "CREATE_CUSTOM_PATTERN"; payload: DrumPattern };

// Initial state
const initialState: MusicState = {
    song: createEmptySong(),
    selectedChords: [],
    chordDisplayMode: "select",
    chordProgression: [],
    scaleViewEnabled: false,
    keyboardPreviewEnabled: true, // Default to enabled for better UX
    showInScaleColors: true, // Default to showing in-scale colors
    pianoRange: {
        startMidi: 60, // C4
        endMidi: 83,   // B5 (2 octaves)
    },
    playbackState: {
        isPlaying: false,
        currentBeat: 0,
        loop: false,
        subdivision: "quarter",
    },
};

// Reducer
function musicReducer(state: MusicState, action: MusicAction): MusicState {
    const now = Date.now();

    switch (action.type) {
        case "SELECT_KEY":
            return {
                ...state,
                song: {
                    ...state.song,
                    key: action.payload,
                    metadata: { ...state.song.metadata, updatedAt: now }
                },
                selectedChords: [], // Clear chord selections when key changes
            };

        case "SET_MODE":
            return {
                ...state,
                song: {
                    ...state.song,
                    mode: action.payload,
                    metadata: { ...state.song.metadata, updatedAt: now }
                },
                selectedChords: [], // Clear chord selections when mode changes
            };

        case "SELECT_CHORD":
            // In select mode, replace selection; in build mode, keep selection
            return {
                ...state,
                selectedChords: [action.payload],
            };

        case "DESELECT_CHORDS":
            return { ...state, selectedChords: [] };

        case "SET_CHORD_DISPLAY_MODE":
            return { ...state, chordDisplayMode: action.payload };

        case "ADD_TO_PROGRESSION":
            return {
                ...state,
                chordProgression: [...state.chordProgression, action.payload],
            };

        case "REMOVE_FROM_PROGRESSION":
            return {
                ...state,
                chordProgression: state.chordProgression.filter(
                    chord => chord.id !== action.payload
                ),
            };

        case "CLEAR_PROGRESSION":
            return { ...state, chordProgression: [] };

        case "TOGGLE_SCALE_VIEW":
            return { ...state, scaleViewEnabled: !state.scaleViewEnabled };

        case "TOGGLE_KEYBOARD_PREVIEW":
            return {
                ...state,
                keyboardPreviewEnabled: !state.keyboardPreviewEnabled,
                // Clear selected chords when toggling off
                selectedChords: state.keyboardPreviewEnabled ? [] : state.selectedChords,
            };

        case "TOGGLE_IN_SCALE_COLORS":
            return {
                ...state,
                showInScaleColors: !state.showInScaleColors,
            };

        case "SET_PIANO_RANGE":
            return {
                ...state,
                pianoRange: action.payload,
            };

        case "UPDATE_CHORD_DURATION":
            return {
                ...state,
                chordProgression: state.chordProgression.map(chord =>
                    chord.id === action.payload.id
                        ? { ...chord, duration: action.payload.duration }
                        : chord
                ),
            };

        case "SET_PLAYBACK_PLAYING":
            return {
                ...state,
                playbackState: { ...state.playbackState, isPlaying: action.payload },
            };

        case "SET_PLAYBACK_BEAT":
            return {
                ...state,
                playbackState: { ...state.playbackState, currentBeat: action.payload },
            };

        case "SET_TEMPO":
            return {
                ...state,
                song: {
                    ...state.song,
                    tempo: action.payload,
                    metadata: { ...state.song.metadata, updatedAt: now }
                },
                playbackState: { ...state.playbackState },
            };

        case "ADD_CHORD_BLOCK":
            return {
                ...state,
                song: {
                    ...state.song,
                    tracks: {
                        ...state.song.tracks,
                        chords: {
                            blocks: [...state.song.tracks.chords.blocks, action.payload]
                        }
                    },
                    metadata: { ...state.song.metadata, updatedAt: now }
                }
            };

        case "UPDATE_CHORD_BLOCK":
            return {
                ...state,
                song: {
                    ...state.song,
                    tracks: {
                        ...state.song.tracks,
                        chords: {
                            blocks: state.song.tracks.chords.blocks.map(block =>
                                block.id === action.payload.id ? action.payload : block
                            )
                        }
                    },
                    metadata: { ...state.song.metadata, updatedAt: now }
                }
            };

        case "REMOVE_CHORD_BLOCK":
            return {
                ...state,
                song: {
                    ...state.song,
                    tracks: {
                        ...state.song.tracks,
                        chords: {
                            blocks: state.song.tracks.chords.blocks.filter(
                                block => block.id !== action.payload
                            )
                        }
                    },
                    metadata: { ...state.song.metadata, updatedAt: now }
                }
            };

        case "REORDER_CHORD_BLOCKS": {
            const blocks = [...state.song.tracks.chords.blocks];
            const [movedBlock] = blocks.splice(action.payload.fromIndex, 1);
            blocks.splice(action.payload.toIndex, 0, movedBlock);

            let cumulativePosition = 0;
            const reorderedBlocks = blocks.map(block => {
                const updatedBlock = { ...block, position: cumulativePosition };
                cumulativePosition += block.duration;
                return updatedBlock;
            });

            return {
                ...state,
                song: {
                    ...state.song,
                    tracks: {
                        ...state.song.tracks,
                        chords: {
                            blocks: reorderedBlocks
                        }
                    },
                    metadata: { ...state.song.metadata, updatedAt: now }
                }
            };
        }

        case "MOVE_CHORD_BLOCK": {
            const blocks = state.song.tracks.chords.blocks.map(block =>
                block.id === action.payload.id
                    ? { ...block, position: Math.max(0, action.payload.newPosition) }
                    : block
            );

            const sortedBlocks = [...blocks].sort((a, b) => a.position - b.position);

            return {
                ...state,
                song: {
                    ...state.song,
                    tracks: {
                        ...state.song.tracks,
                        chords: {
                            blocks: sortedBlocks
                        }
                    },
                    metadata: { ...state.song.metadata, updatedAt: now }
                }
            };
        }

        case "UPDATE_SONG":
            return {
                ...state,
                song: {
                    ...state.song,
                    ...action.payload,
                    metadata: {
                        ...state.song.metadata,
                        ...action.payload.metadata,
                        updatedAt: now
                    }
                }
            };

        case "LOAD_SONG":
            return {
                ...state,
                song: action.payload,
                chordProgression: [],
                selectedChords: [],
            };

        case "TOGGLE_LOOP":
            return {
                ...state,
                playbackState: { ...state.playbackState, loop: !state.playbackState.loop },
            };

        case "SET_SUBDIVISION":
            return {
                ...state,
                playbackState: { ...state.playbackState, subdivision: action.payload },
            };

        case "ADD_DRUM_BLOCK":
            return {
                ...state,
                song: {
                    ...state.song,
                    tracks: {
                        ...state.song.tracks,
                        drums: {
                            ...state.song.tracks.drums,
                            blocks: [...state.song.tracks.drums.blocks, action.payload],
                        },
                    },
                    metadata: { ...state.song.metadata, updatedAt: now },
                },
            };

        case "UPDATE_DRUM_BLOCK": {
            const blocks = state.song.tracks.drums.blocks.map((block) =>
                block.id === action.payload.id ? action.payload : block
            );
            return {
                ...state,
                song: {
                    ...state.song,
                    tracks: {
                        ...state.song.tracks,
                        drums: {
                            ...state.song.tracks.drums,
                            blocks,
                        },
                    },
                    metadata: { ...state.song.metadata, updatedAt: now },
                },
            };
        }

        case "REMOVE_DRUM_BLOCK": {
            const blocks = state.song.tracks.drums.blocks.filter(
                (block) => block.id !== action.payload
            );
            return {
                ...state,
                song: {
                    ...state.song,
                    tracks: {
                        ...state.song.tracks,
                        drums: {
                            ...state.song.tracks.drums,
                            blocks,
                        },
                    },
                    metadata: { ...state.song.metadata, updatedAt: now },
                },
            };
        }

        case "MOVE_DRUM_BLOCK": {
            const blocks = state.song.tracks.drums.blocks.map((block) =>
                block.id === action.payload.id
                    ? { ...block, position: action.payload.newPosition }
                    : block
            );
            return {
                ...state,
                song: {
                    ...state.song,
                    tracks: {
                        ...state.song.tracks,
                        drums: {
                            ...state.song.tracks.drums,
                            blocks,
                        },
                    },
                    metadata: { ...state.song.metadata, updatedAt: now },
                },
            };
        }

        case "UPDATE_DRUM_PATTERN": {
            const patterns = state.song.tracks.drums.patterns.map((pattern) =>
                pattern.id === action.payload.id ? action.payload : pattern
            );
            return {
                ...state,
                song: {
                    ...state.song,
                    tracks: {
                        ...state.song.tracks,
                        drums: {
                            ...state.song.tracks.drums,
                            patterns,
                        },
                    },
                    metadata: { ...state.song.metadata, updatedAt: now },
                },
            };
        }

        case "CREATE_CUSTOM_PATTERN":
            return {
                ...state,
                song: {
                    ...state.song,
                    tracks: {
                        ...state.song.tracks,
                        drums: {
                            ...state.song.tracks.drums,
                            patterns: [...state.song.tracks.drums.patterns, action.payload],
                        },
                    },
                    metadata: { ...state.song.metadata, updatedAt: now },
                },
            };

        default:
            return state;
    }
}

// Context interface with state and actions

interface MusicContextType {
    state: MusicState;
    settings: UserSettings;
    audio: {
        playNote: (frequency: number, duration?: number, volume?: number) => Promise<void>;
        playChord: (frequencies: number[], duration?: number, volume?: number) => Promise<void>;
        playKick: (time?: number, volume?: number) => void;
        playSnare: (time?: number, volume?: number) => void;
        playHiHat: (time?: number, volume?: number) => void;
        loading: boolean;
        audioContext: AudioContext | null;
        instrument: any | null;
    };
    actions: {
        selectKey: (key: Note) => void;
        setMode: (mode: Mode) => void;
        selectChord: (rootNote: Note, intervals: number[], numeral: string) => void;
        deselectChords: () => void;
        setChordDisplayMode: (mode: ChordDisplayMode) => void;
        removeFromProgression: (id: string) => void;
        clearProgression: () => void;
        updateChordDuration: (id: string, duration: number) => void;
        toggleScaleView: () => void;
        toggleChordHighlight: () => void;
        toggleInScaleColors: () => void;
        setPianoRange: (startMidi: number, endMidi: number) => void;
        setPlaybackPlaying: (playing: boolean) => void;
        setPlaybackBeat: (beat: number) => void;
        setTempo: (tempo: number) => void;
        toggleLoop: () => void;
        setSubdivision: (subdivision: NoteSubdivision) => void;
        addChordBlock: (block: ChordBlock) => void;
        updateChordBlock: (block: ChordBlock) => void;
        removeChordBlock: (id: string) => void;
        reorderChordBlocks: (fromIndex: number, toIndex: number) => void;
        moveChordBlock: (id: string, newPosition: number) => void;
        updateSong: (updates: Partial<Song>) => void;
        loadSong: (song: Song) => void;
        addDrumBlock: (block: DrumBlock) => void;
        updateDrumBlock: (block: DrumBlock) => void;
        removeDrumBlock: (id: string) => void;
        moveDrumBlock: (id: string, newPosition: number) => void;
        updateDrumPattern: (pattern: DrumPattern) => void;
        createCustomPattern: (pattern: DrumPattern) => void;
        setMasterVolume: (volume: number) => void;
        setTrackVolume: (track: keyof UserSettings['volume']['tracks'], volume: number) => void;
        setDrumSoundVolume: (sound: keyof UserSettings['volume']['drumSounds'], volume: number) => void;
    };
}


// Create context
// eslint-disable-next-line react-refresh/only-export-components
export const MusicContext = createContext<MusicContextType | undefined>(undefined);

// Provider component
interface MusicProviderProps {
    children: ReactNode;
}

export function MusicProvider({ children }: MusicProviderProps) {
    const { settings, setMasterVolume, setTrackVolume, setDrumSoundVolume, setShowInScaleColors, setKeyboardPreviewEnabled } = useSettings();

    // Initialize state with settings from localStorage
    const [state, dispatch] = useReducer(musicReducer, {
        ...initialState,
        showInScaleColors: settings.ui.piano.showInScaleColors,
        keyboardPreviewEnabled: settings.ui.piano.keyboardPreviewEnabled,
    });

    const { playNote: rawPlayNote, playChord: rawPlayChord, playKick: rawPlayKick, playSnare: rawPlaySnare, playHiHat: rawPlayHiHat, setMasterVolume: setAudioMasterVolume, loading, audioContext, instrument } = useAudioEngine();

    // Sync master volume to audio engine whenever it changes
    useEffect(() => {
        setAudioMasterVolume(settings.volume.master);
    }, [settings.volume.master, setAudioMasterVolume]);

    // Wrap play functions to apply volume settings (master volume now handled by gain node)
    const playNote = useCallback((frequency: number, duration = 0.3, volume = 0.8) => {
        const finalVolume = volume * settings.volume.tracks.melody;
        return rawPlayNote(frequency, duration, finalVolume);
    }, [rawPlayNote, settings.volume.tracks.melody]);

    const playChord = useCallback((frequencies: number[], duration = 0.8, volume = 0.6) => {
        const finalVolume = volume * settings.volume.tracks.chords;
        return rawPlayChord(frequencies, duration, finalVolume);
    }, [rawPlayChord, settings.volume.tracks.chords]);

    const playKick = useCallback((time?: number, volume?: number) => {
        const finalVolume = (volume ?? 1.0) * settings.volume.tracks.drums * settings.volume.drumSounds.kick;
        rawPlayKick(time, finalVolume);
    }, [rawPlayKick, settings.volume.tracks.drums, settings.volume.drumSounds.kick]);

    const playSnare = useCallback((time?: number, volume?: number) => {
        const finalVolume = (volume ?? 1.0) * settings.volume.tracks.drums * settings.volume.drumSounds.snare;
        rawPlaySnare(time, finalVolume);
    }, [rawPlaySnare, settings.volume.tracks.drums, settings.volume.drumSounds.snare]);

    const playHiHat = useCallback((time?: number, volume?: number) => {
        const finalVolume = (volume ?? 1.0) * settings.volume.tracks.drums * settings.volume.drumSounds.hihat;
        rawPlayHiHat(time, finalVolume);
    }, [rawPlayHiHat, settings.volume.tracks.drums, settings.volume.drumSounds.hihat]);

    // Action creators
    const selectKey = useCallback((key: Note) => {
        dispatch({ type: "SELECT_KEY", payload: key });
    }, []);

    const setMode = useCallback((mode: Mode) => {
        dispatch({ type: "SET_MODE", payload: mode });
    }, []);

    // Note: We intentionally access state.selectedChords inside the callback
    // without including it in the dependency array to avoid infinite re-renders.
    // The function reads the current state value when called.
    const selectChord = useCallback(
        (rootNote: Note, intervals: number[], numeral: string) => {
            if (state.chordDisplayMode === "select") {
                // Select mode - toggle selection
                // Check if this chord is already selected
                const isAlreadySelected = state.selectedChords.length > 0 &&
                    state.selectedChords[0].rootNote === rootNote &&
                    state.selectedChords[0].numeral === numeral &&
                    JSON.stringify(state.selectedChords[0].intervals) === JSON.stringify(intervals);

                if (isAlreadySelected) {
                    dispatch({ type: "DESELECT_CHORDS" });
                } else {
                    dispatch({
                        type: "SELECT_CHORD",
                        payload: { rootNote, intervals, numeral },
                    });
                }
            } else {
                // Build mode - add to progression
                const newChord: ChordInProgression = {
                    id: `${Date.now()}-${Math.random()}`,
                    rootNote,
                    intervals,
                    numeral,
                    duration: 4, // Default to 4 beats
                };
                dispatch({
                    type: "ADD_TO_PROGRESSION",
                    payload: newChord,
                });

                // Also select it for highlighting
                dispatch({
                    type: "SELECT_CHORD",
                    payload: { rootNote, intervals, numeral },
                });
            }
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [state.chordDisplayMode]
    );

    const deselectChords = useCallback(() => {
        dispatch({ type: "DESELECT_CHORDS" });
    }, []);

    const setChordDisplayMode = useCallback((mode: ChordDisplayMode) => {
        dispatch({ type: "SET_CHORD_DISPLAY_MODE", payload: mode });
    }, []);

    const removeFromProgression = useCallback((id: string) => {
        dispatch({ type: "REMOVE_FROM_PROGRESSION", payload: id });
    }, []);

    const clearProgression = useCallback(() => {
        dispatch({ type: "CLEAR_PROGRESSION" });
    }, []);

    const updateChordDuration = useCallback((id: string, duration: number) => {
        dispatch({ type: "UPDATE_CHORD_DURATION", payload: { id, duration } });
    }, []);

    const toggleScaleView = useCallback(() => {
        dispatch({ type: "TOGGLE_SCALE_VIEW" });
    }, []);

    const toggleChordHighlight = useCallback(() => {
        const newValue = !state.keyboardPreviewEnabled;
        dispatch({ type: "TOGGLE_KEYBOARD_PREVIEW" });
        setKeyboardPreviewEnabled(newValue);
    }, [state.keyboardPreviewEnabled, setKeyboardPreviewEnabled]);

    const toggleInScaleColors = useCallback(() => {
        const newValue = !state.showInScaleColors;
        dispatch({ type: "TOGGLE_IN_SCALE_COLORS" });
        setShowInScaleColors(newValue);
    }, [state.showInScaleColors, setShowInScaleColors]);

    const setPianoRange = useCallback((startMidi: number, endMidi: number) => {
        dispatch({ type: "SET_PIANO_RANGE", payload: { startMidi, endMidi } });
    }, []);

    const setPlaybackPlaying = useCallback((playing: boolean) => {
        dispatch({ type: "SET_PLAYBACK_PLAYING", payload: playing });
    }, []);

    const setPlaybackBeat = useCallback((beat: number) => {
        dispatch({ type: "SET_PLAYBACK_BEAT", payload: beat });
    }, []);

    const setTempo = useCallback((tempo: number) => {
        dispatch({ type: "SET_TEMPO", payload: tempo });
    }, []);

    const toggleLoop = useCallback(() => {
        dispatch({ type: "TOGGLE_LOOP" });
    }, []);

    const setSubdivision = useCallback((subdivision: NoteSubdivision) => {
        dispatch({ type: "SET_SUBDIVISION", payload: subdivision });
    }, []);

    const addChordBlock = useCallback((block: ChordBlock) => {
        dispatch({ type: "ADD_CHORD_BLOCK", payload: block });
    }, []);

    const updateChordBlock = useCallback((block: ChordBlock) => {
        dispatch({ type: "UPDATE_CHORD_BLOCK", payload: block });
    }, []);

    const removeChordBlock = useCallback((id: string) => {
        dispatch({ type: "REMOVE_CHORD_BLOCK", payload: id });
    }, []);

    const reorderChordBlocks = useCallback((fromIndex: number, toIndex: number) => {
        dispatch({ type: "REORDER_CHORD_BLOCKS", payload: { fromIndex, toIndex } });
    }, []);

    const moveChordBlock = useCallback((id: string, newPosition: number) => {
        dispatch({ type: "MOVE_CHORD_BLOCK", payload: { id, newPosition } });
    }, []);

    const updateSong = useCallback((updates: Partial<Song>) => {
        dispatch({ type: "UPDATE_SONG", payload: updates });
    }, []);

    const loadSong = useCallback((song: Song) => {
        dispatch({ type: "LOAD_SONG", payload: song });
    }, []);

    const addDrumBlock = useCallback((block: DrumBlock) => {
        dispatch({ type: "ADD_DRUM_BLOCK", payload: block });
    }, []);

    const updateDrumBlock = useCallback((block: DrumBlock) => {
        dispatch({ type: "UPDATE_DRUM_BLOCK", payload: block });
    }, []);

    const removeDrumBlock = useCallback((id: string) => {
        dispatch({ type: "REMOVE_DRUM_BLOCK", payload: id });
    }, []);

    const moveDrumBlock = useCallback((id: string, newPosition: number) => {
        dispatch({ type: "MOVE_DRUM_BLOCK", payload: { id, newPosition } });
    }, []);

    const updateDrumPattern = useCallback((pattern: DrumPattern) => {
        dispatch({ type: "UPDATE_DRUM_PATTERN", payload: pattern });
    }, []);

    const createCustomPattern = useCallback((pattern: DrumPattern) => {
        dispatch({ type: "CREATE_CUSTOM_PATTERN", payload: pattern });
    }, []);

    const value: MusicContextType = {
        state,
        settings,
        audio: {
            playNote,
            playChord,
            playKick,
            playSnare,
            playHiHat,
            loading,
            audioContext,
            instrument,
        },
        actions: {
            selectKey,
            setMode,
            selectChord,
            deselectChords,
            setChordDisplayMode,
            removeFromProgression,
            clearProgression,
            updateChordDuration,
            toggleScaleView,
            toggleChordHighlight,
            toggleInScaleColors,
            setPianoRange,
            setPlaybackPlaying,
            setPlaybackBeat,
            setTempo,
            toggleLoop,
            setSubdivision,
            addChordBlock,
            updateChordBlock,
            removeChordBlock,
            reorderChordBlocks,
            moveChordBlock,
            updateSong,
            loadSong,
            addDrumBlock,
            updateDrumBlock,
            removeDrumBlock,
            moveDrumBlock,
            updateDrumPattern,
            createCustomPattern,
            setMasterVolume,
            setTrackVolume,
            setDrumSoundVolume,
        },
    };

    return (
        <MusicContext.Provider value={value}>
            {children}
        </MusicContext.Provider>
    );
}

