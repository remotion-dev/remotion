import {createTikTokStyleCaptions, parseSrt, serializeSrt} from "@remotion/captions";
import type {TikTokPage} from "@remotion/captions";
import {elevenLabsTranscriptToCaptions} from "@remotion/elevenlabs";
import type {ElevenLabsTranscript} from "@remotion/elevenlabs";
import {useMemo} from "react";
import {AbsoluteFill, Sequence, useCurrentFrame, useVideoConfig} from "remotion";
import {gradientBg, palette} from "./palette";
import {poppins} from "./font";
import {sampleCaptions} from "./sampleCaptions";

const SWITCH_CAPTIONS_EVERY_MS = 800;
const HIGHLIGHT_COLOR = palette.accent2;

// A hand-built stand-in for a real ElevenLabs Speech-to-Text response (this
// sandbox has no network access to call ElevenLabs' API for a real one) --
// exactly the shape `timestamps_granularity: "word"` returns.
const sampleElevenLabsTranscript: ElevenLabsTranscript = {
  language_code: "en",
  language_probability: 0.98,
  transcription_id: "sample-transcript",
  text: "Real speech to text.",
  words: [
    {text: "Real", start: 0, end: 0.3, type: "word", logprob: -0.02},
    {text: " ", start: 0.3, end: 0.34, type: "spacing", logprob: 0},
    {text: "speech", start: 0.34, end: 0.7, type: "word", logprob: -0.04},
    {text: " ", start: 0.7, end: 0.74, type: "spacing", logprob: 0},
    {text: "to", start: 0.74, end: 0.9, type: "word", logprob: -0.01},
    {text: " ", start: 0.9, end: 0.94, type: "spacing", logprob: 0},
    {text: "text.", start: 0.94, end: 1.3, type: "word", logprob: -0.03},
  ],
};

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
// TikTok-style pages with per-word highlighting, driven by useCurrentFrame(),
// a serializeSrt() -> parseSrt() round-trip (the interchange format used to
// hand captions to/from other tools) on that same transcript, and
// @remotion/elevenlabs' elevenLabsTranscriptToCaptions() converting a
// different STT provider's transcript shape into the same Caption[] format.
export const CaptionsScene: React.FC = () => {
  const {fps, width} = useVideoConfig();

  const {pages} = useMemo(
    () =>
      createTikTokStyleCaptions({
        captions: sampleCaptions,
        combineTokensWithinMilliseconds: SWITCH_CAPTIONS_EVERY_MS,
        // Also start a new page after any pause of 100ms+ (the one after "Remotion:").
        breakOnSilenceAfterMilliseconds: 100,
      }),
    [],
  );

  const roundTrippedCount = useMemo(() => {
    const srt = serializeSrt({lines: sampleCaptions.map((caption) => [caption])});
    return parseSrt({input: srt}).captions.length;
  }, []);

  const elevenLabsCaptionCount = useMemo(
    () => elevenLabsTranscriptToCaptions({transcript: sampleElevenLabsTranscript}).captions.length,
    [],
  );

  return (
    <AbsoluteFill style={{background: gradientBg, fontFamily: poppins}}>
      <div style={{position: "absolute", top: 64, width, textAlign: "center", color: palette.textDim, fontSize: 28}}>
        @remotion/captions · TikTok-style word highlighting
      </div>
      <div style={{position: "absolute", top: 104, width, textAlign: "center", color: palette.textDim, fontSize: 16, fontFamily: "monospace"}}>
        serializeSrt() → parseSrt(): {roundTrippedCount} cue{roundTrippedCount === 1 ? "" : "s"} recovered · elevenLabsTranscriptToCaptions(): {elevenLabsCaptionCount} captions
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
