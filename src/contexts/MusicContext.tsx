import type { ReactNode } from 'react';
import { createContext, useReducer, useCallback, useEffect } from 'react';
import type { Note, Mode, SelectedChord } from '../types/music';
import type { Player } from 'soundfont-player';
import { useAudioEngine } from '../hooks/useAudioEngine';
import { useSettings } from '../hooks/useSettings';
import type { UserSettings } from '../types/settings';

interface MusicState {
  key: Note;
  mode: Mode;
  selectedChords: SelectedChord[];
  scaleViewEnabled: boolean;
  keyboardPreviewEnabled: boolean;
  showInScaleColors: boolean;
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
  | { type: 'TOGGLE_SCALE_VIEW' }
  | { type: 'TOGGLE_KEYBOARD_PREVIEW' }
  | { type: 'TOGGLE_IN_SCALE_COLORS' }
  | { type: 'SET_PIANO_RANGE'; payload: { startMidi: number; endMidi: number } };

const initialState: MusicState = {
  key: 'C',
  mode: 'major',
  selectedChords: [],
  scaleViewEnabled: false,
  keyboardPreviewEnabled: true,
  showInScaleColors: true,
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

    case 'TOGGLE_SCALE_VIEW':
      return { ...state, scaleViewEnabled: !state.scaleViewEnabled };

    case 'TOGGLE_KEYBOARD_PREVIEW':
      return {
        ...state,
        keyboardPreviewEnabled: !state.keyboardPreviewEnabled,
      };

    case 'TOGGLE_IN_SCALE_COLORS':
      return {
        ...state,
        showInScaleColors: !state.showInScaleColors,
      };

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

  const [state, dispatch] = useReducer(musicReducer, {
    ...initialState,
    showInScaleColors: settings.ui.piano.showInScaleColors,
    keyboardPreviewEnabled: settings.ui.piano.keyboardPreviewEnabled,
    scaleViewEnabled: settings.ui.scale.viewEnabled,
  });

  const {
    playNote: rawPlayNote,
    playChord: rawPlayChord,
    setMasterVolume: setAudioMasterVolume,
    loading,
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

  const toggleScaleView = useCallback(() => {
    const newValue = !state.scaleViewEnabled;
    dispatch({ type: 'TOGGLE_SCALE_VIEW' });
    setScaleViewEnabled(newValue);
  }, [state.scaleViewEnabled, setScaleViewEnabled]);

  const toggleChordHighlight = useCallback(() => {
    const newValue = !state.keyboardPreviewEnabled;
    dispatch({ type: 'TOGGLE_KEYBOARD_PREVIEW' });
    setKeyboardPreviewEnabled(newValue);
  }, [state.keyboardPreviewEnabled, setKeyboardPreviewEnabled]);

  const toggleInScaleColors = useCallback(() => {
    const newValue = !state.showInScaleColors;
    dispatch({ type: 'TOGGLE_IN_SCALE_COLORS' });
    setShowInScaleColors(newValue);
  }, [state.showInScaleColors, setShowInScaleColors]);

  const setPianoRange = useCallback((startMidi: number, endMidi: number) => {
    dispatch({ type: 'SET_PIANO_RANGE', payload: { startMidi, endMidi } });
  }, []);

  const value: MusicContextType = {
    state,
    settings,
    audio: {
      playNote,
      playChord,
      loading,
      audioContext,
      instrument,
    },
    actions: {
      selectKey,
      setMode,
      selectChord,
      deselectChords,
      toggleScaleView,
      toggleChordHighlight,
      toggleInScaleColors,
      setPianoRange,
      setMasterVolume,
    },
  };

  return <MusicContext.Provider value={value}>{children}</MusicContext.Provider>;
}
