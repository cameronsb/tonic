# Claude Agent Instructions for Piano Redesign Project

## 📁 Project Documentation Structure

**The `ai/` folder** contains all AI-generated documentation, analysis, and work logs:
- Analysis documents (codebase structure, architecture reviews)
- Progress tracking and session summaries
- Refactoring plans and roadmaps
- Work logs and commit summaries
- Feature proposals and implementation guides

**Keep in root:** Only essential documentation (README.md, DEVELOPMENT.md, this CLAUDE.md file)

**When generating new documentation:** Place analysis, summaries, and work logs in `ai/` folder to keep the root clean.

## 🚨 CRITICAL: Test Early, Test Often

**THINGS WILL BREAK.** This is a complex audio application with multiple interacting systems. Every change you make has the potential to break something else. Your job is to catch breaks early before they cascade.

## Before You Start ANY Work

1. **Verify the current state works:**
   ```bash
   npm run test       # Runs BOTH TypeScript AND client-side checks
   npm run dev        # Start the dev server (keep it running)
   ```

2. **NEW: Check for client-side errors automatically:**
   ```bash
   npm run check:client  # Detects JavaScript errors in the browser
   ```
   This will catch:
   - Module loading failures
   - Missing exports/imports
   - Syntax errors in the browser
   - Server connection issues

3. **Open the browser and manually test:**
   - Can you click piano keys?
   - Does audio play?
   - Do the modes (Learn/Build) switch properly?

4. **If anything is broken, STOP and fix it first**

## Working Protocol

### For EVERY Change You Make:

1. **Before editing:** Read the file completely first
2. **After each edit:** Run `npm run typecheck`
3. **After import/export changes:** Run `npm run check:client`
4. **After related edits:** Test in the browser (`npm run dev`)
5. **Before moving on:** Verify you didn't break existing functionality

### The Testing Mantra

Repeat this constantly:
- Edit → TypeCheck → Client Check → Browser Test → Repeat
- **Never make more than 2-3 changes without testing**
- **If TypeScript complains, STOP and fix it immediately**
- **If client check fails, you likely have import/export issues**

## Common Breaking Points to Watch

### 1. Audio Engine (`src/hooks/useAudioEngine.ts`)
- **FRAGILE**: The audio context and soundfont loading are delicate
- **Test after changes**: Click multiple piano keys rapidly
- **Watch for**: Silent failures, keys not playing, console errors

### 2. Music Context (`src/contexts/MusicContext.tsx`)
- **COMPLEX**: State management affects entire app
- **Test after changes**: Switch modes, change scales, test keyboard input
- **Watch for**: State not updating, infinite loops, React errors

### 3. Piano Components (`src/components/Piano*.tsx`)
- **VISUAL**: Breaking these is immediately obvious
- **Test after changes**: All keys render, click responses work, visual feedback shows
- **Watch for**: Keys not rendering, click areas misaligned, CSS breaks

## Red Flags - STOP If You See These

1. **TypeScript errors** - Never ignore, always fix immediately
2. **Console errors in browser** - Something is broken, investigate now
3. **Silent failures** - If clicking keys doesn't play sound, STOP
4. **React errors** - White screen, component errors, hooks violations
5. **Build failures** - If `npm run build` fails, the code is not shippable

## Testing Checklist

Run through this checklist frequently:

```bash
# 1. AUTOMATED: Full check (TypeScript + Client)
npm run test

# Or run individually:
npm run typecheck      # Check TypeScript types
npm run check:client   # Check for client-side errors

# 2. Dev server starts
npm run dev

# 3. In browser, test:
- [ ] Piano keys are visible
- [ ] Clicking keys plays sound
- [ ] Learn mode works (scales, progression detection)
- [ ] Build mode works (recording, playback)
- [ ] No console errors (Press F12 to check)
- [ ] Mode switching works smoothly

# 4. Production build works
npm run build
```

### Quick Test After Changes

For fastest feedback after code changes:
```bash
npm run test  # This catches most errors without opening a browser!
```

## Working with the Audio System

The audio system is particularly fragile. When working with audio:

1. **Never assume the audio context is ready** - It needs user interaction
2. **Test with different browsers** - Audio APIs vary
3. **Check the console** - Audio errors often only show there
4. **Test rapid interactions** - Click keys quickly to test concurrency

## Safe Refactoring Strategy

When refactoring or adding features:

1. **Make the smallest possible change**
2. **Test that change works**
3. **Commit if it works** (git commit)
4. **Only then make the next change**

Never refactor multiple files at once without testing between changes.

## If You Break Something

1. **Don't panic**
2. **Check git status** - See what you changed
3. **Run `npm run typecheck`** - Fix type errors first
4. **Check browser console** - Look for runtime errors
5. **Revert if needed** - `git checkout .` to start fresh
6. **Ask for help** - Describe what broke and what you were trying to do

## The Golden Rules

1. **🧪 Test more than you code**
2. **🔍 Read errors carefully - TypeScript is trying to help**
3. **🚶 Make small steps - Big changes = Big breaks**
4. **💾 Commit working states - You can always go back**
5. **🎹 Actually use the app - Click things, play with it**

## Remember

This is a musical instrument app. It needs to:
- **Respond instantly** to user input
- **Never lose audio** during interaction
- **Feel smooth and reliable**

Every change you make should maintain or improve these qualities. If something feels sluggish or broken after your change, it probably is.

## Final Words

**You are not just editing code, you are maintaining a musical instrument.**

Test everything. Trust nothing. Verify constantly.

When in doubt, run `npm run typecheck` and test in the browser.