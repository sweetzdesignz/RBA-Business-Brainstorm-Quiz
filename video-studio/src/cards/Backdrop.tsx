import { AbsoluteFill } from "remotion";
import { BRAND } from "./brand";

// Neon stage backdrop + 💗SWEETZ watermark, shared by intro and outro.
export const Backdrop: React.FC = () => (
  <AbsoluteFill
    style={{
      background: `radial-gradient(ellipse at 50% 55%, ${BRAND.bgGlow} 0%, ${BRAND.bgDeep} 65%)`,
    }}
  />
);

export const Watermark: React.FC<{ opacity?: number }> = ({ opacity = 0.85 }) => (
  <AbsoluteFill
    style={{ justifyContent: "flex-end", alignItems: "flex-end", padding: 48, opacity }}
  >
    <div
      style={{
        fontFamily: BRAND.font,
        fontWeight: 900,
        fontSize: 34,
        color: BRAND.white,
        letterSpacing: 2,
        textShadow: `0 0 18px ${BRAND.pink}`,
      }}
    >
      💗SWEETZ
    </div>
  </AbsoluteFill>
);
