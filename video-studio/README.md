# Video Studio — 3D videos with Three.js + Remotion

- **Three.js** (through React Three Fiber) makes the 3D animation.
- **Remotion** adds titles, captions, music/voiceover, and renders the MP4.

## One-time setup (on your computer)

You need **Node.js 22+** (nodejs.org) and **ffmpeg** (only for auto-captions).

```bash
cd video-studio
npm install
```

## Everyday use

| What | Command |
| --- | --- |
| Preview + edit live in the browser | `npm run dev` (opens Remotion Studio at http://localhost:3000) |
| Render vertical (Reels/TikTok/Shorts, 1080×1920) | `npm run render:vertical` → `out/video-vertical.mp4` |
| Render wide (YouTube, 1920×1080) | `npm run render:wide` → `out/video-wide.mp4` |
| Render tutorial intro card | `npx remotion render Tutorial-Intro out/intro.mp4` |
| Render tutorial outro card | `npx remotion render Tutorial-Outro out/outro.mp4` |
| Make captions from a voiceover | `npm run captions -- public/audio/voiceover.mp3` |

In Studio, the right-hand panel lets you change the title, colors, caption file,
music and voiceover without touching code.

## Making a new video

1. Put your voiceover in `public/audio/` (e.g. `voiceover.mp3`).
2. Run `npm run captions -- public/audio/voiceover.mp3`.
   This creates `public/captions/voiceover.json` with word-by-word timing
   (first run downloads Whisper speech-to-text, so it takes a few minutes).
3. In Studio set **voiceoverFile** = `audio/voiceover.mp3` and
   **captionsFile** = `captions/voiceover.json`.
4. Change the video length in `src/Root.tsx` (`durationInFrames` — 30 frames = 1 second).
5. Render.

Already have an ElevenLabs voiceover? Same steps — just drop the MP3 in `public/audio/`.

## 3D tutorial intro & outro cards

- **Tutorial-Intro** (5s): camera flies through neon rings, a 3D heart spins in, and your
  logo word pops up in 3D letters, followed by the episode label and title.
- **Tutorial-Outro** (6s): 3D "THANKS FOR WATCHING", a beating heart with orbiting hearts,
  call-to-action buttons and a "Next up" line.

Change the logo word, title, buttons, "next up" text and watermark in Studio's right-hand panel. Brand colors
are in `src/cards/brand.ts`. Put the rendered MP4s before and after your HyperFrames
tutorial in your final edit.

**Using your own font for 3D text:** put the font file in `public/fonts/`, then run
`npm run font3d -- public/fonts/YourFont.ttf`.

## Where things live

```
src/Root.tsx             Video sizes, length, default settings
src/Video3D.tsx          Layers: 3D scene → title → captions → audio
src/scene/Scene3D.tsx    The Three.js scene (camera, lights, objects)
src/captions/Captions.tsx  TikTok-style word-highlight captions
public/audio/            Music + voiceovers (demo-music.mp3 is a placeholder)
public/captions/         Caption JSON files (demo.json is hand-timed sample)
src/cards/                3D tutorial intro/outro cards
public/fonts/            Montserrat Black (web font + 3D version)
scripts/transcribe.mjs   Voiceover → captions (Whisper)
scripts/make-3d-font.mjs Font file → 3D text font
```

## 3D rules (so renders don't flicker)

- Animate **only** with `useCurrentFrame()` (e.g. `rotation={[0, frame * 0.02, 0]}`).
- Do **not** use `useFrame()` from React Three Fiber, or self-animating drei helpers
  like `<Float>` / `autoRotate`.
- Any `<Sequence>` inside the 3D canvas needs `layout="none"`.
- To use your own 3D model: put a `.glb` file in `public/models/` and load it with
  `useGLTF(staticFile("models/your-model.glb"))` from `@react-three/drei`.

## Rendering troubleshooting

`remotion.config.ts` sets the OpenGL renderer to `angle`, which is best on most
computers. If you get "Error creating WebGL context" (e.g. a server with no GPU),
render with `--gl=swangle` instead.

## License note

Remotion is free for individuals and companies of up to 3 people. Bigger teams need
a company license: https://remotion.dev/license
