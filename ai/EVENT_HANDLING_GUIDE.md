# Event Handling Guide - Unified Touch & Mouse Support

**Created:** November 3, 2025
**Purpose:** Document event handling patterns for consistent cross-device support

---

## 🎯 Overview

This app supports three input methods seamlessly:
- **Desktop:** Mouse events (click, drag, hover)
- **iPad:** Touch events (tap, slide, multi-touch)
- **Mobile:** Touch events (tap, slide)

We've created unified hooks to abstract the complexity and ensure consistent behavior.

---

## 🔧 Available Hooks

### 1. `useGlissando` - Drag to Play

**Purpose:** Enable drag-across interaction (like piano glissando)

**Use When:** You want to trigger actions by dragging across elements

**Example:**
```typescript
import { useGlissando } from '../hooks/useGlissando';

const { isActive, handlers } = useGlissando({
  onTrigger: (noteId) => playNote(noteId),
  selector: '.piano-key',
  getIdentifier: (element) => element.getAttribute('aria-label'),
});

<div {...handlers}>
  <button className="piano-key" aria-label="C4">C</button>
  <button className="piano-key" aria-label="D4">D</button>
</div>
```

**Features:**
- ✅ Works with mouse (drag) and touch (slide)
- ✅ Prevents duplicate triggers
- ✅ Automatic pointer tracking
- ✅ Optional throttling
- ✅ Works with any CSS selector

### 2. `usePointerEvents` - Unified Mouse/Touch

**Purpose:** Abstract mouse and touch event differences

**Use When:** You need consistent pointer handling without glissando logic

**Example:**
```typescript
import { usePointerEvents } from '../hooks/usePointerEvents';

const handlers = usePointerEvents({
  onPointerDown: ({ x, y }) => console.log('Pointer down at', x, y),
  onPointerMove: ({ x, y }) => console.log('Moving at', x, y),
  onPointerUp: () => console.log('Pointer up'),
});

<div {...handlers}>Draggable area</div>
```

**Features:**
- ✅ Single callback for mouse and touch
- ✅ Normalizes position to { x, y }
- ✅ Handles multi-touch (tracks first touch only)
- ✅ Configurable preventDefault/stopPropagation

### 3. `useDragResize` - Panel Resizing

**Purpose:** Drag to resize panels (width or height)

**Use When:** Building resizable panels or split views

**Example:**
```typescript
import { useDragResize } from '../hooks/useDragResize';

const { size, isResizing, handleMouseDown, handleTouchStart } = useDragResize({
  initialSize: 300,
  minSize: 150,
  maxSize: 600,
  direction: 'vertical',
});

<div style={{ height: size }}>
  Content
</div>
<div onMouseDown={handleMouseDown} onTouchStart={handleTouchStart}>
  Resize handle
</div>
```

**Features:**
- ✅ Works for both width and height
- ✅ Min/max constraints
- ✅ Automatic cursor management
- ✅ Event listener cleanup

---

## 🎹 Piano Glissando Implementation

The Piano component now supports glissando on **both desktop and touch devices**:

### How It Works

**On Desktop:**
1. Mouse down on a key → Play that key
2. Keep mouse down and drag → Play each key as you hover over it
3. Mouse up or leave → Stop glissando

**On iPad/Mobile:**
1. Touch a key → Play that key
2. Keep finger down and slide → Play each key as you slide over it
3. Lift finger → Stop glissando

### Implementation

```typescript
// Piano.tsx
const { isActive: isGlissandoActive, handlers: glissandoHandlers } = useGlissando({
  onTrigger: async (keyNote: string) => {
    const keyData = keys.find(k => k.note === keyNote);
    if (keyData) {
      await audio.playNote(keyData.frequency);
    }
  },
  selector: '.piano-key',
  getIdentifier: (element) => element.getAttribute('aria-label'),
  preventDefault: true,
});

// Spread handlers onto piano container
<div className="piano-keys" {...glissandoHandlers}>
  {/* Piano keys */}
</div>
```

### CSS Support

The `.glissando-active` class is automatically added during drag/slide:

```css
.piano-keys.glissando-active .piano-key {
  pointer-events: none; /* Prevents interfering with glissando */
}
```

---

## 🎨 Event Handling Best Practices

### 1. Always Prevent Default on Touch Events

**Why:** Prevents browser zooming, scrolling, context menus

```typescript
const handleTouchStart = (e: React.TouchEvent) => {
  e.preventDefault(); // ← Important!
  // Your logic
};
```

### 2. Track Touch Identifiers for Multi-Touch

**Why:** Distinguishes between different fingers on multi-touch devices

```typescript
const [touchId, setTouchId] = useState<number | null>(null);

const handleTouchStart = (e: React.TouchEvent) => {
  if (e.touches.length > 0 && touchId === null) {
    const touch = e.touches[0];
    setTouchId(touch.identifier); // ← Track this touch
  }
};

const handleTouchEnd = (e: React.TouchEvent) => {
  const changedTouches = Array.from(e.changedTouches);
  if (touchId !== null && changedTouches.some(t => t.identifier === touchId)) {
    setTouchId(null); // ← Clear when this specific touch ends
  }
};
```

### 3. Use elementFromPoint for Drag Detection

**Why:** Works across all browsers and input methods

```typescript
const element = document.elementFromPoint(clientX, clientY);
const targetElement = element?.closest('.piano-key');
```

### 4. Avoid Duplicate Triggers

**Why:** Prevents audio stuttering and performance issues

```typescript
const lastTriggeredRef = useRef<string | null>(null);

if (identifier === lastTriggeredRef.current) return; // Skip duplicate
lastTriggeredRef.current = identifier;
```

### 5. Set Appropriate CSS for Touch

**Why:** Improves touch experience and prevents conflicts

```css
.interactive-element {
  touch-action: none; /* Disable browser touch gestures */
  -webkit-tap-highlight-color: transparent; /* Remove iOS tap highlight */
  cursor: pointer;
  min-height: 44px; /* iOS minimum touch target */
}
```

---

## 📱 Device-Specific Considerations

### Desktop (Mouse)
- ✅ Hover states work
- ✅ Right-click context menus
- ✅ Precise pixel-level positioning
- ✅ Multiple button support (left, right, middle)

### iPad (Touch)
- ✅ Multi-touch support (track multiple fingers)
- ✅ Gesture support (slide, swipe)
- ⚠️ No hover states
- ⚠️ Larger touch targets needed (44px minimum)
- ⚠️ Must prevent default to avoid browser gestures

### Mobile (Touch)
- ✅ Touch events work same as iPad
- ⚠️ Smaller screen requires careful sizing
- ⚠️ Prevent zoom on double-tap
- ⚠️ Watch for soft keyboard triggering

---

## 🔍 Common Patterns

### Pattern 1: Simple Click/Tap

```typescript
<button
  onClick={() => handleAction()}
  // Touch devices trigger onClick on tap automatically
>
  Click me
</button>
```

### Pattern 2: Press and Hold

```typescript
const [isPressed, setIsPressed] = useState(false);

<div
  onMouseDown={() => setIsPressed(true)}
  onMouseUp={() => setIsPressed(false)}
  onTouchStart={() => setIsPressed(true)}
  onTouchEnd={() => setIsPressed(false)}
>
  {isPressed ? 'Pressed' : 'Press me'}
</div>
```

### Pattern 3: Drag to Interact (Glissando)

```typescript
const { handlers } = useGlissando({
  onTrigger: (id) => handleTrigger(id),
  selector: '.interactive-item',
  getIdentifier: (el) => el.getAttribute('data-id'),
});

<div {...handlers}>
  <div className="interactive-item" data-id="1">Item 1</div>
  <div className="interactive-item" data-id="2">Item 2</div>
</div>
```

### Pattern 4: Resize Drag

```typescript
const { size, handleMouseDown, handleTouchStart } = useDragResize({
  initialSize: 300,
  minSize: 150,
  maxSize: 600,
  direction: 'vertical',
});

<ResizeHandle
  direction="vertical"
  isResizing={isResizing}
  onMouseDown={handleMouseDown}
  onTouchStart={handleTouchStart}
/>
```

---

## ⚠️ Common Pitfalls

### ❌ Don't: Mix onClick with onMouseDown/onTouchStart

**Problem:** Causes double triggers

```typescript
// BAD
<button
  onClick={handleClick}
  onMouseDown={handleMouseDown}
  onTouchStart={handleTouchStart}
>
  Double trigger!
</button>
```

**Solution:** Use one or the other

```typescript
// GOOD - Simple interaction
<button onClick={handleClick}>
  Click me
</button>

// GOOD - Need press/release distinction
<button
  onMouseDown={handlePress}
  onMouseUp={handleRelease}
  onTouchStart={handlePress}
  onTouchEnd={handleRelease}
>
  Press me
</button>
```

### ❌ Don't: Forget to Check Touch Identifier

**Problem:** Multi-touch chaos

```typescript
// BAD
const handleTouchEnd = (e: React.TouchEvent) => {
  setTouchId(null); // Clears even if wrong finger lifted!
};
```

**Solution:** Verify touch identifier

```typescript
// GOOD
const handleTouchEnd = (e: React.TouchEvent) => {
  const changedTouches = Array.from(e.changedTouches);
  if (touchId !== null && changedTouches.some(t => t.identifier === touchId)) {
    setTouchId(null); // Only clear if our finger lifted
  }
};
```

### ❌ Don't: Forget preventDefault on Touch

**Problem:** Browser zooms, scrolls, or shows context menu

```typescript
// BAD
const handleTouchStart = (e: React.TouchEvent) => {
  // Browser may zoom or scroll!
  playNote();
};
```

**Solution:** Always preventDefault for interactive elements

```typescript
// GOOD
const handleTouchStart = (e: React.TouchEvent) => {
  e.preventDefault(); // ← Prevents browser gestures
  playNote();
};
```

---

## 🧪 Testing Checklist

When implementing new interactions, test on:

- [ ] **Desktop Chrome** - Mouse drag works smoothly
- [ ] **Desktop Safari** - Mouse drag works smoothly
- [ ] **iPad Safari** - Touch slide works, no zoom/scroll
- [ ] **iPad Chrome** - Touch slide works, no zoom/scroll
- [ ] **iPhone Safari** - Touch slide works on small screen
- [ ] **Android Chrome** - Touch slide works

Test scenarios:
- [ ] Single click/tap triggers correctly
- [ ] Drag/slide triggers each element once
- [ ] Releasing pointer stops interaction
- [ ] No duplicate triggers
- [ ] No browser gestures (zoom, scroll, context menu)
- [ ] Works with one finger (doesn't interfere with multi-touch)

---

## 📚 Reference

### Related Files

**Hooks:**
- `src/hooks/useGlissando.ts` - Drag-to-play hook
- `src/hooks/usePointerEvents.ts` - Unified pointer abstraction
- `src/hooks/useDragResize.ts` - Resize panels

**Components:**
- `src/components/Piano.tsx` - Uses glissando for piano keys
- `src/components/PianoKey.tsx` - Individual key events
- `src/components/ui/ResizeHandle.tsx` - Resize handle with touch support

**Config:**
- `src/config/ui.ts` - Touch target sizes (SIZES.minTouchTarget = 44px)

### External Resources

- [MDN Touch Events](https://developer.mozilla.org/en-US/docs/Web/API/Touch_events)
- [MDN Pointer Events](https://developer.mozilla.org/en-US/docs/Web/API/Pointer_events)
- [iOS Touch Guidelines](https://developer.apple.com/design/human-interface-guidelines/inputs/touchscreen-gestures)

---

## 🚀 Future Enhancements

Possible improvements for event handling:

1. **Pressure Sensitivity** - Use touch force for velocity (iPad Pro)
2. **Gesture Recognition** - Swipe, pinch, rotate
3. **Haptic Feedback** - Vibration on touch (mobile/iPad)
4. **Pointer Events API** - Modern unified API (when browser support improves)
5. **Multi-Touch Chords** - Play chords by touching multiple keys simultaneously

---

**The event system is now unified, well-documented, and ready for cross-device use!** 🎮

