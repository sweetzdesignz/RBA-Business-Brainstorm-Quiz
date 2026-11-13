import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { GOLD_GRADIENT, type Theme } from "./brand";

export const Backdrop: React.FC<{ theme: Theme }> = ({ theme }) => (
  <AbsoluteFill style={{ background: theme.background }} />
);

// Thin metallic bars at the top and bottom (luxe theme).
export const FrameBars: React.FC<{ theme: Theme }> = ({ theme }) => {
  const frame = useCurrentFrame();
  if (!theme.frameBars) return null;
  const grow = interpolate(frame, [0, 20], [0, 100], { extrapolateRight: "clamp" });
  const bar: React.CSSProperties = {
    position: "absolute",
    left: `${50 - grow / 2}%`,
    width: `${grow}%`,
    height: 8,
    background: "linear-gradient(90deg, #8a5a1c, #f7dc8f 50%, #8a5a1c)",
  };
  return (
    <AbsoluteFill>
      <div style={{ ...bar, top: 0 }} />
      <div style={{ ...bar, bottom: 0 }} />
    </AbsoluteFill>
  );
};

// Small corner text (bottom right). Empty text = nothing shown.
export const Watermark: React.FC<{ text: string; theme: Theme; opacity?: number }> = ({
  text,
  theme,
  opacity = 0.85,
}) =>
  text ? (
    <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "flex-end", padding: "0 56px 38px 0", opacity }}>
      <div
        style={{
          fontFamily: theme.labelFont,
          fontWeight: theme.name === "luxe" ? 600 : 900,
          fontSize: theme.name === "luxe" ? 22 : 34,
          letterSpacing: theme.name === "luxe" ? 7 : 2,
          ...(theme.name === "luxe"
            ? { color: "#d9a948", textTransform: "uppercase" as const }
            : { color: "#fff", textShadow: `0 0 18px ${theme.accent}` }),
        }}
      >
        {text}
      </div>
    </AbsoluteFill>
  ) : null;

// Outlined pill label ("SDHQ CLASSROOM", "TUTORIAL", ...).
export const LabelPill: React.FC<{ text: string; theme: Theme; filled?: boolean; style?: React.CSSProperties }> = ({
  text,
  theme,
  filled,
  style,
}) => {
  const luxe = theme.name === "luxe";
  const border = luxe ? "#e3b862" : theme.accent;
  return (
    <div
      style={{
        padding: luxe ? "12px 36px" : "12px 34px",
        borderRadius: 999,
        border: filled ? "none" : `3px solid ${border}`,
        background: filled ? theme.accent : "transparent",
        boxShadow: luxe ? `0 0 18px ${border}44` : `0 0 30px ${border}88, inset 0 0 20px ${border}55`,
        color: luxe && !filled ? "#f3e6c8" : "#fff",
        fontFamily: theme.labelFont,
        fontSize: luxe ? 28 : 32,
        fontWeight: luxe ? 600 : 900,
        letterSpacing: luxe ? 9 : 8,
        textTransform: "uppercase",
        ...style,
      }}
    >
      {text}
    </div>
  );
};

// Gold line with a magenta diamond in the middle; grows out from the center.
export const Divider: React.FC<{ theme: Theme; progress: number }> = ({ theme, progress }) => (
  <div style={{ position: "relative", width: 460 * progress, height: 18, display: "flex", alignItems: "center" }}>
    <div style={{ width: "100%", height: 3, background: GOLD_GRADIENT }} />
    <div
      style={{
        position: "absolute",
        left: "50%",
        width: 16,
        height: 16,
        transform: `translateX(-50%) rotate(45deg) scale(${progress})`,
        background: theme.accent,
        boxShadow: `0 0 14px ${theme.accent}`,
      }}
    />
  </div>
);

// Title text: gold gradient serif (luxe) or white glow (neon).
export const titleStyle = (theme: Theme, fontSize: number): React.CSSProperties =>
  theme.name === "luxe"
    ? {
        fontFamily: theme.headingFont,
        fontWeight: 700,
        fontSize,
        lineHeight: 1.15,
        background: GOLD_GRADIENT,
        WebkitBackgroundClip: "text",
        backgroundClip: "text",
        color: "transparent",
        filter: `drop-shadow(0 0 22px ${theme.accent}66)`,
      }
    : {
        fontFamily: theme.headingFont,
        fontWeight: 900,
        fontSize,
        lineHeight: 1.1,
        color: "#fff",
        textShadow: `0 0 30px ${theme.accent2}`,
      };

export const subtitleStyle = (theme: Theme, fontSize: number): React.CSSProperties =>
  theme.name === "luxe"
    ? { fontFamily: theme.headingFont, fontStyle: "italic", fontWeight: 400, fontSize, color: theme.subtitleColor }
    : { fontFamily: theme.labelFont, fontWeight: 900, fontSize: fontSize * 0.8, letterSpacing: 3, color: theme.subtitleColor };
