import { useThree } from "@react-three/fiber";
import { ThreeCanvas } from "@remotion/three";
import { useLayoutEffect } from "react";
import {
  AbsoluteFill,
  CalculateMetadataFunction,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { z } from "zod";
import { Backdrop, FrameBars, LabelPill, subtitleStyle, Watermark } from "./Backdrop";
import { THEMES, type Theme } from "./brand";
import { Icon3D, measureText3D, Sparkles, Text3D, ThemeLights } from "./Pieces3D";
import { useBrandAssets } from "./useBrandAssets";

export const tutorialOutroSchema = z.object({
  theme: z.enum(["neon", "luxe"]),
  icon: z.enum(["heart", "gem", "none"]),
  label: z.string().describe("Filled pill above the headline (empty = none)"),
  headline: z.string().describe("Big 3D words"),
  subtitle: z.string().describe("Line under the headline (empty = none)"),
  ctas: z.array(z.string()).describe("Buttons (empty list = none)"),
  nextUp: z.string().describe("Next video (empty = none)"),
  watermark: z.string().describe("Corner text (empty = none)"),
  durationInSeconds: z.number().min(3).max(60).describe("Match this to your audio"),
});
type Props = z.infer<typeof tutorialOutroSchema>;

export const outroMetadata: CalculateMetadataFunction<Props> = ({ props }) => ({
  durationInFrames: Math.round(props.durationInSeconds * 30),
});

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

const OutroCamera: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const camera = useThree((s) => s.camera);
  const z = interpolate(frame, [0, durationInFrames], [10.2, 11.4]);
  useLayoutEffect(() => {
    camera.position.set(Math.sin(frame * 0.012) * 0.4, 0.3, z);
    camera.lookAt(0, 0.3, 0);
  }, [camera, frame, z]);
  return null;
};

const OrbitIcons: React.FC<{ theme: Theme; icon: "heart" | "gem"; count?: number; radius?: number }> = ({
  theme,
  icon,
  count = 8,
  radius = 2.2,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <group rotation={[0.3, 0, 0]}>
      {new Array(count).fill(0).map((_, i) => {
        const a = (i / count) * Math.PI * 2 + frame * 0.025;
        const pop = spring({ frame: frame - 10 - i * 2, fps, config: { damping: 12 } });
        return (
          <Icon3D
            key={i}
            icon={icon}
            theme={theme}
            position={[Math.cos(a) * radius, Math.sin(a * 2) * 0.15, Math.sin(a) * radius]}
            scale={pop * (icon === "gem" ? 0.14 : 0.22)}
            rotationY={frame * 0.06 + i}
            color={theme.orbitColors[i % 2]}
          />
        );
      })}
    </group>
  );
};

export const TutorialOutro: React.FC<Props> = (p) => {
  const theme = THEMES[p.theme];
  const luxe = theme.name === "luxe";
  const frame = useCurrentFrame();
  const { fps, width, height, durationInFrames } = useVideoConfig();
  const font3d = useBrandAssets(theme.font3d);

  const iconIn = spring({ frame, fps, config: { damping: 12 } });
  const beat = 1 + Math.max(0, Math.sin(frame * 0.25)) ** 8 * 0.08; // heartbeat pulse
  const labelIn = spring({ frame: frame - 8, fps, config: { damping: 14 } });
  const subIn = spring({ frame: frame - 30, fps, config: { damping: 200 } });
  const nextIn = spring({ frame: frame - 110, fps, config: { damping: 200 } });
  const fadeOut = interpolate(frame, [durationInFrames - 12, durationInFrames], [1, 0], clamp);
  const fadeIn = interpolate(frame, [0, 8], [0, 1], clamp);
  const hasButtons = p.ctas.length > 0;
  const size = font3d ? Math.min(luxe ? 1.15 : 0.68, 12 / Math.max(measureText3D(font3d, p.headline, 1), 0.01)) : 1;

  // Luxe: icon on top, pill, 3D headline, subtitle (like a classic end card).
  // Neon: 3D headline on top, big icon with orbiting icons, buttons below.
  const iconY = luxe ? 3.3 : 0.5;
  const headlineY = luxe ? 0.0 : 2.6;

  return (
    <AbsoluteFill style={{ opacity: Math.min(fadeIn, fadeOut) }}>
      <Backdrop theme={theme} />
      <ThreeCanvas width={width} height={height} camera={{ fov: 45 }}>
        <ThemeLights theme={theme} />
        <OutroCamera />
        <Sparkles color={theme.sparkle} count={300} />
        {font3d ? (
          <Text3D font={font3d} theme={theme} text={p.headline} size={size} startFrame={6} stagger={2} position={[0, headlineY, 0]} />
        ) : null}
        {p.icon !== "none" ? (
          <group position={[0, iconY, 0]}>
            <Icon3D
              icon={p.icon}
              theme={theme}
              scale={iconIn * (luxe ? 0.5 : 1.15) * beat}
              rotationY={frame * 0.03}
              color={luxe && p.icon === "heart" ? theme.text3d.color : undefined}
            />
            <OrbitIcons theme={theme} icon={luxe ? "gem" : p.icon} count={luxe ? 6 : 8} radius={luxe ? 1.1 : 3.4} />
          </group>
        ) : null}
      </ThreeCanvas>

      {p.label ? (
        <AbsoluteFill style={{ alignItems: "center", top: luxe ? height * 0.28 : height * 0.06 }}>
          <LabelPill text={p.label} theme={theme} filled style={{ transform: `scale(${labelIn})`, fontSize: 24 }} />
        </AbsoluteFill>
      ) : null}

      <AbsoluteFill
        style={{
          justifyContent: luxe ? "flex-start" : "flex-end",
          alignItems: "center",
          paddingTop: luxe ? height * 0.655 : 0,
          paddingBottom: luxe ? 0 : height * 0.17,
          textAlign: "center",
        }}
      >
        {p.subtitle ? (
          <div style={{ ...subtitleStyle(theme, 44), opacity: subIn, transform: `translateY(${(1 - subIn) * 16}px)`, marginBottom: hasButtons ? 30 : 0 }}>
            {p.subtitle}
          </div>
        ) : null}
        {hasButtons ? (
          <div style={{ display: "flex", gap: 28, marginTop: luxe ? 40 : 0 }}>
            {p.ctas.map((cta, i) => {
              const s = spring({ frame: frame - 45 - i * 10, fps, config: { damping: 12 } });
              const last = i === p.ctas.length - 1;
              return (
                <div
                  key={cta}
                  style={{
                    transform: `scale(${s}) translateY(${(1 - s) * 40}px)`,
                    padding: "18px 36px",
                    borderRadius: 999,
                    background: last ? theme.accent : "rgba(255,255,255,0.06)",
                    border: `3px solid ${last ? theme.accent : luxe ? "#e3b862" : theme.accent}`,
                    boxShadow: `0 0 28px ${theme.accent}55`,
                    color: last || !luxe ? "#fff" : "#f3e6c8",
                    fontFamily: theme.labelFont,
                    fontSize: 34,
                    fontWeight: luxe ? 600 : 900,
                    letterSpacing: luxe ? 4 : 2,
                  }}
                >
                  {cta}
                </div>
              );
            })}
          </div>
        ) : null}
        {p.nextUp ? (
          <div
            style={{
              marginTop: 30,
              opacity: nextIn,
              fontFamily: theme.labelFont,
              color: luxe ? "#f3e6c8" : "#fff",
              fontSize: 34,
              fontWeight: luxe ? 600 : 900,
              letterSpacing: 3,
              maxWidth: width * 0.8,
            }}
          >
            <span style={{ color: theme.subtitleColor }}>NEXT UP → </span>
            {p.nextUp}
          </div>
        ) : null}
      </AbsoluteFill>
      <FrameBars theme={theme} />
      <Watermark text={p.watermark} theme={theme} />
    </AbsoluteFill>
  );
};
