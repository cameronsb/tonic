# UI Rework Progress Log

**Branch:** `refactor/ui-rework-2`
**Started:** November 3, 2025
**Goal:** Implement OPUS design spec improvements for cleaner, more usable interface

---

## High-Level Plan

### ✅ Phase 1: Infrastructure & Core Layout
- [x] Legacy/rework split with URL param switching
- [x] Folder structure (`src/rework/`)
- [x] Code comment policy in CLAUDE.md

### ✅ Phase 2: Horizontal Chord Strip (Spec 1.1)
- [x] ChordStripRework component - all 7 diatonic chords visible
- [x] ChordTabRework - 72×52px touch targets
- [x] Borrowed chords toggle button
- [x] Modifier panel with 12 buttons (6×2 grid)
- [x] Audio playback integration
- [x] Piano preview integration
- [x] Flexible layout with working resize handle

### 🔄 Phase 3: Surface Hidden Settings (Spec 1.2)
- [ ] Keyboard preview toggle (visible in chord strip header)
- [ ] Piano highlighting toggle (floating on piano)
- [ ] Both discoverable within 30 seconds

### 📋 Phase 4: Visual Polish (Specs 1.4-1.7)
- [ ] Replace emoji icons with proper icons
- [ ] Convert rotary volume knobs to sliders
- [ ] Persistent playback controls (transport bar)
- [ ] Tempo/BPM editor UI

### 📋 Phase 5: Structural Improvements (Spec 2.1-2.3)
- [ ] Drum track on timeline
- [ ] Learn → Build chord transfer
- [ ] Song section markers

---

## Detailed Progress

### 2025-11-03: Session 1

**Created Infrastructure:**
- `src/App.tsx` - Router between legacy and rework
- `src/AppLegacy.tsx` - Original app (accessible via `?legacy=true`)
- `src/rework/` - New implementations folder
- Updated `CLAUDE.md` with code comment policy

**Implemented Horizontal Chord Strip (Spec 1.1):**
- `ChordStripRework.tsx` - Main container with horizontal layout
- `ChordTabRework.tsx` - Individual chord buttons
- `LearnModeRework.tsx` - Updated iPad layout
- All supporting CSS files
- Features:
  - 7 diatonic chords always visible (72×52px touch targets)
  - Borrowed chords toggle with count badge
  - Detail panel with 12 modifier buttons
  - Mini keyboard previews
  - Audio playback on click
  - Piano highlighting integration
  - Flexible layout maintaining resize functionality

**Files Created:**
- `src/rework/AppRework.tsx`
- `src/rework/AppRework.css`
- `src/rework/components/LearnModeRework.tsx`
- `src/rework/components/LearnModeRework.css`
- `src/rework/components/ChordStripRework.tsx`
- `src/rework/components/ChordStripRework.css`
- `src/rework/components/ChordTabRework.tsx`
- `src/rework/components/ChordTabRework.css`

**Status:** Phase 2 complete, ready for Phase 3

---

## Testing

**Dev Server:** http://localhost:5177/
- New version: Default
- Legacy version: `?legacy=true`

**TypeScript:** ✅ No errors
**Build:** ✅ Ready
