import { Composition } from "remotion";
import { TutorialIntro, tutorialIntroSchema } from "./cards/TutorialIntro";
import { TutorialOutro, tutorialOutroSchema } from "./cards/TutorialOutro";
import { Video3D, video3DSchema, type Video3DProps } from "./Video3D";

const defaults: Video3DProps = {
  title: "Build Your Business",
  subtitle: "Brainstorm • Plan • Launch",
  captionsFile: "captions/demo.json",
  voiceoverFile: "",
  musicFile: "audio/demo-music.mp3",
  musicVolume: 1,
  background: "#0b0614",
  primary: "#ff2d95",
  secondary: "#8b5cf6",
  accent: "#22d3ee",
};

export const RemotionRoot: React.FC = () => {
  return (
    <>
      {/* Vertical: Reels / TikTok / Shorts */}
      <Composition
        id="Video3D-Vertical"
        component={Video3D}
        schema={video3DSchema}
        defaultProps={defaults}
        durationInFrames={300}
        fps={30}
        width={1080}
        height={1920}
      />
      {/* Horizontal: YouTube */}
      <Composition
        id="Video3D-Wide"
        component={Video3D}
        schema={video3DSchema}
        defaultProps={defaults}
        durationInFrames={300}
        fps={30}
        width={1920}
        height={1080}
      />
      {/* 3D intro card for HyperFrames tutorials (5 seconds) */}
      <Composition
        id="Tutorial-Intro"
        component={TutorialIntro}
        schema={tutorialIntroSchema}
        defaultProps={{
          label: "HYPERFRAMES TUTORIAL",
          title: "Animated Captions in 5 Minutes",
        }}
        durationInFrames={150}
        fps={30}
        width={1920}
        height={1080}
      />
      {/* 3D outro card (6 seconds) */}
      <Composition
        id="Tutorial-Outro"
        component={TutorialOutro}
        schema={tutorialOutroSchema}
        defaultProps={{
          headline: "THANKS FOR WATCHING",
          ctas: ["👍 LIKE", "🔔 SUBSCRIBE", "💗 JOIN SDHQ"],
          nextUp: "3D Logo Reveals with Three.js",
        }}
        durationInFrames={180}
        fps={30}
        width={1920}
        height={1080}
      />
    </>
  );
};
