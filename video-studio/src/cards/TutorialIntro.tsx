import { useThree } from "@react-three/fiber";
import { ThreeCanvas } from "@remotion/three";
import { useLayoutEffect } from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { z } from "zod";
import { Backdrop, Watermark } from "./Backdrop";
import { BRAND } from "./brand";
import { Heart, RingTunnel, Sparkles, Text3D } from "./Pieces3D";
import { useBrandAssets } from "./useBrandAssets";

export const tutorialIntroSchema = z.object({
  label: z.string(),
  title: z.string(),
});

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// Camera flies through the neon rings, then settles on the logo.
const IntroCamera: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const camera = useThree((s) => s.camera);
  const fly = interpolate(frame, [0, 55], [62, 11], {
    ...clamp,
    easing: Easing.bezier(0.2, 0.7, 0.2, 1),
  });
  // Small push-in at the very end to hand off into the tutorial.
  const push = interpolate(frame, [durationInFrames - 20, durationInFrames], [0, 4], {
    ...clamp,
    easing: Easing.in(Easing.cubic),
  });
  const z = fly - push;
  const y = interpolate(frame, [0, 55], [1.5, 0.6], clamp);
  useLayoutEffect(() => {
    camera.position.set(Math.sin(frame * 0.01) * 0.4, y, z);
    camera.lookAt(0, 0.4, 0);
  }, [camera, frame, y, z]);
  return null;
};

export const TutorialIntro: React.FC<z.infer<typeof tutorialIntroSchema>> = ({
  label,
  title,
}) => {
  const frame = useCurrentFrame();
  const { fps, width, height, durationInFrames } = useVideoConfig();
  const font3d = useBrandAssets();

  const heartIn = spring({ frame: frame - 28, fps, config: { damping: 13 } });
  const heartSpin = (1 - heartIn) * Math.PI * 4 + Math.sin(frame * 0.05) * 0.25;
  const labelIn = spring({ frame: frame - 72, fps, config: { damping: 200 } });
  const titleIn = spring({ frame: frame - 80, fps, config: { damping: 200 } });
  const sweep = interpolate(frame, [92, 120], [-30, 130], clamp);
  const fadeOut = interpolate(frame, [durationInFrames - 10, durationInFrames], [1, 0], clamp);

  return (
    <AbsoluteFill style={{ opacity: fadeOut }}>
      <Backdrop />
      <ThreeCanvas width={width} height={height} camera={{ fov: 45 }}>
        <ambientLight intensity={0.45} />
        <directionalLight position={[3, 5, 8]} intensity={1.6} />
        <pointLight position={[-6, 2, 4]} color={BRAND.purple} intensity={60} />
        <pointLight position={[6, -1, 4]} color={BRAND.pink} intensity={60} />
        <IntroCamera />
        <group position={[0, 0, 12]}>
          <RingTunnel count={12} spacing={4} />
        </group>
        <Sparkles />
        <group position={[-0.3, 1.1, 0]}>
          <Heart position={[-4.5, 0.05, 0]} scale={heartIn * 0.95} rotationY={heartSpin} />
          {font3d ? (
            <Text3D font={font3d} text="SWEETZ" size={1.2} startFrame={38} position={[1.0, 0, 0]} />
          ) : null}
        </group>
      </ThreeCanvas>

      {/* Light sweep across the logo */}
      <AbsoluteFill
        style={{
          background: `linear-gradient(105deg, transparent ${sweep - 8}%, rgba(255,255,255,0.22) ${sweep}%, transparent ${sweep + 8}%)`,
          mixBlendMode: "screen",
        }}
      />

      {/* Episode label + title */}
      <AbsoluteFill
        style={{
          justifyContent: "flex-end",
          alignItems: "center",
          paddingBottom: height * 0.17,
          fontFamily: BRAND.font,
          textAlign: "center",
        }}
      >
        <div
          style={{
            opacity: labelIn,
            transform: `translateY(${(1 - labelIn) * 30}px)`,
            padding: "12px 34px",
            borderRadius: 999,
            border: `3px solid ${BRAND.pink}`,
            boxShadow: `0 0 30px ${BRAND.pink}88, inset 0 0 20px ${BRAND.pink}55`,
            color: BRAND.white,
            fontSize: 32,
            fontWeight: 900,
            letterSpacing: 8,
          }}
        >
          {label}
        </div>
        <div
          style={{
            marginTop: 26,
            opacity: titleIn,
            transform: `translateY(${(1 - titleIn) * 40}px)`,
            color: BRAND.white,
            fontSize: 76,
            fontWeight: 900,
            maxWidth: width * 0.8,
            lineHeight: 1.1,
            textShadow: `0 0 30px ${BRAND.purple}`,
          }}
        >
          {title}
        </div>
      </AbsoluteFill>
      <Watermark opacity={interpolate(frame, [60, 80], [0, 0.85], clamp)} />
    </AbsoluteFill>
  );
};
