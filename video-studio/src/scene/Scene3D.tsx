import { useThree } from "@react-three/fiber";
import { ThreeCanvas } from "@remotion/three";
import { useEffect, useMemo } from "react";
import * as THREE from "three";
import {
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

// IMPORTANT (Remotion rule): every animation must come from useCurrentFrame().
// Never use useFrame() from @react-three/fiber, or self-animating helpers
// (like drei's <Float> or <OrbitControls autoRotate>) — they flicker in renders.

export type SceneColors = {
  background: string;
  primary: string;
  secondary: string;
  accent: string;
};

// Moves the camera on a slow orbit + push-in, driven by the frame number.
const CameraRig: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames, width, height: videoHeight } = useVideoConfig();
  const camera = useThree((s) => s.camera);

  // Tall (vertical) videos need the camera further back to fit the scene.
  const zoomOut = videoHeight > width ? 1.7 : 1;
  const progress = frame / durationInFrames;
  const angle = interpolate(progress, [0, 1], [-0.6, 0.6]);
  const distance = interpolate(progress, [0, 1], [9, 6.5]) * zoomOut;
  const height = interpolate(progress, [0, 1], [2.5, 1]);

  useEffect(() => {
    camera.position.set(
      Math.sin(angle) * distance,
      height,
      Math.cos(angle) * distance,
    );
    camera.lookAt(0, 0, 0);
  }, [camera, angle, distance, height]);

  return null;
};

// The "hero" object in the middle.
const HeroKnot: React.FC<{ colors: SceneColors }> = ({ colors }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pop = spring({ frame, fps, config: { damping: 12, mass: 0.8 } });

  return (
    <mesh
      scale={pop * 1.4}
      rotation={[frame * 0.01, frame * 0.02, 0]}
    >
      <torusKnotGeometry args={[1, 0.32, 220, 32]} />
      <meshStandardMaterial
        color={colors.primary}
        emissive={colors.primary}
        emissiveIntensity={0.35}
        metalness={0.7}
        roughness={0.2}
      />
    </mesh>
  );
};

// A ring of spheres orbiting the hero object.
const OrbitRing: React.FC<{ colors: SceneColors; count?: number }> = ({
  colors,
  count = 12,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <group rotation={[0.35, 0, 0.15]}>
      {new Array(count).fill(0).map((_, i) => {
        const appear = spring({
          frame: frame - 10 - i * 2,
          fps,
          config: { damping: 14 },
        });
        const a = (i / count) * Math.PI * 2 + frame * 0.015;
        const r = 3.2;
        return (
          <mesh
            key={i}
            position={[Math.cos(a) * r, Math.sin(a * 2) * 0.3, Math.sin(a) * r]}
            scale={appear * 0.22}
          >
            <sphereGeometry args={[1, 32, 32]} />
            <meshStandardMaterial
              color={i % 2 ? colors.secondary : colors.accent}
              emissive={i % 2 ? colors.secondary : colors.accent}
              emissiveIntensity={0.6}
              roughness={0.3}
            />
          </mesh>
        );
      })}
    </group>
  );
};

// A field of glowing dots for depth.
const Starfield: React.FC<{ color: string }> = ({ color }) => {
  const frame = useCurrentFrame();
  const positions = useMemo(() => {
    // Fixed seed-style math so every render frame is identical.
    const arr = new Float32Array(600 * 3);
    for (let i = 0; i < 600; i++) {
      const s = Math.sin(i * 12.9898) * 43758.5453;
      const r1 = s - Math.floor(s);
      const s2 = Math.sin(i * 78.233) * 12345.6789;
      const r2 = s2 - Math.floor(s2);
      const s3 = Math.sin(i * 39.425) * 98765.4321;
      const r3 = s3 - Math.floor(s3);
      arr[i * 3] = (r1 - 0.5) * 30;
      arr[i * 3 + 1] = (r2 - 0.5) * 30;
      arr[i * 3 + 2] = (r3 - 0.5) * 30;
    }
    return arr;
  }, []);

  return (
    <points rotation={[0, frame * 0.002, 0]}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial color={color} size={0.06} sizeAttenuation />
    </points>
  );
};

export const Scene3D: React.FC<{ colors: SceneColors }> = ({ colors }) => {
  const { width, height } = useVideoConfig();
  const fog = useMemo(
    () => new THREE.Fog(colors.background, 8, 22),
    [colors.background],
  );

  return (
    <ThreeCanvas
      width={width}
      height={height}
      camera={{ fov: 50, position: [0, 2, 9] }}
    >
      <color attach="background" args={[colors.background]} />
      <primitive attach="fog" object={fog} />
      <ambientLight intensity={0.35} />
      <directionalLight position={[5, 6, 5]} intensity={1.2} />
      <pointLight position={[-4, 2, 3]} color={colors.secondary} intensity={40} />
      <pointLight position={[4, -2, 3]} color={colors.accent} intensity={40} />
      <CameraRig />
      <Starfield color={colors.accent} />
      <HeroKnot colors={colors} />
      <OrbitRing colors={colors} />
    </ThreeCanvas>
  );
};
