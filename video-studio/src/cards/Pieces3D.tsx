import { useMemo } from "react";
import * as THREE from "three";
import { Font } from "three/examples/jsm/loaders/FontLoader.js";
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry.js";
import { spring, useCurrentFrame, useVideoConfig } from "remotion";
import { BRAND } from "./brand";

// ---------- Heart ----------
const makeHeartGeometry = () => {
  const s = new THREE.Shape();
  s.moveTo(0, 0.5);
  s.bezierCurveTo(0, 0.8, -0.3, 1.1, -0.65, 1.1);
  s.bezierCurveTo(-1.15, 1.1, -1.25, 0.6, -1.25, 0.45);
  s.bezierCurveTo(-1.25, 0.05, -0.85, -0.4, 0, -1);
  s.bezierCurveTo(0.85, -0.4, 1.25, 0.05, 1.25, 0.45);
  s.bezierCurveTo(1.25, 0.6, 1.15, 1.1, 0.65, 1.1);
  s.bezierCurveTo(0.3, 1.1, 0, 0.8, 0, 0.5);
  const g = new THREE.ExtrudeGeometry(s, {
    depth: 0.4,
    bevelEnabled: true,
    bevelThickness: 0.18,
    bevelSize: 0.14,
    bevelSegments: 8,
    curveSegments: 32,
  });
  g.center();
  return g;
};

export const Heart: React.FC<{
  position?: [number, number, number];
  scale?: number;
  rotationY?: number;
  color?: string;
}> = ({ position = [0, 0, 0], scale = 1, rotationY = 0, color = BRAND.pink }) => {
  const geo = useMemo(makeHeartGeometry, []);
  return (
    <mesh geometry={geo} position={position} scale={scale} rotation={[0, rotationY, 0]}>
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={0.45}
        metalness={0.55}
        roughness={0.18}
      />
    </mesh>
  );
};

// ---------- 3D text, letters pop in one by one ----------
export const Text3D: React.FC<{
  font: Font;
  text: string;
  size?: number;
  startFrame?: number;
  stagger?: number;
  color?: string;
  position?: [number, number, number];
}> = ({
  font,
  text,
  size = 1,
  startFrame = 0,
  stagger = 3,
  color = BRAND.white,
  position = [0, 0, 0],
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const letters = useMemo(() => {
    const res = font.data.resolution;
    let x = 0;
    const list = text.split("").map((ch) => {
      const glyph = font.data.glyphs[ch];
      const advance = glyph ? (glyph.ha / res) * size : size * 0.4;
      const geo =
        ch === " "
          ? null
          : new TextGeometry(ch, {
              font,
              size,
              depth: size * 0.35,
              curveSegments: 10,
              bevelEnabled: true,
              bevelThickness: size * 0.04,
              bevelSize: size * 0.025,
              bevelSegments: 4,
            });
      const item = { geo, x, advance };
      x += advance;
      return item;
    });
    return { list, width: x };
  }, [font, text, size]);

  return (
    <group position={position}>
      {letters.list.map((l, i) => {
        if (!l.geo) return null;
        const p = spring({
          frame: frame - startFrame - i * stagger,
          fps,
          config: { damping: 11, mass: 0.7 },
        });
        return (
          <mesh
            key={i}
            geometry={l.geo}
            position={[
              l.x - letters.width / 2,
              -size * 0.36 + (1 - p) * -1.5,
              (1 - p) * 3,
            ]}
            rotation={[(1 - p) * -1.2, 0, 0]}
            scale={Math.max(p, 0.0001)}
          >
            <meshStandardMaterial
              color={color}
              emissive={BRAND.hotPink}
              emissiveIntensity={0.12}
              metalness={0.4}
              roughness={0.25}
            />
          </mesh>
        );
      })}
    </group>
  );
};

// ---------- Neon ring tunnel the camera flies through ----------
export const RingTunnel: React.FC<{ count?: number; spacing?: number }> = ({
  count = 14,
  spacing = 4,
}) => {
  const frame = useCurrentFrame();
  return (
    <group>
      {new Array(count).fill(0).map((_, i) => (
        <mesh
          key={i}
          position={[0, 0, -i * spacing]}
          rotation={[0, 0, i * 0.4 + frame * 0.01]}
        >
          <torusGeometry args={[4.5, 0.05, 16, 120]} />
          <meshBasicMaterial color={i % 2 ? BRAND.purple : BRAND.pink} />
        </mesh>
      ))}
    </group>
  );
};

// ---------- Sparkles (fixed positions, drift driven by frame) ----------
export const Sparkles: React.FC<{ count?: number; spread?: number; color?: string }> = ({
  count = 400,
  spread = 30,
  color = BRAND.hotPink,
}) => {
  const frame = useCurrentFrame();
  const positions = useMemo(() => {
    const rand = (n: number) => {
      const v = Math.sin(n) * 43758.5453;
      return v - Math.floor(v);
    };
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (rand(i * 1.1) - 0.5) * spread;
      arr[i * 3 + 1] = (rand(i * 2.3) - 0.5) * spread * 0.6;
      arr[i * 3 + 2] = -rand(i * 3.7) * spread * 1.5 + 5;
    }
    return arr;
  }, [count, spread]);
  return (
    <points rotation={[0, 0, frame * 0.002]}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial color={color} size={0.07} sizeAttenuation transparent opacity={0.85} />
    </points>
  );
};
