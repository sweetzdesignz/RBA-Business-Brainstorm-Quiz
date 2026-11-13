import { Composition } from "remotion";
import { introMetadata, TutorialIntro, tutorialIntroSchema } from "./cards/TutorialIntro";
import { outroMetadata, TutorialOutro, tutorialOutroSchema } from "./cards/TutorialOutro";
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
      {/* 3D intro / outro cards. Props (theme, text, length) are editable in Studio. */}
      <Composition
        id="Tutorial-Intro"
        component={TutorialIntro}
        schema={tutorialIntroSchema}
        calculateMetadata={introMetadata}
        defaultProps={{
          theme: "neon" as const,
          layout: "side" as const,
          icon: "heart" as const,
          logoText: "YOUR BRAND",
          label: "TUTORIAL",
          title: "Your Episode Title Here",
          subtitle: "",
          watermark: "",
          durationInSeconds: 5,
        }}
        durationInFrames={150}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="Tutorial-Outro"
        component={TutorialOutro}
        schema={tutorialOutroSchema}
        calculateMetadata={outroMetadata}
        defaultProps={{
          theme: "neon" as const,
          icon: "heart" as const,
          label: "",
          headline: "THANKS FOR WATCHING",
          subtitle: "",
          ctas: ["👍 LIKE", "🔔 SUBSCRIBE", "⭐ JOIN NOW"],
          nextUp: "Your Next Episode",
          watermark: "",
          durationInSeconds: 6,
        }}
        durationInFrames={180}
        fps={30}
        width={1920}
        height={1080}
      />
      {/* Luxe look: black + plum, metallic gold serif, magenta gem */}
      <Composition
        id="Luxe-Intro"
        component={TutorialIntro}
        schema={tutorialIntroSchema}
        calculateMetadata={introMetadata}
        defaultProps={{
          theme: "luxe" as const,
          layout: "stacked" as const,
          icon: "gem" as const,
          logoText: "Your Lesson Title",
          label: "CLASSROOM",
          title: "",
          subtitle: "Your subtitle goes here",
          watermark: "",
          durationInSeconds: 5,
        }}
        durationInFrames={150}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="Luxe-Outro"
        component={TutorialOutro}
        schema={tutorialOutroSchema}
        calculateMetadata={outroMetadata}
        defaultProps={{
          theme: "luxe" as const,
          icon: "heart" as const,
          label: "SO PROUD OF YOU",
          headline: "Post Your Result",
          subtitle: "in the community",
          ctas: [],
          nextUp: "",
          watermark: "",
          durationInSeconds: 5,
        }}
        durationInFrames={150}
        fps={30}
        width={1920}
        height={1080}
      />
    </>
  );
};
