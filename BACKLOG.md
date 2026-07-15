# Backlog

Feature ideas and larger proposals that aren't yet scheduled work. Each entry gets a status (`idea/scoping` → `scoped` → `in progress` → `shipped`/`dropped`) and a date. Roadmap-tier work (bugs, refactors, a11y) lives in `ROADMAP.md`; this file is for new product surface.

---

## Playback / Reference Mode

**Status:** idea/scoping · **Added:** 2026-07-15

### Overview

Let users pick a piano song and watch it play back through the existing core UI: piano keys light up as they sound, the current chord highlights in the chord strip, and learn-mode views stay in sync. The point is *reference* — seeing how a real song moves through keys and chords — not performance training.

### Goals

- Playback renders through the components that already exist (key highlights, chord strip, chord cards) rather than a new visualization surface.
- Songs are understandable objects: a user can look at one, see its key, its chords, and its melody, and connect that to what the rest of the app teaches.
- Speed control and chord-stepping make it usable as a slow-motion study tool.
- Keep it deliberately simple and easy to understand.

### Non-goals (v1)

- Not a Synthesia clone: no falling-note waterfall, no scoring or accuracy tracking, no game layer.
- No sheet-music rendering.
- No user uploads or in-browser song editing (authoring stays a developer/owner workflow initially).

### UX sketch

- **Entry point:** a mode alongside the existing modes (Free Play / Learn / …). Name candidates, decision open: **Playback mode**, **Listen mode**, **Song mode**, **Reference mode**.
- **Transport bar:** play/pause · restart · tempo multiplier (0.25×–1.5×) · loop a section · **chord-step mode** — playback pauses at each chord boundary and advances on demand, one chord at a time.
- **Song picker:** simple list (title, artist, key, difficulty-ish tag). 3–5 songs is plenty at first.
- While playing, the piano and chord strip behave exactly as if a very precise player were pressing the keys.

### Data schema sketch

A hand-authorable JSON file per song. **Design constraint: the schema must be easy to write by hand**, since sourcing songs will likely involve manual input by the project owner. Beats (not milliseconds) as the time unit, so tempo scaling is free and files stay readable.

```json
{
  "title": "Let It Be",
  "artist": "The Beatles",
  "key": "C",
  "mode": "major",
  "tempo": 72,
  "timeSignature": "4/4",
  "sections": [
    {
      "label": "verse",
      "chords": [
        { "atBeat": 0, "numeral": "I", "rootNote": "C", "quality": "maj" },
        { "atBeat": 4, "numeral": "V", "rootNote": "G", "quality": "maj" }
      ],
      "notes": [
        { "atBeat": 0, "note": "C4", "durationBeats": 1 },
        { "atBeat": 1, "note": "E4", "durationBeats": 1 },
        { "atBeat": 2, "note": "G4", "durationBeats": 2 }
      ]
    }
  ]
}
```

- `chords` drive the chord-strip highlight and chord-step boundaries; `notes` drive key highlights (and audio).
- Chord annotations reuse the app's existing vocabulary (`numeral`, root `Note`, quality matching `ChordType`), so the chord strip can highlight without translation.
- Sections give loop points and chord-step structure for free.

### Song sourcing

1. **v1 — hand-authored JSON** (owner-in-the-loop): pick simple, well-known songs and transcribe the lead-sheet level (chords + melody). This is the "entirely different beast" acknowledged up front — the schema above is designed to make that manual work as painless as possible.
2. **Later — MIDI import + manual chord annotation:** a small script converts a MIDI file to the notes array; chords still get annotated by hand (automatic chord detection is a rabbit hole).
3. **Licensing:** start with public-domain / traditional material (folk tunes, hymns, classical themes) to sidestep it entirely; treat pop songs as chord-progression-only entries if needed.

### Phasing

1. **Schema + engine:** define the song type, hardcode one song, build a minimal playback engine (beat clock → key-highlight props + chord-strip highlight). No UI beyond play/stop.
2. **Transport:** play/pause/restart, tempo multiplier, loop section, chord-step mode.
3. **Picker + catalog:** song selection UI, 3–5 hand-authored songs.
4. **Authoring/import tooling:** MIDI → notes script, an authoring checklist, maybe a validation script for song files.

### Open questions

- Audio on playback, or visual-only by default? (Audio reuses the existing soundfont engine; visual-only might be the less surprising default with a sound toggle.)
- What happens when the user presses keys during playback — blocked, layered, or pause-on-touch?
- Where does playback state live? A dedicated provider fits the direction the app is moving (single `SettingsProvider`, memoized `MusicContext`) — playback likely wants its own context rather than growing `MusicContext`.
- Does chord-step mode belong to playback only, or is it a general "progression practice" feature the chord strip could offer without a song?
