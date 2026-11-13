import { useThree } from "@react-three/fiber";
import { useLayoutEffect, useMemo } from "react";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry.js";
import { Font } from "three/examples/jsm/loaders/FontLoader.js";
import { spring, useCurrentFrame, useVideoConfig } from "remotion";
import type { Theme } from "./brand";

export type IconName = "heart" | "gem" | "none";

// ---------- Studio reflections (makes gold look like real metal) ----------
export const Reflections: React.FC = () => {
  const gl = useThree((s) => s.gl);
  const scene = useThree((s) => s.scene);
  useLayoutEffect(() => {
    const pmrem = new THREE.PMREMGenerator(gl);
    const env = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = env;
    return () => {
      scene.environment = null;
      env.dispose();
      pmrem.dispose();
    };
  }, [gl, scene]);
  return null;
};

// ---------- Lights shared by all cards ----------
export const ThemeLights: React.FC<{ theme: Theme }> = ({ theme }) => (
  <>
    <ambientLight intensity={theme.reflections ? 0.25 : 0.45} />
    <directionalLight position={[3, 5, 8]} intensity={theme.reflections ? 1.2 : 1.6} />
    <pointLight position={[-6, 2, 4]} color={theme.lights[0]} intensity={60} />
    <pointLight position={[6, -1, 4]} color={theme.lights[1]} intensity={60} />
    {theme.reflections ? <Reflections /> : null}
  </>
);

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

// ---------- Cut gem (like the diamond on the divider line) ----------
const makeGemGeometry = () => {
  const crown = new THREE.CylinderGeometry(0.62, 1, 0.38, 10, 1);
  crown.translate(0, 0.19, 0);
  const pavilion = new THREE.ConeGeometry(1, 1.05, 10, 1);
  pavilion.rotateX(Math.PI);
  pavilion.translate(0, -0.525, 0);
  const merged = new THREE.BufferGeometry();
  const a = crown.toNonIndexed();
  const b = pavilion.toNonIndexed();
  const pos = new Float32Array([
    ...(a.attributes.position.array as Float32Array),
    ...(b.attributes.position.array as Float32Array),
  ]);
  merged.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  merged.computeVertexNormals();
  merged.center();
  return merged;
};

export const Icon3D: React.FC<{
  icon: IconName;
  theme: Theme;
  position?: [number, number, number];
  scale?: number;
  rotationY?: number;
  color?: string;
}> = ({ icon, theme, position = [0, 0, 0], scale = 1, rotationY = 0, color }) => {
  const heart = useMemo(makeHeartGeometry, []);
  const gem = useMemo(makeGemGeometry, []);
  if (icon === "none") return null;
  const c = color ?? theme.icon.color;
  return (
    <mesh
      geometry={icon === "heart" ? heart : gem}
      position={position}
      scale={Math.max(scale, 0.0001)}
      rotation={[icon === "gem" ? 0.25 : 0, rotationY, 0]}
    >
      {icon === "gem" ? (
        <meshPhysicalMaterial
          color={c}
          emissive={c}
          emissiveIntensity={theme.icon.emissiveIntensity}
          metalness={theme.icon.metalness}
          roughness={theme.icon.roughness}
          clearcoat={1}
          flatShading
        />
      ) : (
        <meshStandardMaterial
          color={c}
          emissive={c}
          emissiveIntensity={theme.icon.emissiveIntensity}
          metalness={theme.icon.metalness}
          roughness={theme.icon.roughness}
        />
      )}
    </mesh>
  );
};

// Width of a line of 3D text, so layouts can center it and leave room for an icon.
export const measureText3D = (font: Font, text: string, size: number) =>
  text.split("").reduce((w, ch) => {
    const glyph = font.data.glyphs[ch];
    return w + (glyph ? (glyph.ha / font.data.resolution) * size : size * 0.4);
  }, 0);

// ---------- 3D text, letters pop in one by one ----------
export const Text3D: React.FC<{
  font: Font;
  theme: Theme;
  text: string;
  size?: number;
  startFrame?: number;
  stagger?: number;
  position?: [number, number, number];
}> = ({ font, theme, text, size = 1, startFrame = 0, stagger = 3, position = [0, 0, 0] }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const letters = useMemo(() => {
    const res = font.data.resolution;
    const bevel = theme.name === "luxe" ? 0.5 : 1; // finer bevel for serif fonts
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
              depth: size * 0.3,
              curveSegments: 12,
              bevelEnabled: true,
              bevelThickness: size * 0.04 * bevel,
              bevelSize: size * 0.025 * bevel,
              bevelSegments: 5,
            });
      const item = { geo, x, advance };
      x += advance;
      return item;
    });
    return { list, width: x };
  }, [font, text, size, theme.name]);

  const m = theme.text3d;
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
            position={[l.x - letters.width / 2, -size * 0.36 + (1 - p) * -1.5, (1 - p) * 3]}
            rotation={[(1 - p) * -1.2, 0, 0]}
            scale={Math.max(p, 0.0001)}
          >
            <meshStandardMaterial
              color={m.color}
              emissive={m.emissive}
              emissiveIntensity={m.emissiveIntensity}
              metalness={m.metalness}
              roughness={m.roughness}
            />
          </mesh>
        );
      })}
    </group>
  );
};

// ---------- Ring tunnel the camera flies through ----------
export const RingTunnel: React.FC<{ theme: Theme; count?: number; spacing?: number }> = ({
  theme,
  count = 14,
  spacing = 4,
}) => {
  const frame = useCurrentFrame();
  return (
    <group>
      {new Array(count).fill(0).map((_, i) => {
        const color = theme.ringColors[i % 2];
        return (
          <mesh key={i} position={[0, 0, -i * spacing]} rotation={[0, 0, i * 0.4 + frame * 0.01]}>
            <torusGeometry args={[4.5, theme.ringMetal ? 0.035 : 0.05, 16, 160]} />
            {theme.ringMetal ? (
              <meshStandardMaterial color={color} metalness={1} roughness={0.2} />
            ) : (
              <meshBasicMaterial color={color} />
            )}
          </mesh>
        );
      })}
    </group>
  );
};

// ---------- Sparkles (fixed positions, drift driven by frame) ----------
export const Sparkles: React.FC<{ color: string; count?: number; spread?: number }> = ({
  color,
  count = 400,
  spread = 30,
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
      <pointsMaterial color={color} size={0.06} sizeAttenuation transparent opacity={0.8} />
    </points>
  );
};
