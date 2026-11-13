---
name: sweetz-3d-video
description: Make or update Sweetz's 3D animated videos with Three.js + Remotion — the 3D tutorial intro/outro cards (neon ring fly-through, 3D 💗 heart, 3D SWEETZ letters, THANKS FOR WATCHING outro with LIKE / SUBSCRIBE / JOIN SDHQ buttons) and 3D promo videos with captions, voiceover and music. Use for "make a 3D intro for my tutorial", "update my outro", "change the episode title", "3D video", "3D logo reveal", or rendering any of these to MP4.
---

# Sweetz 3D Video Studio (Three.js + Remotion)

All the code lives in the `video-studio/` folder of the GitHub repo
`sweetzdesignz/RBA-Business-Brainstorm-Quiz` (branch `claude/3d-videos-threejs-remotion-celifa`
until it is merged or moved to its own repo). Clone it, `cd video-studio`, run `npm install`.
Needs Node.js 22+. If the general Remotion skill is available, follow its rules too.

## What's in the project

| Video (composition id) | What it is | Size / length |
| --- | --- | --- |
| `Tutorial-Intro` | Neon ring fly-through → 3D 💗 heart spins in → 3D "SWEETZ" letters pop up → label pill + episode title | 1920×1080, 5s |
| `Tutorial-Outro` | 3D "THANKS FOR WATCHING", beating heart with orbiting hearts, CTA buttons, "NEXT UP →" line | 1920×1080, 6s |
| `Video3D-Vertical` / `Video3D-Wide` | 3D promo: spinning knot + orbiting spheres, title, word-by-word captions, music/voiceover | 1080×1920 / 1920×1080, 10s |

Files:
- `src/Root.tsx` — every composition, its default text, size and length (30 frames = 1 second).
- `src/cards/TutorialIntro.tsx`, `src/cards/TutorialOutro.tsx` — the cards.
- `src/cards/Pieces3D.tsx` — reusable 3D parts: `Heart`, `Text3D` (letters pop in), `RingTunnel`, `Sparkles`.
- `src/cards/brand.ts` — brand colors (pink `#ff2d95`, hot pink `#ff5cb8`, purple `#8b5cf6`, cyan `#22d3ee`, deep bg `#0a0412`).
- `src/cards/Backdrop.tsx` — neon backdrop + 💗SWEETZ watermark (bottom right).
- `src/Video3D.tsx`, `src/scene/Scene3D.tsx`, `src/captions/Captions.tsx` — the promo video.
- `public/fonts/` — Montserrat Black (web font + `.typeface.json` 3D version).
- `public/audio/`, `public/captions/` — audio files and caption JSON.

## Common jobs

**New tutorial episode** — change `title` (and `label` if it isn't a HyperFrames tutorial) in the
`Tutorial-Intro` defaultProps in `src/Root.tsx`, and `nextUp` in `Tutorial-Outro`. Or pass props
at render time:
```bash
npx remotion render Tutorial-Intro out/intro.mp4 --props='{"label":"HYPERFRAMES TUTORIAL","title":"Your Episode Title"}'
npx remotion render Tutorial-Outro out/outro.mp4 --props='{"headline":"THANKS FOR WATCHING","ctas":["👍 LIKE","🔔 SUBSCRIBE","💗 JOIN SDHQ"],"nextUp":"Next Episode Title"}'
```
Keep titles short (about 40 characters max) so they fit on one or two lines.
Keep the 3D headline under about 20 characters, or lower its `size` in `TutorialOutro.tsx`.

**Join with a tutorial** — render intro and outro, then put them before and after the
tutorial MP4 (ffmpeg concat, or her normal editor). Match 1920×1080, 30fps.

**Promo video with voiceover** — put the voiceover in `public/audio/`, run
`npm run captions -- public/audio/voiceover.mp3` (makes `public/captions/voiceover.json`),
set `voiceoverFile` / `captionsFile` props, set `durationInFrames` to the voiceover length.

**Different font for 3D text** — `npm run font3d -- public/fonts/YourFont.ttf`, then point
`useBrandAssets.ts` at the new files.

**Preview** — `npm run dev` opens Remotion Studio; text and colors are editable in the side panel.

## Rules for 3D (renders flicker or break otherwise)

- Animate only from `useCurrentFrame()` (with `spring` / `interpolate`). Never use `useFrame()`
  from React Three Fiber, or self-animating drei helpers (`<Float>`, `autoRotate`).
- Move the camera inside `useLayoutEffect` (not `useEffect`), as the existing camera rigs do,
  or rendered frames lag one step behind.
- 3D content goes inside `<ThreeCanvas width={width} height={height}>` with lights.
  Any `<Sequence>` inside it needs `layout="none"`.
- Random positions must be fixed (seeded math), never `Math.random()`.

## Rendering

`remotion.config.ts` uses the `angle` OpenGL renderer (best on a normal PC).
On a server with no GPU, add `--gl=swangle`. If the browser can't be downloaded,
pass `--browser-executable=<path to Chrome/Chromium>`.
Before handing over a video, render a few stills (`npx remotion still <id> out/x.png --frame=N`)
and check the text fits and nothing is cut off.

## Brand rules

Pink/purple neon on a deep purple-black background, Montserrat Black for text, 💗SWEETZ
watermark bottom right on every card. Remotion is free for teams of up to 3 people.
