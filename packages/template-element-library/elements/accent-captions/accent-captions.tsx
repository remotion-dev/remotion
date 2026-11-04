import { createTikTokStyleCaptions, type Caption } from "@remotion/captions";
import { Fragment, useMemo, type CSSProperties } from "react";
import { Interactive, useCurrentFrame, useVideoConfig } from "remotion";

type AccentCaptionsProps = {
  captions?: Caption[];
  combineTokensWithinMilliseconds?: number;
  highlightColor?: string;
  width?: number;
  style?: CSSProperties;
};

const AccentCaptionsInner = ({
  captions = [],
  combineTokensWithinMilliseconds = 3000,
  highlightColor = "#ffb27d",
  width = 900,
  style,
}: AccentCaptionsProps) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const pages = useMemo(
    () =>
      createTikTokStyleCaptions({
        captions,
        combineTokensWithinMilliseconds,
      }).pages,
    [captions, combineTokensWithinMilliseconds],
  );

  const currentTimeMs = (frame / fps) * 1000;

  const page = pages.find(
    (candidate) =>
      currentTimeMs >= candidate.startMs &&
      currentTimeMs < candidate.startMs + candidate.durationMs,
  );

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width,
        color: "#ffffff",
        fontFamily: "Arial, Helvetica, sans-serif",
        fontSize: 72,
        fontWeight: 700,
        lineHeight: 1.25,
        textAlign: "center",
        paintOrder: "stroke fill",
        WebkitTextStroke: "5px #202020",
        ...style,
      }}
    >
      <div
        style={{
          minWidth: 0,
          whiteSpace: "pre-wrap",
          overflowWrap: "anywhere",
        }}
      >
        {page?.tokens.map((token, index) => {
          const active =
            currentTimeMs >= token.fromMs && currentTimeMs < token.toMs;

          const text = token.text.trim();
          const start = token.text.indexOf(text);

          return (
            <Fragment key={`${page.startMs}-${index}`}>
              {token.text.slice(0, start)}
              <span style={{ color: active ? highlightColor : "inherit" }}>
                {text}
              </span>
              {token.text.slice(start + text.length)}
            </Fragment>
          );
        })}
      </div>
    </div>
  );
};

export const AccentCaptions = Interactive.create({
  Component: AccentCaptionsInner,
  layout: "none",
  schema: {
    ...Interactive.captionsSchema,
    width: {
      type: "number",
      min: 1,
      step: 1,
      default: 900,
      description: "Caption area width",
      hiddenFromList: false,
    },
    combineTokensWithinMilliseconds: {
      type: "number",
      min: 0,
      step: 50,
      default: 3000,
      description: "Time between caption pages",
      hiddenFromList: false,
    },
    highlightColor: {
      type: "color",
      default: "#ffb27d",
      description: "Active word color",
    },
  },
});
