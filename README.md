# Theory Tool

An interactive music theory learning tool that visualizes chord relationships within any key. Built for musicians who want to understand *why* certain chords work together.

<p align="center">
  <img src="docs/hero.png" alt="Theory Tool Screenshot" width="800" />
</p>

## What It Does

**Select any key and scale** → instantly see all seven diatonic chords with their roman numeral analysis, plus borrowed chords from parallel modes.

- **Click any chord** to hear it played with realistic piano samples
- **Explore variations** — add 7ths, 9ths, sus chords, or alterations with one click
- **Visualize the piano** — see exactly which notes make up each chord
- **Learn scale degrees** — the piano shows roman numerals and intervals

<p align="center">
  <img src="docs/tool-demo.gif" alt="Theory Tool Demo" width="800" />
</p>

## Features

### Diatonic Chord Display
All seven chords in a key shown simultaneously. Each chord displays:
- Roman numeral by scale degree
  - **major**: I, ii, iii, IV, V, vi, vii°
  - **minor**: i, ii°, III, iv, v, VI, VII
- Chord name
  - **C major**: C, Dm, Em, F, G, Am, B°
  - **A minor**: Am, B°, C, Dm, Em, F, G
- Mini keyboard preview showing the chord shape

### Chord Variations
Click any chord to reveal 12 different modifications:
- **Extensions**: 7, maj7, 6, 9, maj9, 11, 13
- **Alterations**: sus2, sus4, add9, dim, aug

### Borrowed Chords
Toggle "Borrowed" to see chords from parallel modes:
- **In major keys**: iv, ♭VI, ♭VII, ♭III (borrowed from parallel minor)
- **In minor keys**: IV, VI, VII, III (borrowed from parallel major)

### Interactive Piano
- Responsive piano keyboard (adapts to screen size, typically 2 octaves)
- **Scale highlighting** shows all notes in the current scale
- **Chord highlighting** shows the selected chord's notes in orange
- Scale degree labels show roman numerals and note names

## Tech Stack

- **React 19** with TypeScript
- **Web Audio API** via soundfont-player for realistic piano samples
- **Vite** for fast development and optimized builds
- **CSS** — no UI framework, hand-crafted styling

## Why I Built This

As an amateur music producer and songwriter, I found myself constantly referencing chord charts to understand what notes made up different chord voicings. Most apps either:

1. Show you chords in isolation (great for lookup, bad for understanding *context*)
2. Focus on sheet music notation (assumes you already read music fluently)

I wanted a free app that showed the **relationship between chords in a key** and could act as a **quick learning reference** for myself. Furthermore, I wanted a tool that could help me write songs without navigating between too many different resources/tools.

This tool sits in that gap: visual enough to understand at a glance, interactive enough to explore and experiment, and practical enough to reference mid-songwriting session.

It's optimized for my own personal use on an iPad/tablet, but should work on any device.

## Local Development

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

## Building for Production

```bash
npm run build
npm run preview
```

## Project Structure

```
src/
├── components/          # React components
│   ├── Piano.tsx        # Interactive piano keyboard
│   ├── ConfigBar.tsx    # Key/scale selection controls
│   ├── ChordStrip.tsx   # Horizontal chord display
│   ├── ChordTab.tsx     # Individual chord cards
│   ├── ChordInfoBlock.tsx # Variation panel
│   └── ...
├── hooks/
│   ├── useAudioEngine.ts    # Web Audio + soundfont loading
│   ├── useMusic.ts          # Music state management
│   └── ...
├── utils/
│   └── musicTheory.ts       # Scale/chord calculation logic
└── contexts/
    └── MusicContext.tsx     # Global state provider
```

## License

MIT

---

Built by [Cameron Brown](https://camsb.dev) • [GitHub](https://github.com/cameronsb)
