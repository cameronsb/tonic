# Settings & Song Structure Proposal

## Overview
This document proposes expanded data structures for user settings and song data based on the current implementation and the OVERVIEW_PLAN.md vision.

## Current State

### Current Settings (`enso-piano:settings`)
```typescript
interface UserSettings {
  volume: {
    master: number;
    tracks: { chords, melody, drums };
    drumSounds: { kick, snare, hihat };
  }
}
```

### Current Song Structure
```typescript
interface Song {
  id: string;
  name: string;
  tempo: number;
  timeSignature: { numerator, denominator };
  key: Note;
  mode: Mode;
  tracks: {
    chords: { blocks: ChordBlock[] };
    melody: { notes: MelodyNote[] };
    drums: { patterns: DrumPattern[] };
  };
  metadata: { createdAt, updatedAt };
}
```

---

## Proposed Expanded Settings

### 1. UI Preferences
Settings that control the visual layout and interface state.

```typescript
interface UISettings {
  // Builder panel configuration
  builderPanel: {
    height: number;              // Current height of bottom panel (150-600px)
    activeTab: 'piano' | 'drums'; // Which tab is currently selected
    rememberedHeights: {         // Remember height per tab
      piano: number;
      drums: number;
    };
  };

  // Timeline/grid display
  timeline: {
    zoom: number;                // Zoom level multiplier (0.5 - 2.0)
    showGrid: boolean;           // Show grid lines
    showRuler: boolean;          // Show measure ruler
    snapToGrid: boolean;         // Enable snap-to-grid
    snapResolution: 'eighth' | 'quarter' | 'half' | 'whole'; // Grid snap resolution
  };

  // Learn mode preferences
  learnMode: {
    chordCardSize: 'compact' | 'normal' | 'large';
    showBorrowedChords: boolean;
    groupByFunction: boolean;    // Group by function vs default order
  };

  // Piano display
  piano: {
    showScaleDegrees: boolean;
    octaveRange: {
      start: number;             // Starting MIDI note
      end: number;               // Ending MIDI note
    };
    highlightMode: 'scale' | 'chord' | 'none';
  };

  // Color theme (for future expansion)
  theme: 'default' | 'dark' | 'light' | 'custom';

  // Sidebar/panel visibility
  panelVisibility: {
    chordPalette: boolean;
    inspector: boolean;          // Future: properties panel
    mixer: boolean;              // Future: mixing panel
  };
}
```

### 2. Workflow Preferences
Settings that affect how the user creates music.

```typescript
interface WorkflowSettings {
  // Recording settings
  recording: {
    countInBars: 0 | 1 | 2 | 4;           // Count-in before recording
    metronomeEnabled: boolean;
    metronomeVolume: number;              // 0-1
    quantizeOnRecord: boolean;
    defaultQuantization: 'none' | 'eighth' | 'quarter' | 'half';
  };

  // Playback settings
  playback: {
    loopEnabled: boolean;
    returnToStartOnStop: boolean;
    scrollFollowsPlayhead: boolean;
  };

  // Editing defaults
  editing: {
    defaultNoteDuration: number;          // In eighths
    defaultChordDuration: number;         // In eighths/beats
    defaultVelocity: number;              // 0-127
    duplicateOffsetBars: number;          // How many bars to offset when duplicating
  };

  // Auto-save
  autoSave: {
    enabled: boolean;
    intervalMinutes: number;              // Auto-save frequency
  };
}
```

### 3. MIDI & Audio Preferences
For future MIDI controller and audio routing features.

```typescript
interface MIDISettings {
  enabled: boolean;
  inputDevice: string | null;
  outputDevice: string | null;
  channel: number;                        // 1-16

  // MIDI learn
  ccMappings: {
    [ccNumber: number]: {
      parameter: string;                  // e.g., "volume.master"
      min: number;
      max: number;
    };
  };
}

interface AudioSettings {
  // Future: audio interface settings
  sampleRate: 44100 | 48000;
  bufferSize: 128 | 256 | 512 | 1024;

  // Effects
  masterEffects: {
    reverb: { enabled: boolean; amount: number };
    compression: { enabled: boolean; threshold: number; ratio: number };
  };
}
```

### Complete Settings Structure

```typescript
export interface UserSettings {
  volume: VolumeSettings;        // Already implemented
  ui: UISettings;
  workflow: WorkflowSettings;
  midi: MIDISettings;
  audio: AudioSettings;
}

export const DEFAULT_SETTINGS: UserSettings = {
  volume: { /* existing defaults */ },

  ui: {
    builderPanel: {
      height: 250,
      activeTab: 'piano',
      rememberedHeights: {
        piano: 250,
        drums: 300,
      },
    },
    timeline: {
      zoom: 1.0,
      showGrid: true,
      showRuler: true,
      snapToGrid: true,
      snapResolution: 'eighth',
    },
    learnMode: {
      chordCardSize: 'normal',
      showBorrowedChords: true,
      groupByFunction: false,
    },
    piano: {
      showScaleDegrees: false,
      octaveRange: {
        start: 60,  // C4
        end: 83,    // B5
      },
      highlightMode: 'scale',
    },
    theme: 'default',
    panelVisibility: {
      chordPalette: true,
      inspector: false,
      mixer: false,
    },
  },

  workflow: {
    recording: {
      countInBars: 1,
      metronomeEnabled: true,
      metronomeVolume: 0.6,
      quantizeOnRecord: false,
      defaultQuantization: 'eighth',
    },
    playback: {
      loopEnabled: false,
      returnToStartOnStop: true,
      scrollFollowsPlayhead: true,
    },
    editing: {
      defaultNoteDuration: 4,      // Quarter note
      defaultChordDuration: 8,     // Whole note
      defaultVelocity: 80,
      duplicateOffsetBars: 1,
    },
    autoSave: {
      enabled: true,
      intervalMinutes: 5,
    },
  },

  midi: {
    enabled: false,
    inputDevice: null,
    outputDevice: null,
    channel: 1,
    ccMappings: {},
  },

  audio: {
    sampleRate: 44100,
    bufferSize: 512,
    masterEffects: {
      reverb: { enabled: false, amount: 0.3 },
      compression: { enabled: false, threshold: -12, ratio: 4 },
    },
  },
};
```

---

## Proposed Expanded Song Structure

The current Song structure is solid, but here are enhancements based on the OVERVIEW_PLAN:

```typescript
export interface Song {
  // Core properties (already implemented)
  id: string;
  name: string;
  tempo: number;
  timeSignature: {
    numerator: number;
    denominator: number;
  };
  key: Note;
  mode: Mode;

  // Track data (already implemented)
  tracks: {
    chords: ChordTrack;
    melody: MelodyTrack;
    drums: DrumTrack;
  };

  // NEW: Song structure & arrangement
  arrangement: {
    sections: SongSection[];           // Verse, Chorus, Bridge, etc.
    markers: Marker[];                 // Custom position markers
    loop: {
      enabled: boolean;
      startTime: number;               // In eighths
      endTime: number;                 // In eighths
    };
  };

  // NEW: Performance data
  performance: {
    swingAmount: number;               // 0-1 (0 = straight, 1 = full swing)
    humanize: {
      timing: number;                  // 0-1 (timing variation)
      velocity: number;                // 0-1 (velocity variation)
    };
  };

  // Metadata (already implemented + expanded)
  metadata: {
    createdAt: number;
    updatedAt: number;
    version: string;                   // Schema version for migration
    tags: string[];                    // User tags/categories
    genre?: string;
    artist?: string;
    notes?: string;                    // User notes about the song

    // Collaboration (future)
    collaborators?: {
      userId: string;
      name: string;
      lastEdit: number;
    }[];

    // Export history
    exports?: {
      format: 'wav' | 'mp3' | 'midi';
      timestamp: number;
      settings: any;
    }[];
  };
}
```

### New Interfaces for Song Structure

```typescript
export interface SongSection {
  id: string;
  name: string;                        // "Intro", "Verse 1", "Chorus", etc.
  startTime: number;                   // In eighths
  endTime: number;                     // In eighths
  color?: string;                      // Color coding for visual distinction
  repeatCount?: number;                // For generating full arrangement
}

export interface Marker {
  id: string;
  name: string;
  time: number;                        // Position in eighths
  color?: string;
}

// Enhanced ChordBlock with additional properties
export interface ChordBlock {
  id: string;
  rootNote: Note;
  intervals: number[];
  numeral: string;
  position: number;
  duration: number;

  // NEW: Additional properties
  voicing?: {
    inversion: number;                 // 0, 1, 2 (root, 1st inv, 2nd inv)
    octaveOffset: number;              // Shift entire chord up/down octaves
  };
  dynamics?: {
    velocity: number;                  // 0-127
    crescendo: boolean;                // Growing louder
    diminuendo: boolean;               // Growing quieter
  };
  articulation?: 'staccato' | 'legato' | 'accent' | 'normal';
}

// Enhanced MelodyNote with additional properties
export interface MelodyNote {
  id: string;
  pitch: NoteWithOctave;
  position: number;
  duration: number;
  velocity: number;

  // NEW: Additional properties
  articulation?: 'staccato' | 'legato' | 'accent' | 'tenuto' | 'normal';
  glideToNext?: boolean;               // Portamento/glide
  vibrato?: {
    enabled: boolean;
    rate: number;                      // Hz
    depth: number;                     // Cents
  };
}

// Enhanced DrumPattern with additional properties
export interface DrumPattern {
  id: string;
  measure: number;
  kick: boolean[];
  snare: boolean[];
  hihat: boolean[];

  // NEW: Velocity per step (for dynamics)
  kickVelocity?: number[];             // 0-127 for each of 16 steps
  snareVelocity?: number[];
  hihatVelocity?: number[];

  // NEW: Humanization per pattern
  humanize?: {
    timing: number;                    // 0-1
    velocity: number;                  // 0-1
  };
}
```

---

## Storage Architecture

```typescript
// localStorage key structure
export const STORAGE_KEYS = {
  SETTINGS: 'enso-piano:settings',

  // Songs stored as array of Song objects
  SONGS: 'enso-piano:songs',

  // ID of currently active song
  ACTIVE_SONG_ID: 'enso-piano:active-song-id',

  // Auto-save slot (separate from main songs)
  AUTOSAVE: 'enso-piano:autosave',

  // Undo/redo history (per song)
  HISTORY: 'enso-piano:history',

  // Recent files list
  RECENT: 'enso-piano:recent',

  // Cloud sync metadata (future)
  SYNC_META: 'enso-piano:sync-metadata',
} as const;

// Song list structure
interface SongList {
  songs: SongMetadata[];               // List of all saved songs
}

interface SongMetadata {
  id: string;
  name: string;
  createdAt: number;
  updatedAt: number;
  tags: string[];
  thumbnailData?: string;              // Base64 preview image
  duration: number;                    // Computed song length in seconds
}
```

---

## Migration Strategy

Since we're expanding the settings structure, we need a migration system:

```typescript
// Add version to settings
interface UserSettings {
  _version: string;                    // "1.0.0", "1.1.0", etc.
  volume: VolumeSettings;
  // ... rest of settings
}

// Migration function
function migrateSettings(stored: any): UserSettings {
  const version = stored._version || '1.0.0';

  // Apply migrations in sequence
  let settings = stored;
  if (isVersionLower(version, '1.1.0')) {
    settings = migrateFrom_1_0_to_1_1(settings);
  }
  if (isVersionLower(version, '1.2.0')) {
    settings = migrateFrom_1_1_to_1_2(settings);
  }

  return { ...DEFAULT_SETTINGS, ...settings, _version: CURRENT_VERSION };
}
```

---

## Implementation Priority

### Phase 1: Essential Settings (Immediate)
1. **Builder panel state**
   - `ui.builderPanel.height` - Save/restore panel height
   - `ui.builderPanel.activeTab` - Remember Piano vs Drums tab
   - Wire up to BuildMode component and useResizable hook

2. **Timeline preferences**
   - `ui.timeline.snapToGrid` - Toggle snap functionality
   - `ui.timeline.snapResolution` - Grid resolution
   - Wire up to useGrid hook

### Phase 2: Workflow Enhancements (Near-term)
3. **Playback settings**
   - `workflow.playback.loopEnabled` - Persist loop state
   - `workflow.playback.returnToStartOnStop`

4. **Piano range**
   - `ui.piano.octaveRange` - Save preferred octave range
   - `ui.piano.showScaleDegrees` - Toggle scale degree display

### Phase 3: Advanced Features (Future)
5. **Song arrangement**
   - `arrangement.sections` - Verse/Chorus/Bridge markers
   - `arrangement.loop` - Custom loop regions

6. **MIDI integration**
   - `midi` settings for controller support
   - CC mapping system

7. **Audio enhancements**
   - Master effects settings
   - Per-track effect chains

---

## Usage Examples

### Saving Builder Panel State
```typescript
// In BuildMode.tsx
const { settings, setSettings } = useSettings();

// When user resizes panel
const handleResize = (newHeight: number) => {
  setSettings((prev) => ({
    ...prev,
    ui: {
      ...prev.ui,
      builderPanel: {
        ...prev.ui.builderPanel,
        height: newHeight,
        rememberedHeights: {
          ...prev.ui.builderPanel.rememberedHeights,
          [bottomView]: newHeight,
        },
      },
    },
  }));
};

// Initialize from saved settings
const initialHeight = settings.ui.builderPanel.rememberedHeights[bottomView];
```

### Snap to Grid Toggle
```typescript
// In Timeline component
const { settings, setSettings } = useSettings();
const { snapToGrid } = useGrid();

const handleDrop = (x: number) => {
  const rawPosition = pixelsToTime(x);
  const finalPosition = settings.ui.timeline.snapToGrid
    ? snapToGrid(rawPosition)
    : rawPosition;

  // Use finalPosition...
};
```

### Loading Song with Fallbacks
```typescript
function loadSong(songData: any): Song {
  // Merge with defaults for backward compatibility
  return {
    ...createEmptySong(),
    ...songData,
    arrangement: {
      sections: [],
      markers: [],
      loop: { enabled: false, startTime: 0, endTime: 0 },
      ...songData.arrangement,
    },
    metadata: {
      ...songData.metadata,
      version: CURRENT_SONG_VERSION,
    },
  };
}
```

---

## Benefits

1. **Better UX**: Panel sizes, zoom levels, and preferences persist across sessions
2. **Professional features**: Song sections, markers, and arrangement tools
3. **Future-proof**: Structure supports MIDI, collaboration, export history
4. **Backward compatible**: Migration system ensures old songs/settings still load
5. **Organized**: Clear separation between UI, workflow, audio, and MIDI settings

---

## Next Steps

1. Update `types/settings.ts` with expanded interfaces
2. Update `DEFAULT_SETTINGS` with sensible defaults
3. Add helper functions to `useSettings.ts` for nested updates
4. Wire up BuildMode to save/restore panel state
5. Add settings UI panel for user control
6. Implement song arrangement features as needed

