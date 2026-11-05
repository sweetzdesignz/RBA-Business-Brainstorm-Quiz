import { Audio } from "@remotion/media";
import {
  AbsoluteFill,
  interpolate,
  Sequence,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { z } from "zod";
import { zColor } from "@remotion/zod-types";
import { Captions } from "./captions/Captions";
import { Scene3D } from "./scene/Scene3D";

// Everything here can be edited live in Remotion Studio's right-hand panel.
export const video3DSchema = z.object({
  title: z.string(),
  subtitle: z.string(),
  captionsFile: z.string().describe("JSON file in public/ (leave empty for none)"),
  voiceoverFile: z.string().describe("Audio file in public/ (leave empty for none)"),
  musicFile: z.string().describe("Audio file in public/ (leave empty for none)"),
  musicVolume: z.number().min(0).max(1),
  background: zColor(),
  primary: zColor(),
  secondary: zColor(),
  accent: zColor(),
});

export type Video3DProps = z.infer<typeof video3DSchema>;

const Title: React.FC<{ title: string; subtitle: string; color: string }> = ({
  title,
  subtitle,
  color,
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames, width, height } = useVideoConfig();
  const enter = spring({ frame, fps, config: { damping: 200 } });
  const exit = interpolate(frame, [durationInFrames - 15, durationInFrames], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const isVertical = height > width;

  return (
    <AbsoluteFill
      style={{
        justifyContent: "flex-start",
        alignItems: "center",
        paddingTop: isVertical ? height * 0.12 : height * 0.08,
        opacity: enter * exit,
        transform: `translateY(${(1 - enter) * -40}px)`,
        fontFamily: "Montserrat, 'Arial Black', Arial, sans-serif",
        textAlign: "center",
      }}
    >
      <div
        style={{
          fontSize: isVertical ? 110 : 96,
          fontWeight: 900,
          color: "white",
          letterSpacing: -2,
          textShadow: `0 0 40px ${color}`,
          padding: "0 60px",
        }}
      >
        {title}
      </div>
      <div
        style={{
          marginTop: 16,
          fontSize: isVertical ? 44 : 40,
          fontWeight: 600,
          color,
          letterSpacing: 6,
          textTransform: "uppercase",
        }}
      >
        {subtitle}
      </div>
    </AbsoluteFill>
  );
};

export const Video3D: React.FC<Video3DProps> = (props) => {
  const { durationInFrames } = useVideoConfig();
  const colors = {
    background: props.background,
    primary: props.primary,
    secondary: props.secondary,
    accent: props.accent,
  };

  return (
    <AbsoluteFill style={{ backgroundColor: props.background }}>
      {/* Layer 1: 3D animation (Three.js) */}
      <Scene3D colors={colors} />

      {/* Layer 2: text overlays */}
      <Sequence from={10} durationInFrames={durationInFrames - 10}>
        <Title title={props.title} subtitle={props.subtitle} color={props.primary} />
      </Sequence>

      {/* Layer 3: captions */}
      {props.captionsFile ? (
        <Captions file={props.captionsFile} highlight={props.accent} />
      ) : null}

      {/* Layer 4: audio */}
      {props.musicFile ? (
        <Audio
          src={staticFile(props.musicFile)}
          volume={(f) =>
            interpolate(f, [0, 20, durationInFrames - 30, durationInFrames], [0, props.musicVolume, props.musicVolume, 0], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            })
          }
        />
      ) : null}
      {props.voiceoverFile ? <Audio src={staticFile(props.voiceoverFile)} /> : null}
    </AbsoluteFill>
  );
};
