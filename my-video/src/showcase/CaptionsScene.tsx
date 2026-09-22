import {createTikTokStyleCaptions} from "@remotion/captions";
import type {TikTokPage} from "@remotion/captions";
import {useMemo} from "react";
import {AbsoluteFill, Sequence, useCurrentFrame, useVideoConfig} from "remotion";
import {gradientBg, palette} from "./palette";
import {poppins} from "./font";
import {sampleCaptions} from "./sampleCaptions";

const SWITCH_CAPTIONS_EVERY_MS = 1200;
const HIGHLIGHT_COLOR = palette.accent2;

const CaptionPage: React.FC<{page: TikTokPage}> = ({page}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  const currentTimeMs = (frame / fps) * 1000;
  const absoluteTimeMs = page.startMs + currentTimeMs;

  return (
    <AbsoluteFill style={{justifyContent: "center", alignItems: "center"}}>
      <div style={{fontSize: 58, fontWeight: 700, whiteSpace: "pre", color: palette.text, maxWidth: 1000, textAlign: "center"}}>
        {page.tokens.map((token, tokenIndex) => {
          const isActive = token.fromMs <= absoluteTimeMs && token.toMs > absoluteTimeMs;
          return (
            <span key={`${token.fromMs}-${tokenIndex}`} style={{color: isActive ? HIGHLIGHT_COLOR : palette.text}}>
              {token.text}
            </span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// Demonstrates: @remotion/captions turning a Caption[] transcript into
// TikTok-style pages with per-word highlighting, driven by useCurrentFrame().
export const CaptionsScene: React.FC = () => {
  const {fps, width} = useVideoConfig();

  const {pages} = useMemo(
    () =>
      createTikTokStyleCaptions({
        captions: sampleCaptions,
        combineTokensWithinMilliseconds: SWITCH_CAPTIONS_EVERY_MS,
      }),
    [],
  );

  return (
    <AbsoluteFill style={{background: gradientBg, fontFamily: poppins}}>
      <div style={{position: "absolute", top: 64, width, textAlign: "center", color: palette.textDim, fontSize: 28}}>
        @remotion/captions · TikTok-style word highlighting
      </div>
      {pages.map((page, index) => {
        const nextPage = pages[index + 1] ?? null;
        const startFrame = Math.round((page.startMs / 1000) * fps);
        // Size each page by its own spoken duration (durationMs), capped
        // only by where the next page starts. A fixed cap at
        // SWITCH_CAPTIONS_EVERY_MS (the pattern in the captions guide)
        // assumes many short pages; a page whose words are all closer
        // together than that threshold merges into one long page, and a
        // fixed cap would cut it off well before it finishes.
        const rawEndFrame = Math.round(((page.startMs + page.durationMs) / 1000) * fps);
        const endFrame = nextPage
          ? Math.min(rawEndFrame, Math.round((nextPage.startMs / 1000) * fps))
          : rawEndFrame;
        const durationInFrames = endFrame - startFrame;

        if (durationInFrames <= 0) {
          return null;
        }

        return (
          <Sequence key={index} from={startFrame} durationInFrames={durationInFrames}>
            <CaptionPage page={page} />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
