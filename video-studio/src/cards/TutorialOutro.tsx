import { useThree } from "@react-three/fiber";
import { ThreeCanvas } from "@remotion/three";
import { useLayoutEffect } from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { z } from "zod";
import { Backdrop, Watermark } from "./Backdrop";
import { BRAND } from "./brand";
import { Heart, Sparkles, Text3D } from "./Pieces3D";
import { useBrandAssets } from "./useBrandAssets";

export const tutorialOutroSchema = z.object({
  headline: z.string(),
  ctas: z.array(z.string()),
  nextUp: z.string(),
});

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

const OutroCamera: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const camera = useThree((s) => s.camera);
  const z = interpolate(frame, [0, durationInFrames], [9, 11.5]);
  useLayoutEffect(() => {
    camera.position.set(Math.sin(frame * 0.012) * 0.5, 0.8, z);
    camera.lookAt(0, 0.9, 0);
  }, [camera, frame, z]);
  return null;
};

const OrbitHearts: React.FC<{ count?: number }> = ({ count = 8 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <group rotation={[0.25, 0, 0]}>
      {new Array(count).fill(0).map((_, i) => {
        const a = (i / count) * Math.PI * 2 + frame * 0.02;
        const pop = spring({ frame: frame - 20 - i * 3, fps, config: { damping: 12 } });
        return (
          <Heart
            key={i}
            position={[Math.cos(a) * 3.4, Math.sin(a * 2) * 0.25, Math.sin(a) * 3.4]}
            scale={pop * 0.28}
            rotationY={frame * 0.06 + i}
            color={i % 2 ? BRAND.purple : BRAND.hotPink}
          />
        );
      })}
    </group>
  );
};

export const TutorialOutro: React.FC<z.infer<typeof tutorialOutroSchema>> = ({
  headline,
  ctas,
  nextUp,
}) => {
  const frame = useCurrentFrame();
  const { fps, width, height, durationInFrames } = useVideoConfig();
  const font3d = useBrandAssets();

  const heartIn = spring({ frame, fps, config: { damping: 12 } });
  const beat = 1 + Math.max(0, Math.sin(frame * 0.25)) ** 8 * 0.08; // heartbeat pulse
  const nextIn = spring({ frame: frame - 110, fps, config: { damping: 200 } });
  const fadeOut = interpolate(frame, [durationInFrames - 15, durationInFrames], [1, 0], clamp);

  return (
    <AbsoluteFill style={{ opacity: fadeOut }}>
      <Backdrop />
      <ThreeCanvas width={width} height={height} camera={{ fov: 45 }}>
        <ambientLight intensity={0.45} />
        <directionalLight position={[3, 5, 8]} intensity={1.6} />
        <pointLight position={[-6, 2, 4]} color={BRAND.purple} intensity={60} />
        <pointLight position={[6, -1, 4]} color={BRAND.pink} intensity={60} />
        <OutroCamera />
        <Sparkles count={300} />
        {font3d ? (
          <Text3D font={font3d} text={headline} size={0.68} startFrame={6} stagger={2} position={[0, 2.6, 0]} />
        ) : null}
        <group position={[0, 0.5, 0]}>
          <Heart scale={heartIn * 1.15 * beat} rotationY={frame * 0.03} />
          <OrbitHearts />
        </group>
      </ThreeCanvas>

      {/* Call-to-action pills */}
      <AbsoluteFill
        style={{
          justifyContent: "flex-end",
          alignItems: "center",
          paddingBottom: height * 0.17,
          fontFamily: BRAND.font,
        }}
      >
        <div style={{ display: "flex", gap: 28 }}>
          {ctas.map((cta, i) => {
            const p = spring({ frame: frame - 45 - i * 10, fps, config: { damping: 12 } });
            return (
              <div
                key={cta}
                style={{
                  transform: `scale(${p}) translateY(${(1 - p) * 40}px)`,
                  padding: "18px 36px",
                  borderRadius: 999,
                  background: i === ctas.length - 1 ? BRAND.pink : "rgba(255,255,255,0.08)",
                  border: `3px solid ${BRAND.pink}`,
                  boxShadow: `0 0 28px ${BRAND.pink}77`,
                  color: BRAND.white,
                  fontSize: 38,
                  fontWeight: 900,
                  letterSpacing: 2,
                }}
              >
                {cta}
              </div>
            );
          })}
        </div>
        <div
          style={{
            marginTop: 30,
            opacity: nextIn,
            transform: `translateY(${(1 - nextIn) * 20}px)`,
            color: BRAND.white,
            fontSize: 34,
            fontWeight: 900,
            letterSpacing: 3,
            maxWidth: width * 0.8,
            textAlign: "center",
          }}
        >
          <span style={{ color: BRAND.cyan }}>NEXT UP → </span>
          {nextUp}
        </div>
      </AbsoluteFill>
      <Watermark />
    </AbsoluteFill>
  );
};
