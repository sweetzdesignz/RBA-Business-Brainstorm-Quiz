// Visual themes for the 3D cards. Pick one with the `theme` prop.
// To make a new look, copy a theme and change the colors/fonts.

export type ThemeName = "neon" | "luxe";

export type Theme = {
  name: ThemeName;
  background: string; // CSS background
  text: string; // main flat text color
  accent: string; // pills, highlights
  accent2: string; // secondary color
  subtitleColor: string;
  headingFont: string; // flat titles
  labelFont: string; // pills, small caps
  font3d: string; // public/ path of the 3D text font
  frameBars: boolean; // thin bars top & bottom
  reflections: boolean; // studio reflections for metal looks
  text3d: { color: string; emissive: string; emissiveIntensity: number; metalness: number; roughness: number };
  icon: { color: string; emissiveIntensity: number; metalness: number; roughness: number };
  orbitColors: [string, string];
  ringColors: [string, string];
  ringMetal: boolean;
  sparkle: string;
  lights: [string, string];
};

const GOLD = "#e3b862";

export const THEMES: Record<ThemeName, Theme> = {
  neon: {
    name: "neon",
    background: "radial-gradient(ellipse at 50% 55%, #3b0a4f 0%, #0a0412 65%)",
    text: "#ffffff",
    accent: "#ff2d95",
    accent2: "#8b5cf6",
    subtitleColor: "#22d3ee",
    headingFont: "Montserrat, 'Arial Black', Arial, sans-serif",
    labelFont: "Montserrat, Arial, sans-serif",
    font3d: "fonts/Montserrat-Black.typeface.json",
    frameBars: false,
    reflections: false,
    text3d: { color: "#ffffff", emissive: "#ff5cb8", emissiveIntensity: 0.12, metalness: 0.4, roughness: 0.25 },
    icon: { color: "#ff2d95", emissiveIntensity: 0.45, metalness: 0.55, roughness: 0.18 },
    orbitColors: ["#ff5cb8", "#8b5cf6"],
    ringColors: ["#ff2d95", "#8b5cf6"],
    ringMetal: false,
    sparkle: "#ff5cb8",
    lights: ["#8b5cf6", "#ff2d95"],
  },
  // Black + plum + metallic gold serif + magenta accents.
  luxe: {
    name: "luxe",
    background:
      "radial-gradient(ellipse at 20% 30%, #4a0636 0%, rgba(74,6,54,0) 55%), radial-gradient(ellipse at 85% 85%, #3a2608 0%, rgba(58,38,8,0) 50%), #0b0308",
    text: GOLD,
    accent: "#ff1aa0",
    accent2: GOLD,
    subtitleColor: "#ff7ad1",
    headingFont: "'Playfair Display', Georgia, serif",
    labelFont: "Montserrat, Arial, sans-serif",
    font3d: "fonts/PlayfairDisplay-Bold.typeface.json",
    frameBars: true,
    reflections: true,
    text3d: { color: "#d9a948", emissive: "#3a1500", emissiveIntensity: 0.15, metalness: 1, roughness: 0.28 },
    icon: { color: "#ff1aa0", emissiveIntensity: 0.25, metalness: 0.2, roughness: 0.08 },
    orbitColors: ["#d9a948", "#ff1aa0"],
    ringColors: ["#d9a948", "#d9a948"],
    ringMetal: true,
    sparkle: "#f3d48a",
    lights: ["#ff1aa0", "#f0c060"],
  },
};

export const GOLD_GRADIENT =
  "linear-gradient(180deg, #f7dc8f 0%, #e3b862 45%, #b07a2a 100%)";
