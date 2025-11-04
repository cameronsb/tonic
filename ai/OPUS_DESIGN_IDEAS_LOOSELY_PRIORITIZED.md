# Music Theory Learning App - Feature Spec Sheet

**Target Device:** iPad
**App Focus:** Music theory education and chord-based songwriting
**Last Updated:** November 2025

---

## DO NOW (Priority 1 - Core UX Fixes)

### 1.1 Redesign Chord Display in Learn Mode
**Priority:** CRITICAL
**Effort:** Medium (2-3 days)
**Impact:** High - Core learning interface

**Problem:**
Current chord cards are too large, showing only 2-3 at once. Modifiers are essential but take up space. Users need to see all diatonic chords while still accessing modifiers easily.

**Solution:**
Implement compact horizontal chord strip (see mockup).

**Implementation Details:**
- **Chord tabs:** 72×52px minimum touch targets
- **Display all 7 diatonic chords** in horizontal strip (I, ii, iii, IV, V, vi, vii°)
  - Must be visible simultaneously on iPad Pro 12.9" without scrolling
  - Scrollable on smaller iPads (11" and below) if necessary
  - **This is non-negotiable for theory learning** - students need to see the complete scale at once to understand diatonic relationships
- **Borrowed/Augmented chords:** Accessible via separate "Borrowed" button (shown in mockup) that expands to show iv, bVI, bVII, etc.
  - These can be hidden by default since they're not part of the primary scale
  - Button shows count badge when borrowed chords are available (e.g., "Borrowed (4)")
- Active chord shows expanded detail panel below with:
  - Mini keyboard preview (60px height, 7 keys minimum)
  - Modifier buttons in two rows: Extensions (7, maj7, 9, 11, 13, 6) and Alterations (sus2, sus4, add9, aug, dim)
- Modifier buttons: 56×32px minimum, grouped by category

**Success Criteria:**
- [ ] All 7 scale chords visible without scrolling on iPad Pro 12.9"
- [ ] All 7 scale chords visible with minimal scrolling on iPad 11"
- [ ] User can access any modifier within 2 taps
- [ ] No visual cramping or cluttered feeling
- [ ] Keyboard preview updates instantly when chord selected
- [ ] Borrowed chords accessible but not cluttering primary view

**Technical Notes:**
- Use `UICollectionView` with horizontal scrolling
- Smooth scroll snapping to chord boundaries
- Maintain state when switching between Learn/Build modes
- Calculate minimum tab width dynamically: (screen width - padding) / 7

---

### 1.2 Surface Hidden Piano Settings
**Priority:** HIGH
**Effort:** Small (4-6 hours)
**Impact:** High - Discoverability

**Problem:**
Two important toggles are hidden:
1. Show/hide keyboard previews on chord cards
2. Highlight active chord on main piano with orange keys

**Solution:**
Make both toggles contextually visible and discoverable.

**Implementation Details:**

**Toggle 1: Keyboard Preview on Cards**
- Location: Chord strip header bar (top-right)
- Icon: Piano keys symbol (SF Symbol: `pianokeys`)
- Label: "Show Key Preview" or just icon on smaller screens
- State: Toggle button style (iOS native)
- Behavior: Immediately shows/hides mini keyboards on all chord elements

**Toggle 2: Piano Highlighting**
- Location: Floating button overlaid on piano itself (top-right corner)
- Icon: Highlighted key symbol or spotlight icon
- Visual: Semi-transparent background, subtle drop shadow
- Behavior: Highlights currently selected/playing chord notes in orange
- State persistence: Remember per-session

**Success Criteria:**
- [ ] Both toggles discoverable within 30 seconds for new users
- [ ] Icons are self-explanatory (or have brief labels)
- [ ] Visual hierarchy shows these are settings, not primary actions
- [ ] State persists across app sessions

**Technical Notes:**
- Store toggle states in `UserDefaults`
- Piano highlighting should update at 60fps when scrubbing timeline

---

### 1.3 Pattern-Based Drum Sequencer
**Priority:** HIGH
**Effort:** Large (5-7 days)
**Impact:** High - Essential for songwriting workflow

**Problem:**
Hand-programming drums measure-by-measure is tedious. This is a songwriting tool, not a production DAW - drums should support the creative flow, not interrupt it.

**Solution:**
Pattern library + repeat functionality + simplified editor.

**Implementation Details:**

**Pattern Library (Phase 1):**
- 8-10 pre-made patterns:
  - Basic Beat (4/4 straight)
  - Rock Beat 1 (classic backbeat)
  - Rock Beat 2 (with tom fills)
  - Ballad (sparse, half-time feel)
  - Shuffle/Swing
  - 6/8 Feel
  - Punk (8th note hi-hats)
  - Pop (with claps/snaps)
- Each pattern: 1-2 measures, 4/4 time default
- Visual preview: Miniature grid showing kick/snare pattern
- **Pattern preview audio:** Tap pattern in library to hear 2-bar loop before dragging to timeline
- **BPM adaptation:** Patterns automatically adjust to project tempo when placed
- **Variations:** Each pattern can have intro/outro fill variants (optional, Phase 2)

**Drag-and-Drop Workflow:**
1. User drags pattern from library to drum track timeline
2. Pattern appears as block with:
   - Pattern name
   - Mini visual preview
   - Repeat counter (default: ×4)
3. Tap block to edit or change repeat count
4. **Grid quantization:** Pattern blocks snap to measure boundaries when dragging

**Pattern Block UI:**
```
┌─────────────────────────┐
│ 🥁 Rock Beat 1     ×4  │
│ [▮ ▮   ▮ ▮   ▮ ▮   ▮ ] │ ← Mini grid preview
│ [Edit] [Duplicate]      │
└─────────────────────────┘
```

**Quick Editor (popup on tap):**
- 3-lane sequencer: Kick, Snare, Hi-Hat
- 16-step grid (2 measures in 4/4)
- 44×44px touch targets minimum
- "Save as new pattern" option
- "Repeat × times" slider (1-16)
- Real-time audio preview while editing

**Timeline Integration:**
- Drum track sits directly below chord track
- Visual height: ~120px
- Pattern blocks align to measure grid (snap in 1/4 measure increments)
- Drag edges to extend (adds repeats)
- Copy/paste between sections
- **Auto-extend:** Option to automatically extend drum pattern to match chord progression length

**Success Criteria:**
- [ ] Can create 16-measure drum part in under 60 seconds
- [ ] Pattern library covers 80% of common songwriting needs
- [ ] Touch targets are iPad-finger-friendly
- [ ] No accidental taps when editing patterns
- [ ] Pattern audio preview helps users choose right feel
- [ ] Patterns stay in sync when tempo changes

**Technical Notes:**
- Store patterns as JSON (kick/snare/hat arrays + metadata)
- User can create custom patterns and save to library
- Pattern blocks = timeline objects with `repeatCount` property
- Audio engine must handle tempo scaling without pitch shift
- Consider pre-rendering pattern audio at common tempos (60-180 BPM) for performance

---

### 1.4 Replace Emoji Icons with Proper Icons
**Priority:** MEDIUM-HIGH
**Effort:** Small (4-6 hours)
**Impact:** Medium - Visual polish

**Problem:**
Emoji icons (🥁, etc.) make the app feel like a prototype rather than a polished product.

**Solution:**
Replace all emojis with SF Symbols or custom vector icons.

**Implementation Details:**
- **Drums:** `music.note` or custom drum icon
- **Piano:** `pianokeys`
- **Play/Pause:** `play.fill` / `pause.fill`
- **Loop:** `repeat`
- **Add/Plus:** `plus.circle.fill`
- **Settings:** `gear`
- **Timeline:** `waveform`

**Icon Style Guide:**
- Size: 18-24pt for toolbar buttons
- Weight: Medium or Semibold
- Color: White/light gray default, accent color for active states
- Consistent padding around all icons

**Success Criteria:**
- [ ] No emojis remain in production UI
- [ ] Icons are visually consistent (same style/weight)
- [ ] Icons are recognizable at 18pt size
- [ ] All icons have semantic meaning (not just decorative)

---

### 1.5 Convert Rotary Knobs to Sliders
**Priority:** MEDIUM-HIGH
**Effort:** Small (2-3 hours)
**Impact:** High - Usability on touch

**Problem:**
Rotary volume knobs are nearly impossible to use accurately on touchscreens.

**Solution:**
Replace with vertical or horizontal sliders.

**Implementation Details:**
- **Style:** iOS native `UISlider` with custom track styling
- **Orientation:** Vertical (more DAW-like, saves horizontal space)
- **Height:** Minimum 120px travel distance
- **Value display:** Numeric label at top (0-100 or dB)
- **Labels:** "Master" / "Chords" / "Drums" below each slider
- **Touch target:** Full slider height + 20px padding on sides

**Alternative (if space constrained):**
- Horizontal sliders with tap-to-edit numeric input
- Shows popup with fine-grained slider + number pad

**Success Criteria:**
- [ ] Can adjust volume with one finger in single gesture
- [ ] Accurate to within ±2 dB with normal touch input
- [ ] Visual feedback during adjustment (value label updates)
- [ ] No accidental adjustments when touching nearby elements

---

### 1.6 Playback Controls Visibility & Placement
**Priority:** HIGH
**Effort:** Small (4-6 hours)
**Impact:** High - Core functionality must be accessible

**Problem:**
Current mockups show Play/Loop buttons but placement and always-visible status unclear. Users need instant access to playback controls.

**Solution:**
Dedicated transport bar with consistent placement across Learn and Build modes.

**Implementation Details:**

**Transport Bar Location:**
- **Build Mode:** Persistent at top of timeline section (below chord track selector)
- **Learn Mode:** Floating bar at bottom of screen (above piano) or integrated into top bar
- Never hidden or collapsed - always accessible

**Transport Bar Contents:**
```
[◀◀] [▶ Play] [Loop 🔁] [Tempo: 120 BPM] [Metronome 🎵] [Master Vol]
```

**Individual Controls:**
- **Play/Pause:** Large primary button (52×52px minimum), obvious visual state
- **Rewind:** Returns to start or previous section marker
- **Loop:** Toggle to repeat current section/timeline
- **Tempo Display:** Shows current BPM, tap to edit (see 1.7)
- **Metronome:** Toggle on/off, visual beat indicator when enabled
- **Master Volume:** Quick access slider (see 1.5)

**Visual Design:**
- High contrast background to separate from content
- Icons from SF Symbols (see 1.4)
- Active states clearly indicated (Play button becomes Pause, Loop glows when active)
- Disabled states when nothing to play (grayed out, not clickable)

**Success Criteria:**
- [ ] Playback controls accessible within 1 tap from any screen
- [ ] Play/Pause responds within 100ms of tap
- [ ] Visual feedback confirms control state (playing/paused/looping)
- [ ] Transport bar doesn't obscure timeline content

**Technical Notes:**
- Sticky positioning in Build mode (scrolls with timeline but stays visible)
- Floating overlay in Learn mode
- State synced across modes (pause in Build = paused in Learn)

---

### 1.7 Tempo/BPM Editor
**Priority:** MEDIUM-HIGH
**Effort:** Small (3-4 hours)
**Impact:** Medium - Essential for song customization

**Problem:**
Mockup shows "Tempo: 120 BPM" but no obvious way to change it. Users need to adjust tempo for different song styles and learning speeds.

**Solution:**
Tap-to-edit tempo control with sensible defaults and constraints.

**Implementation Details:**

**Tempo Display (on Transport Bar):**
- Shows current BPM: "Tempo: 120"
- Tap to open tempo editor popup

**Tempo Editor Popup:**
```
┌────────────────────────┐
│   Tempo                │
│   ┌────────────────┐   │
│   │ 120            │   │ ← Large numeric input
│   └────────────────┘   │
│   [- 10] [- 1] [+ 1] [+ 10] │ ← Quick adjust
│   ┌────────────────┐   │
│   │─────●──────────│   │ ← Slider (60-200 BPM)
│   └────────────────┘   │
│   60      120      200  │
│                        │
│   Common Tempos:       │
│   [Slow 70] [Medium 100] [Fast 140] │
│   [Cancel] [Apply]     │
└────────────────────────┘
```

**Features:**
- **Range:** 60-200 BPM (covers 99% of songs)
- **Precision:** Integer values only (no decimal BPM)
- **Quick Presets:** Slow (70), Medium (100), Fast (140), Very Fast (160)
- **Incremental buttons:** ±1 and ±10 for fine/coarse adjustment
- **Real-time preview:** Hear metronome at new tempo before applying
- **Keyboard input:** Can type exact value

**Visual Feedback:**
- Tempo changes in Learn mode: Updates piano/chord playback speed
- Tempo changes in Build mode: Scales drum patterns, updates measure spacing visually

**Success Criteria:**
- [ ] Can change tempo in under 5 seconds
- [ ] Tempo change takes effect immediately (no lag)
- [ ] Drum patterns adjust timing without glitches
- [ ] Tempo persists when switching between Learn/Build modes

**Technical Notes:**
- Store tempo as project property (not global setting)
- Use `AVAudioEngine` time stretching for drum patterns
- Tempo changes trigger recalculation of measure widths in timeline
- Consider allowing tempo to be changed during playback for practice (advanced feature)

---

## DO NOW (Priority 2 - Structural Improvements)

### 2.1 Add Drum Track to Timeline
**Priority:** HIGH
**Effort:** Medium (3-4 days)
**Impact:** High - Enables pattern workflow

**Problem:**
Drums exist only in separate editor. They need visible representation on timeline alongside chords for integrated songwriting.

**Solution:**
Multi-track timeline with chord track primary, drum track secondary.

**Implementation Details:**

**Timeline Structure:**
```
┌─────────────────────────────────────────┐
│ [1]     [2]     [3]     [4]     [5]    │ ← Measure markers
├─────────────────────────────────────────┤
│ CHORDS (180px height)                   │
│ [I-C──] [V-G──] [vi-Am] [IV-F─] [I-C]  │
├─────────────────────────────────────────┤
│ DRUMS (120px height)                    │
│ [🥁 Rock Beat ×8─────────────────────]  │
├─────────────────────────────────────────┤
│ MELODY (future - 100px height)          │
│                                         │
└─────────────────────────────────────────┘
```

**Visual Hierarchy:**
- Chord track: Largest, most prominent colors
- Drum track: Secondary visual weight, muted colors
- Clear separators between tracks
- Shared measure grid lines

**Interaction:**
- Independent scrolling per track (or locked together - user preference)
- Drag items within same track only
- Copy/paste across measures
- Multi-select for bulk operations

**Success Criteria:**
- [ ] Both tracks visible at once on iPad
- [ ] Clear which track is active when editing
- [ ] Measure alignment is obvious across tracks
- [ ] Can quickly add/remove/rearrange blocks on either track

**Technical Notes:**
- Use stacked `UICollectionView`s or custom track view
- Snap-to-measure grid when dragging
- Zoom in/out to see more or fewer measures

---

### 2.2 Learn → Build Chord Transfer
**Priority:** MEDIUM
**Effort:** Medium (2-3 days)
**Impact:** Medium-High - Bridges learning to creation

**Problem:**
Learning progressions in Learn mode doesn't easily transfer to Build mode. Users have to manually reconstruct what they learned.

**Solution:**
Enable seamless transfer of chord progressions from Learn mode to Build timeline.

**Implementation Details:**

**Recommended Approach (Implement Both):**

**Primary Method: "Use in Song" Button**
- Button appears in Learn mode chord section: "Use This Progression" or "Add to Song"
- Switches to Build mode and pre-populates chord track with currently visible/selected chords
- Default: Places one chord per measure, starting at current playhead position
- **Lowest friction for beginners** - most obvious and discoverable

**Secondary Method: Long-Press Drag (Power Users)**
- Long-press on any chord in Learn mode activates drag state
- Drag individual chord onto Build mode timeline (if visible in split view)
- Hold Shift/Cmd to select and drag multiple chords as a sequence
- **For advanced users** who want precise placement

**Not Recommended: Clipboard Method**
- More steps (copy → switch modes → paste)
- Less intuitive than direct button or drag
- Only implement if the above two methods prove insufficient in testing

**User Flow Example:**
1. Student experiments with I-vi-IV-V progression in Learn mode
2. Likes the sound, taps "Use in Song"
3. App switches to Build mode, places 4 chord blocks on timeline
4. Student can immediately play it back, extend it, add drums

**Success Criteria:**
- [ ] Can transfer a 4-chord progression in under 10 seconds
- [ ] Chord order is preserved exactly as shown in Learn mode
- [ ] Default duration: 1 measure per chord (user can adjust after placement)
- [ ] Works for custom progressions with modifiers (e.g., Imaj7 → Imaj7 in timeline)
- [ ] "Use in Song" button is discoverable by 80% of users without prompting

**Technical Notes:**
- Store chord selection state when switching modes
- Respect current timeline position (don't always start at measure 1)
- Confirm overwrite if timeline position already has chords
- Consider "Append to End" vs "Insert Here" options

---

### 2.3 Song Section Markers
**Priority:** MEDIUM
**Effort:** Small-Medium (2 days)
**Impact:** Medium - Helps teach song structure

**Problem:**
Timeline is a flat sequence. Users (especially learners) benefit from understanding song structure (verse, chorus, bridge).

**Solution:**
Section markers that label regions of the timeline.

**Implementation Details:**

**Marker UI:**
```
[Intro────] [Verse 1──────] [Chorus──] [Verse 2──────] [Chorus──] [Bridge──] [Outro─]
```

**Interaction:**
- Tap between measures to insert section marker
- Label options: Intro, Verse, Chorus, Pre-Chorus, Bridge, Outro, Custom
- Visual: Different background tint per section type
- Drag edges to resize section

**Visual Design:**
- Section name appears above timeline
- Subtle color coding (Verse: blue, Chorus: yellow, Bridge: purple)
- Doesn't interfere with chord/drum blocks

**Success Criteria:**
- [ ] Sections are visually distinct but not distracting
- [ ] Can create standard song structure (ABABCB) in ~30 seconds
- [ ] Section names are customizable
- [ ] Sections can be rearranged (drag entire section)

**Bonus Features (Backlog):**
- Duplicate section (e.g., Verse 1 → Verse 2)
- Section templates (Pop, Rock, Ballad structures)

---

## BACKLOG (Future Enhancements)

### 3.1 iPad-Native Top Bar Redesign
**Priority:** LOW-MEDIUM
**Effort:** Small (1-2 days)

**Current Issue:**
Expand/collapse top bar feels desktop-y, not iPad-native.

**Proposed Solution:**
- Persistent slim bar with key/scale/time always visible
- iOS-style segmented controls instead of dropdowns
- Slide-over panel from right edge for advanced settings
- Example: Key/Scale selector as horizontal picker wheel

**Deferred because:**
Current functionality works, not blocking core workflows. Polish item for v2.

---

### 3.2 Advanced Pattern Editor Features
**Priority:** LOW
**Effort:** Medium

**Features:**
- Velocity per note (if user feedback demands it)
- Swing/humanize slider
- More than 3 lanes (add crash, ride, toms)
- Pattern variations (intro fill, ending fill)

**Deferred because:**
Pattern library + repeat covers 90% of use cases. This adds complexity for marginal benefit in a learning tool.

---

### 3.3 Haptic Feedback System
**Priority:** LOW
**Effort:** Small

**Proposed Haptics:**
- Light tap when placing chord on timeline
- Medium tap when snapping to measure grid
- Heavy tap when deleting block
- Selection feedback when tapping through chord tabs

**Deferred because:**
Nice-to-have polish, not essential for functionality.

---

### 3.4 Gesture-Based Interactions
**Priority:** LOW-MEDIUM
**Effort:** Medium

**Proposed Gestures:**
- Two-finger scrub on timeline (seek through song)
- Pinch-to-zoom on sequencer (see more/fewer measures)
- Swipe down on chord card to dismiss detail view
- Three-finger swipe to undo/redo

**Deferred because:**
Requires careful UX design to avoid gesture conflicts. Better to nail tap-based interaction first.

---

### 3.5 Keyboard Shortcuts (for iPad + Keyboard)
**Priority:** LOW
**Effort:** Small-Medium

**Proposed Shortcuts:**
- Space: Play/Pause
- Cmd+Z/Y: Undo/Redo
- Numbers 1-7: Select chord I-vii
- Cmd+D: Duplicate selected block
- Delete: Remove selected block
- Arrow keys: Navigate timeline

**Deferred because:**
Most iPad users don't have keyboard attached. Benefit is small relative to development cost.

---

### 3.6 Melody Track
**Priority:** MEDIUM (Future Major Feature)
**Effort:** Large (2-3 weeks)

**Scope:**
- Piano roll editor for melody line
- Snap to scale (highlight valid notes)
- Integration with chord progression (suggest melody notes based on chord)
- Simple input: tap to place notes, drag to adjust length
- Playback with piano or synth voice

**Deferred because:**
Chords + drums are the foundation. Melody is a natural next step once those are solid.

---

### 3.7 Lyrics Track
**Priority:** MEDIUM (Future Major Feature)
**Effort:** Medium (1-2 weeks)

**Scope:**
- Simple text editor aligned to timeline
- Markers for line breaks, syllable divisions
- Possible integration with section markers (auto-populate verse structure)
- Export lyrics as plain text or PDF

**Deferred because:**
Lyrics are important for songwriting but can be done externally. Lower priority than melody.

---

### 3.8 Chord Progression Library
**Priority:** MEDIUM
**Effort:** Medium

**Concept:**
- Pre-made famous progressions (I-V-vi-IV, i-VI-III-VII, etc.)
- Searchable by style (Pop, Rock, Jazz, etc.)
- One-tap to load into Learn mode or Build mode
- Educational annotations explaining why progressions work

**Deferred because:**
Users can build these themselves currently. Nice educational enhancement but not core to v1 functionality.

---

### 3.9 Export/Share Features
**Priority:** MEDIUM-HIGH (for v1.1)
**Effort:** Medium

**Features:**
- Export MIDI file
- Export audio (mixed down piano + drums)
- Share link to view project (read-only web viewer)
- Export chord chart as PDF

**Deferred because:**
Need solid creation tools first before worrying about export. But this is high priority for first update after launch.

---

### 3.10 Tempo Changes / Time Signature Changes
**Priority:** LOW
**Effort:** Medium

**Scope:**
- Place tempo markers on timeline
- Support 3/4, 6/8, 5/4 in addition to 4/4
- Visual indication of time signature changes

**Deferred because:**
Adds significant complexity. Most songs stick to one tempo and time signature throughout. Covers 95% of use cases without this.

---

## Design System Guidelines

### Typography
- **Headers:** SF Pro Display, Semibold, 16-20pt
- **Body:** SF Pro Text, Regular, 13-15pt
- **Labels:** SF Pro Text, Medium, 11-13pt
- **Timeline Text:** SF Pro Text, Semibold, 12pt

### Color Palette
- **Background:** `#1a1d2e` (dark navy)
- **Surface:** `#252938` (lighter navy)
- **Surface Elevated:** `#2a2d3e`
- **Primary Accent:** `#5b5fc7` (purple-blue)
- **Secondary Accent:** `#7579d7` (lighter purple)
- **Chord Highlight:** `#f4a261` → `#e76f51` (orange gradient)
- **Text Primary:** `#e8e9f0` (off-white)
- **Text Secondary:** `#a0a5b8` (muted gray)
- **Text Tertiary:** `#8b90a5` (darker gray)

### Spacing
- **Base Unit:** 8px
- **Small Gap:** 8px
- **Medium Gap:** 16px
- **Large Gap:** 24px
- **Section Gap:** 32px

### Border Radius
- **Small Elements:** 8px
- **Cards/Panels:** 12px
- **Large Panels:** 16px

### Touch Targets
- **Minimum:** 44×44pt (Apple HIG standard)
- **Preferred:** 52×52pt for primary actions
- **Button Padding:** 12-16px horizontal, 8-12px vertical

---

## Success Metrics

### Core Learning Experience
- [ ] User can identify all 7 diatonic chords within 60 seconds
- [ ] User can hear chord by tapping (no looking up fingering)
- [ ] Modifiers are discoverable within first 2 minutes of use

### Songwriting Flow
- [ ] Can create 8-measure chord progression in under 2 minutes
- [ ] Can add drums to entire song in under 1 minute
- [ ] No need to refer to manual for basic operations
- [ ] Can playback song with chords + drums without audio glitches
- [ ] Can edit timeline while playing (real-time changes reflected)

### Technical Performance
- [ ] App loads in under 2 seconds
- [ ] Timeline scrolling at 60fps
- [ ] Audio playback latency under 20ms
- [ ] No crashes during normal operation
- [ ] Tempo changes apply smoothly without audio dropouts

### User Satisfaction (Post-Beta Testing)
- [ ] 80%+ of users can complete basic progression without help
- [ ] 90%+ say interface is "intuitive" or "easy to learn"
- [ ] Feature requests focus on expansion, not fixing core UX

---

## Implementation Timeline (Estimated)

**Sprint 1 (Week 1-2):** DO NOW Priority 1 Core
- 1.1 Chord strip redesign
- 1.2 Surface hidden settings
- 1.4 Icon replacement
- 1.5 Knobs to sliders
- 1.6 Playback controls placement
- 1.7 Tempo editor

**Sprint 2 (Week 3-4):** DO NOW Priority 1 Major Feature + Priority 2
- 1.3 Pattern-based drums (major feature - allocate full week)
- 2.1 Drum track on timeline
- 2.2 Learn → Build transfer

**Sprint 3 (Week 5):** Polish + Testing
- 2.3 Section markers
- Bug fixes
- User testing with 5-10 target users
- Iteration based on feedback

**Post-Launch:** Backlog items based on user feedback and analytics

---

## Notes

- This spec assumes SwiftUI or UIKit for iPad development (lol - jk we are working with JS in browser for the foreseeable future)
- All designs should be tested on 11" and 12.9" iPad Pro
- Consider accessibility: VoiceOver support, Dynamic Type, color contrast
- Performance: Test with 50+ measure projects to ensure smooth scrolling
- Audio engine optimization: Ensure pattern playback doesn't spike CPU
- This is a living document - update as features are implemented and new learnings emerge
- All 7 diatonic chords must remain visible at all times - this is core to the learning experience