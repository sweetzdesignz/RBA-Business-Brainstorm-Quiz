import { createTikTokStyleCaptions } from "@remotion/captions";
import type { Caption, TikTokPage } from "@remotion/captions";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AbsoluteFill,
  Sequence,
  spring,
  staticFile,
  useCurrentFrame,
  useDelayRender,
  useVideoConfig,
} from "remotion";

// How often a new "page" of words appears. Lower = fewer words at a time.
const SWITCH_CAPTIONS_EVERY_MS = 1200;

const CaptionPage: React.FC<{ page: TikTokPage; highlight: string }> = ({
  page,
  highlight,
}) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const absoluteTimeMs = page.startMs + (frame / fps) * 1000;
  const pop = spring({ frame, fps, config: { damping: 200 }, durationInFrames: 6 });
  const isVertical = height > width;

  return (
    <AbsoluteFill
      style={{
        justifyContent: "flex-end",
        alignItems: "center",
        paddingBottom: isVertical ? height * 0.22 : height * 0.1,
        paddingLeft: 60,
        paddingRight: 60,
      }}
    >
      <div
        style={{
          fontFamily: "Montserrat, 'Arial Black', Arial, sans-serif",
          fontWeight: 900,
          fontSize: isVertical ? 84 : 72,
          lineHeight: 1.15,
          textAlign: "center",
          whiteSpace: "pre-wrap",
          textTransform: "uppercase",
          color: "white",
          WebkitTextStroke: "3px black",
          paintOrder: "stroke",
          textShadow: "0 6px 24px rgba(0,0,0,0.6)",
          transform: `scale(${0.85 + pop * 0.15})`,
        }}
      >
        {page.tokens.map((token) => {
          const isActive =
            token.fromMs <= absoluteTimeMs && token.toMs > absoluteTimeMs;
          return (
            <span
              key={token.fromMs}
              style={{ color: isActive ? highlight : "white" }}
            >
              {token.text}
            </span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// Loads a captions JSON file from public/ and shows TikTok-style word captions.
export const Captions: React.FC<{ file: string; highlight: string }> = ({
  file,
  highlight,
}) => {
  const [captions, setCaptions] = useState<Caption[] | null>(null);
  const { delayRender, continueRender, cancelRender } = useDelayRender();
  const [handle] = useState(() => delayRender(`Loading captions ${file}`));
  const { fps } = useVideoConfig();

  const load = useCallback(async () => {
    try {
      const res = await fetch(staticFile(file));
      setCaptions((await res.json()) as Caption[]);
      continueRender(handle);
    } catch (e) {
      cancelRender(e);
    }
  }, [file, handle, continueRender, cancelRender]);

  useEffect(() => {
    load();
  }, [load]);

  const pages = useMemo(() => {
    if (!captions) return [];
    return createTikTokStyleCaptions({
      captions,
      combineTokensWithinMilliseconds: SWITCH_CAPTIONS_EVERY_MS,
    }).pages;
  }, [captions]);

  return (
    <AbsoluteFill>
      {pages.map((page, i) => {
        const next = pages[i + 1] ?? null;
        const start = Math.round((page.startMs / 1000) * fps);
        const end = Math.round(
          Math.min(
            next ? (next.startMs / 1000) * fps : Infinity,
            ((page.startMs + SWITCH_CAPTIONS_EVERY_MS) / 1000) * fps,
          ),
        );
        if (end - start <= 0) return null;
        return (
          <Sequence key={i} from={start} durationInFrames={end - start}>
            <CaptionPage page={page} highlight={highlight} />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
