import { useThree } from "@react-three/fiber";
import { ThreeCanvas } from "@remotion/three";
import { useLayoutEffect } from "react";
import {
  AbsoluteFill,
  CalculateMetadataFunction,
  Easing,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { z } from "zod";
import { Backdrop, Divider, FrameBars, LabelPill, subtitleStyle, titleStyle, Watermark } from "./Backdrop";
import { THEMES, type Theme } from "./brand";
import { Icon3D, measureText3D, RingTunnel, Sparkles, Text3D, ThemeLights } from "./Pieces3D";
import { useBrandAssets } from "./useBrandAssets";

export const tutorialIntroSchema = z.object({
  theme: z.enum(["neon", "luxe"]),
  layout: z.enum(["side", "stacked"]).describe("side = icon left of logo, stacked = icon on top"),
  icon: z.enum(["heart", "gem", "none"]),
  logoText: z.string().describe("Big 3D words"),
  label: z.string().describe("Pill label (empty = none)"),
  title: z.string().describe("Flat title under the logo (empty = none)"),
  subtitle: z.string().describe("Small line under the title (empty = none)"),
  watermark: z.string().describe("Corner text (empty = none)"),
  durationInSeconds: z.number().min(3).max(60).describe("Match this to your audio"),
});
type Props = z.infer<typeof tutorialIntroSchema>;

export const introMetadata: CalculateMetadataFunction<Props> = ({ props }) => ({
  durationInFrames: Math.round(props.durationInSeconds * 30),
});

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// Camera flies through the rings, settles, then drifts gently for the rest of the card.
const IntroCamera: React.FC<{ stacked: boolean }> = ({ stacked }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const camera = useThree((s) => s.camera);
  const fly = interpolate(frame, [0, 55], [62, 11], { ...clamp, easing: Easing.bezier(0.2, 0.7, 0.2, 1) });
  const drift = interpolate(frame, [55, durationInFrames], [0, 0.5], clamp);
  const push = interpolate(frame, [durationInFrames - 20, durationInFrames], [0, 4], {
    ...clamp,
    easing: Easing.in(Easing.cubic),
  });
  const endY = stacked ? 0 : 0.6;
  const y = interpolate(frame, [0, 55], [1.5, endY], clamp);
  const lookY = stacked ? 0 : 0.4;
  useLayoutEffect(() => {
    camera.position.set(Math.sin(frame * 0.01) * 0.3, y, fly - drift - push);
    camera.lookAt(0, lookY, 0);
  }, [camera, frame, y, fly, drift, push, lookY]);
  return null;
};

const Logo3D: React.FC<{ p: Props; theme: Theme; font: NonNullable<ReturnType<typeof useBrandAssets>> }> = ({
  p,
  theme,
  font,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const iconIn = spring({ frame: frame - 28, fps, config: { damping: 13 } });
  const spin = (1 - iconIn) * Math.PI * 4 + Math.sin(frame * 0.05) * 0.25 + (p.icon === "gem" ? frame * 0.02 : 0);
  const hasIcon = p.icon !== "none";

  if (p.layout === "stacked") {
    const size = Math.min(1.3, 13 / Math.max(measureText3D(font, p.logoText, 1), 0.01));
    return (
      <>
        <Icon3D icon={p.icon} theme={theme} position={[0, 3.0, 0]} scale={iconIn * 0.55} rotationY={spin} />
        <Text3D font={font} theme={theme} text={p.logoText} size={size} startFrame={hasIcon ? 38 : 20} stagger={2} position={[0, 0.25, 0]} />
      </>
    );
  }
  const maxW = hasIcon ? 8.5 : 10;
  const size = Math.min(1.2, maxW / Math.max(measureText3D(font, p.logoText, 1), 0.01));
  const textW = measureText3D(font, p.logoText, size);
  const iconW = hasIcon ? 2.8 : 0;
  const left = -(textW + iconW) / 2;
  return (
    <group position={[0, 1.1, 0]}>
      <Icon3D icon={p.icon} theme={theme} position={[left + 0.9, 0.05, 0]} scale={iconIn * 0.95} rotationY={spin} />
      <Text3D font={font} theme={theme} text={p.logoText} size={size} startFrame={hasIcon ? 38 : 20} position={[left + iconW + textW / 2, 0, 0]} />
    </group>
  );
};

export const TutorialIntro: React.FC<Props> = (p) => {
  const theme = THEMES[p.theme];
  const frame = useCurrentFrame();
  const { fps, width, height, durationInFrames } = useVideoConfig();
  const font3d = useBrandAssets(theme.font3d);
  const stacked = p.layout === "stacked";

  const labelIn = spring({ frame: frame - (stacked ? 50 : 72), fps, config: { damping: 200 } });
  const titleIn = spring({ frame: frame - 80, fps, config: { damping: 200 } });
  const dividerIn = spring({ frame: frame - 70, fps, config: { damping: 200 }, durationInFrames: 25 });
  const subIn = spring({ frame: frame - 88, fps, config: { damping: 200 } });
  // Shine sweeps across once on arrival, then again every 4 seconds.
  const cycle = Math.max(0, frame - 92) % 120;
  const sweep = interpolate(cycle, [0, 28], [-30, 130], clamp);
  const fadeOut = interpolate(frame, [durationInFrames - 10, durationInFrames], [1, 0], clamp);
  const fadeIn = interpolate(frame, [0, 6], [0, 1], clamp);

  return (
    <AbsoluteFill style={{ opacity: Math.min(fadeIn, fadeOut) }}>
      <Backdrop theme={theme} />
      <ThreeCanvas width={width} height={height} camera={{ fov: 45 }}>
        <ThemeLights theme={theme} />
        <IntroCamera stacked={stacked} />
        {/* Stacked layout: camera flies all the way through the rings so the title sits on a clean background. */}
        <group position={[0, 0, stacked ? 58 : 12]}>
          <RingTunnel theme={theme} count={12} spacing={4} />
        </group>
        <Sparkles color={theme.sparkle} />
        {font3d ? <Logo3D p={p} theme={theme} font={font3d} /> : null}
      </ThreeCanvas>

      <AbsoluteFill
        style={{
          background: `linear-gradient(105deg, transparent ${sweep - 8}%, rgba(255,240,210,0.18) ${sweep}%, transparent ${sweep + 8}%)`,
          mixBlendMode: "screen",
        }}
      />

      {stacked ? (
        <>
          {p.label ? (
            <AbsoluteFill style={{ alignItems: "center", top: height * 0.275 }}>
              <LabelPill text={p.label} theme={theme} style={{ opacity: labelIn, transform: `translateY(${(1 - labelIn) * 20}px)` }} />
            </AbsoluteFill>
          ) : null}
          <AbsoluteFill style={{ alignItems: "center", top: height * 0.565, textAlign: "center" }}>
            {theme.name === "luxe" ? <Divider theme={theme} progress={dividerIn} /> : null}
            {p.subtitle ? (
              <div style={{ ...subtitleStyle(theme, 46), marginTop: 34, opacity: subIn, transform: `translateY(${(1 - subIn) * 16}px)` }}>
                {p.subtitle}
              </div>
            ) : null}
            {p.title ? (
              <div style={{ ...titleStyle(theme, 54), marginTop: 24, maxWidth: width * 0.8, opacity: titleIn }}>{p.title}</div>
            ) : null}
          </AbsoluteFill>
        </>
      ) : (
        <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "center", paddingBottom: height * 0.15, textAlign: "center" }}>
          {p.label ? (
            <LabelPill text={p.label} theme={theme} style={{ opacity: labelIn, transform: `translateY(${(1 - labelIn) * 30}px)` }} />
          ) : null}
          {p.title ? (
            <div style={{ ...titleStyle(theme, 76), marginTop: 26, maxWidth: width * 0.8, opacity: titleIn, transform: `translateY(${(1 - titleIn) * 40}px)` }}>
              {p.title}
            </div>
          ) : null}
          {p.subtitle ? <div style={{ ...subtitleStyle(theme, 40), marginTop: 18, opacity: subIn }}>{p.subtitle}</div> : null}
        </AbsoluteFill>
      )}
      <FrameBars theme={theme} />
      <Watermark text={p.watermark} theme={theme} opacity={interpolate(frame, [60, 80], [0, 0.85], clamp)} />
    </AbsoluteFill>
  );
};
