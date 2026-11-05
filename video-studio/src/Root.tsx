import { Composition } from "remotion";
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
    </>
  );
};
