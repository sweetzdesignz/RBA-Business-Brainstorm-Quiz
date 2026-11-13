---
name: neon-3d-video
description: Make 3D animated videos in a neon 3D style with Three.js + Remotion — 3D tutorial intro/outro cards (camera flies through glowing neon rings, glossy 3D icon spins in, chunky 3D letters pop up one by one, title pill slides in; outro with 3D "THANKS FOR WATCHING", beating icon with orbiting mini icons, bouncing call-to-action buttons) and 3D promo videos with word-by-word captions, voiceover and music. Works for ANY brand: logo word, colors, buttons and watermark are settings. Use for "3D intro", "3D outro", "3D logo reveal", "neon 3D video", or rendering these to MP4.
---

# Neon 3D Video Style (Three.js + Remotion)

The project is the `video-studio/` folder of the GitHub repo
`sweetzdesignz/RBA-Business-Brainstorm-Quiz` (branch `claude/3d-videos-threejs-remotion-celifa`).
Clone it, `cd video-studio`, run `npm install`. Needs Node.js 22+.
If a general Remotion skill is available, follow its rules too.

## Use the style, not a fixed brand

Nothing is tied to one brand. For each video, ask (or use what the user gave you):
- **Logo word** for the 3D text (`logoText`) — the brand, show or channel name.
- **Icon** — the 3D heart (`showHeart: true`) or none. To use another icon, add a shape next
  to `Heart` in `src/cards/Pieces3D.tsx` (an extruded `THREE.Shape`, or load a `.glb` model).
- **Colors** — edit `src/cards/brand.ts` (default: neon pink `#ff2d95`, purple `#8b5cf6`,
  cyan `#22d3ee` on deep purple-black `#0a0412`). Keep strong contrast and a dark background.
- **Buttons** (`ctas`), **next up** text, **watermark** (empty = none).
- **Font** — default Montserrat Black. For another font: put the file in `public/fonts/`,
  run `npm run font3d -- public/fonts/Font.ttf`, and point `src/cards/useBrandAssets.ts` at it.

Never add a specific person's or company's name, logo or watermark unless the user asks for it.

## The style, so new videos match

- Deep purple-black radial-gradient backdrop with floating sparkle dots.
- Glossy, slightly metallic 3D objects lit by a white key light plus colored pink and purple
  point lights.
- Motion is springy: things pop in with a little overshoot, and letters arrive one after another.
- The camera is always gently moving (fly-through, slow orbit or push-in). It is never static.
- Flat text sits on top: a neon outlined pill label, a bold title with a soft glow, and a
  light shine that sweeps across.
- Thick, bold, all-caps type.

## What's in the project

| Composition id | What it is | Size / length |
| --- | --- | --- |
| `Tutorial-Intro` | Ring fly-through → icon spins in → 3D logo word → label pill + title | 1920×1080, 5s |
| `Tutorial-Outro` | 3D headline, beating icon + orbiting icons, CTA buttons, NEXT UP line | 1920×1080, 6s |
| `Video3D-Vertical` / `Video3D-Wide` | 3D promo with title, captions, music/voiceover | 1080×1920 / 1920×1080, 10s |

Key files: `src/Root.tsx` (default text, sizes, lengths; 30 frames = 1 second),
`src/cards/TutorialIntro.tsx`, `src/cards/TutorialOutro.tsx`, `src/cards/Pieces3D.tsx`
(`Heart`, `Text3D`, `measureText3D`, `RingTunnel`, `Sparkles`), `src/cards/brand.ts`,
`src/cards/Backdrop.tsx`, `src/Video3D.tsx`, `src/captions/Captions.tsx`.

## Common jobs

```bash
npx remotion render Tutorial-Intro out/intro.mp4 --props='{"logoText":"CREATOR ACADEMY","showHeart":true,"label":"TUTORIAL","title":"Your Episode Title","watermark":""}'
npx remotion render Tutorial-Outro out/outro.mp4 --props='{"headline":"THANKS FOR WATCHING","ctas":["👍 LIKE","🔔 SUBSCRIBE","⭐ JOIN NOW"],"nextUp":"Next Episode Title","watermark":""}'
```
- The logo word shrinks itself to fit. Keep titles to about 40 characters, and keep the outro
  headline under about 20 characters (or lower its `size` in `TutorialOutro.tsx`).
- To join the cards with a tutorial, put intro + tutorial + outro together (ffmpeg concat or any
  editor) at 1920×1080, 30fps.
- For a promo with voiceover, add the audio to `public/audio/`, run
  `npm run captions -- public/audio/voiceover.mp3`, then set the `voiceoverFile`, `captionsFile`
  and `durationInFrames` props.
- To preview, run `npm run dev` (Remotion Studio). Text and colors can be edited in the side panel.

## 3D rules (renders flicker or break otherwise)

- Animate only from `useCurrentFrame()` (with `spring` / `interpolate`). Never use React Three
  Fiber's `useFrame()` or self-animating drei helpers (`<Float>`, `autoRotate`).
- Move the camera in `useLayoutEffect` (not `useEffect`), like the existing camera rigs.
- 3D goes inside `<ThreeCanvas width={width} height={height}>` with lights. A `<Sequence>`
  inside it needs `layout="none"`.
- Random positions must use fixed seeded math, never `Math.random()`.

## Rendering & checking

`remotion.config.ts` uses the `angle` OpenGL renderer. On a machine with no GPU, add
`--gl=swangle`. Before delivering, render stills (`npx remotion still <id> out/x.png --frame=N`)
at a few points and check that text fits and nothing is cut off.
Remotion is free for individuals and teams of up to 3 people.
