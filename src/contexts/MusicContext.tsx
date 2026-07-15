import type { ReactNode } from 'react';
import { createContext, useReducer, useCallback, useEffect, useMemo } from 'react';
import type { Note, Mode, SelectedChord } from '../types/music';
import type { Player } from 'soundfont-player';
import { useAudioEngine } from '../hooks/useAudioEngine';
import { useSettings } from '../hooks/useSettings';
import type { UserSettings } from '../types/settings';

interface MusicState {
  key: Note;
  mode: Mode;
  selectedChords: SelectedChord[];
  pianoRange: {
    startMidi: number;
    endMidi: number;
  };
}

type MusicAction =
  | { type: 'SELECT_KEY'; payload: Note }
  | { type: 'SET_MODE'; payload: Mode }
  | { type: 'SELECT_CHORD'; payload: SelectedChord }
  | { type: 'DESELECT_CHORDS' }
  | { type: 'SET_PIANO_RANGE'; payload: { startMidi: number; endMidi: number } };

const initialState: MusicState = {
  key: 'C',
  mode: 'major',
  selectedChords: [],
  pianoRange: {
    startMidi: 60,
    endMidi: 83,
  },
};

function musicReducer(state: MusicState, action: MusicAction): MusicState {
  switch (action.type) {
    case 'SELECT_KEY':
      return {
        ...state,
        key: action.payload,
        selectedChords: [],
      };

    case 'SET_MODE':
      return {
        ...state,
        mode: action.payload,
        selectedChords: [],
      };

    case 'SELECT_CHORD':
      return {
        ...state,
        selectedChords: [action.payload],
      };

    case 'DESELECT_CHORDS':
      return { ...state, selectedChords: [] };

    case 'SET_PIANO_RANGE':
      return {
        ...state,
        pianoRange: action.payload,
      };

    default:
      return state;
  }
}

interface MusicContextType {
  state: MusicState;
  settings: UserSettings;
  audio: {
    playNote: (frequency: number, duration?: number, volume?: number) => Promise<void>;
    playChord: (frequencies: number[], duration?: number, volume?: number) => Promise<void>;
    loading: boolean;
    error: string | null;
    retry: () => void;
    audioContext: AudioContext | null;
    instrument: Player | null;
  };
  actions: {
    selectKey: (key: Note) => void;
    setMode: (mode: Mode) => void;
    selectChord: (rootNote: Note, intervals: number[], numeral: string) => void;
    deselectChords: () => void;
    toggleScaleView: () => void;
    toggleChordHighlight: () => void;
    toggleInScaleColors: () => void;
    setPianoRange: (startMidi: number, endMidi: number) => void;
    setMasterVolume: (volume: number) => void;
  };
}

// eslint-disable-next-line react-refresh/only-export-components
export const MusicContext = createContext<MusicContextType | undefined>(undefined);

interface MusicProviderProps {
  children: ReactNode;
}

export function MusicProvider({ children }: MusicProviderProps) {
  const {
    settings,
    setMasterVolume,
    setShowInScaleColors,
    setKeyboardPreviewEnabled,
    setScaleViewEnabled,
  } = useSettings();

  const [state, dispatch] = useReducer(musicReducer, initialState);

  const {
    playNote: rawPlayNote,
    playChord: rawPlayChord,
    setMasterVolume: setAudioMasterVolume,
    loading,
    error,
    retry,
    audioContext,
    instrument,
  } = useAudioEngine();

  useEffect(() => {
    setAudioMasterVolume(settings.volume.master);
  }, [settings.volume.master, setAudioMasterVolume]);

  const playNote = useCallback(
    (frequency: number, duration = 0.3, volume = 0.8) => {
      return rawPlayNote(frequency, duration, volume);
    },
    [rawPlayNote]
  );

  const playChord = useCallback(
    (frequencies: number[], duration = 0.8, volume = 0.6) => {
      const finalVolume = volume * settings.volume.chords;
      return rawPlayChord(frequencies, duration, finalVolume);
    },
    [rawPlayChord, settings.volume.chords]
  );

  const selectKey = useCallback((key: Note) => {
    dispatch({ type: 'SELECT_KEY', payload: key });
  }, []);

  const setMode = useCallback((mode: Mode) => {
    dispatch({ type: 'SET_MODE', payload: mode });
  }, []);

  const selectChord = useCallback(
    (rootNote: Note, intervals: number[], numeral: string) => {
      // Always update to the new chord (no toggle behavior)
      // This makes the selection persistent - clicking the same chord
      // multiple times keeps it selected rather than toggling off
      dispatch({
        type: 'SELECT_CHORD',
        payload: { rootNote, intervals, numeral },
      });
    },
    []
  );

  const deselectChords = useCallback(() => {
    dispatch({ type: 'DESELECT_CHORDS' });
  }, []);

  // Toggle actions are thin wrappers over the persisted settings setters —
  // `settings.ui.*` is the single source of truth for these flags.
  const toggleScaleView = useCallback(() => {
    setScaleViewEnabled(!settings.ui.scale.viewEnabled);
  }, [settings.ui.scale.viewEnabled, setScaleViewEnabled]);

  const toggleChordHighlight = useCallback(() => {
    setKeyboardPreviewEnabled(!settings.ui.piano.keyboardPreviewEnabled);
  }, [settings.ui.piano.keyboardPreviewEnabled, setKeyboardPreviewEnabled]);

  const toggleInScaleColors = useCallback(() => {
    setShowInScaleColors(!settings.ui.piano.showInScaleColors);
  }, [settings.ui.piano.showInScaleColors, setShowInScaleColors]);

  const setPianoRange = useCallback((startMidi: number, endMidi: number) => {
    dispatch({ type: 'SET_PIANO_RANGE', payload: { startMidi, endMidi } });
  }, []);

  const audio = useMemo(
    () => ({
      playNote,
      playChord,
      loading,
      error,
      retry,
      audioContext,
      instrument,
    }),
    [playNote, playChord, loading, error, retry, audioContext, instrument]
  );

  const actions = useMemo(
    () => ({
      selectKey,
      setMode,
      selectChord,
      deselectChords,
      toggleScaleView,
      toggleChordHighlight,
      toggleInScaleColors,
      setPianoRange,
      setMasterVolume,
    }),
    [
      selectKey,
      setMode,
      selectChord,
      deselectChords,
      toggleScaleView,
      toggleChordHighlight,
      toggleInScaleColors,
      setPianoRange,
      setMasterVolume,
    ]
  );

  const value: MusicContextType = useMemo(
    () => ({
      state,
      settings,
      audio,
      actions,
    }),
    [state, settings, audio, actions]
  );

  return <MusicContext.Provider value={value}>{children}</MusicContext.Provider>;
}
