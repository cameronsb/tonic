import type { ReactNode } from "react";
import { createContext, useReducer, useCallback } from "react";
import type { Note, Mode, SelectedChord, ChordDisplayMode, ChordInProgression } from "../types/music";

export type NoteSubdivision = "whole" | "quarter" | "eighth";

// State interface
interface MusicState {
    selectedKey: Note;
    mode: Mode;
    selectedChords: SelectedChord[];
    chordDisplayMode: ChordDisplayMode;
    chordProgression: ChordInProgression[];
    scaleViewEnabled: boolean;
    pianoRange: {
        startMidi: number;
        endMidi: number;
    };
    playbackState: {
        isPlaying: boolean;
        currentBeat: number;
        tempo: number;
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
    | { type: "SET_PIANO_RANGE"; payload: { startMidi: number; endMidi: number } }
    | { type: "SET_PLAYBACK_PLAYING"; payload: boolean }
    | { type: "SET_PLAYBACK_BEAT"; payload: number }
    | { type: "SET_TEMPO"; payload: number }
    | { type: "TOGGLE_LOOP" }
    | { type: "SET_SUBDIVISION"; payload: NoteSubdivision };

// Initial state
const initialState: MusicState = {
    selectedKey: "C",
    mode: "major",
    selectedChords: [],
    chordDisplayMode: "select",
    chordProgression: [],
    scaleViewEnabled: false,
    pianoRange: {
        startMidi: 60, // C4
        endMidi: 83,   // B5 (2 octaves)
    },
    playbackState: {
        isPlaying: false,
        currentBeat: 0,
        tempo: 120,
        loop: false,
        subdivision: "quarter",
    },
};

// Reducer
function musicReducer(state: MusicState, action: MusicAction): MusicState {
    switch (action.type) {
        case "SELECT_KEY":
            return { ...state, selectedKey: action.payload };

        case "SET_MODE":
            return { ...state, mode: action.payload };

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
                playbackState: { ...state.playbackState, tempo: action.payload },
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

        default:
            return state;
    }
}

// Context interface with state and actions
/* eslint-disable no-unused-vars */
interface MusicContextType {
    state: MusicState;
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
        setPianoRange: (startMidi: number, endMidi: number) => void;
        setPlaybackPlaying: (playing: boolean) => void;
        setPlaybackBeat: (beat: number) => void;
        setTempo: (tempo: number) => void;
        toggleLoop: () => void;
        setSubdivision: (subdivision: NoteSubdivision) => void;
    };
}
/* eslint-enable no-unused-vars */

// Create context
// eslint-disable-next-line react-refresh/only-export-components
export const MusicContext = createContext<MusicContextType | undefined>(undefined);

// Provider component
interface MusicProviderProps {
    children: ReactNode;
}

export function MusicProvider({ children }: MusicProviderProps) {
    const [state, dispatch] = useReducer(musicReducer, initialState);

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

    const value: MusicContextType = {
        state,
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
            setPianoRange,
            setPlaybackPlaying,
            setPlaybackBeat,
            setTempo,
            toggleLoop,
            setSubdivision,
        },
    };

    return (
        <MusicContext.Provider value={value}>
            {children}
        </MusicContext.Provider>
    );
}

