import type { Caption } from "@remotion/captions";
import { createTikTokStyleCaptions } from "@remotion/captions";
import React, { forwardRef, useImperativeHandle, useMemo, useRef } from "react";
import {
  Interactive,
  Sequence,
  useCurrentFrame,
  useVideoConfig,
  type InteractiveBaseProps,
  type InteractiveTransformProps,
  type InteractivitySchema,
  type SequenceControls,
  type SequenceProps,
} from "remotion";

type BasicCaptionsProps = InteractiveBaseProps &
  InteractiveTransformProps &
  Pick<SequenceProps, "width" | "height"> & {
    readonly captions: Caption[];
    readonly combineTokensWithinMilliseconds: number | null;
  };

const defaultCombineTokensWithinMilliseconds = 2000;

const basicCaptionsSchema = {
  ...Interactive.baseSchema,
  ...Interactive.captionsSchema,
  width: {
    type: "number",
    min: 1,
    step: 1,
    default: undefined,
    description: "Caption area width",
    hiddenFromList: false,
  },
  height: {
    type: "number",
    min: 1,
    step: 1,
    default: undefined,
    description: "Caption area height",
    hiddenFromList: false,
  },
  combineTokensWithinMilliseconds: {
    type: "number",
    min: 0,
    step: 50,
    default: defaultCombineTokensWithinMilliseconds,
    description: "Time between caption pages",
    hiddenFromList: false,
  },
  ...Interactive.transformSchema,
} as const satisfies InteractivitySchema;

const BasicCaptionsContent: React.FC<{
  readonly captions: Caption[];
  readonly combineTokensWithinMilliseconds: number;
}> = ({ captions, combineTokensWithinMilliseconds }) => {
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

  if (!page) {
    return null;
  }

  return (
    <div
      style={{
        backgroundColor: "rgba(64, 64, 64, 0.75)",
        color: "#ffffff",
        display: "-webkit-box",
        fontFamily: "Arial, Helvetica, sans-serif",
        fontSize: 64,
        fontWeight: 400,
        lineHeight: 1.2,
        overflow: "hidden",
        padding: "14px 22px",
        textAlign: "center",
        textWrap: "balance",
        WebkitBoxOrient: "vertical",
        WebkitLineClamp: 2,
        whiteSpace: "pre-wrap",
      }}
    >
      {page.text.trim()}
    </div>
  );
};

const BasicCaptionsInner = forwardRef<
  HTMLDivElement,
  BasicCaptionsProps & {
    readonly controls: SequenceControls | undefined;
  }
>(
  (
    {
      captions,
      combineTokensWithinMilliseconds,
      controls,
      name,
      style,
      width,
      height,
      ...interactiveProps
    },
    ref,
  ) => {
    const outlineRef = useRef<HTMLDivElement>(null);
    const resolvedCombineTokensWithinMilliseconds =
      combineTokensWithinMilliseconds ?? defaultCombineTokensWithinMilliseconds;

    useImperativeHandle(ref, () => outlineRef.current as HTMLDivElement, []);

    return (
      <Sequence
        layout="none"
        {...interactiveProps}
        controls={controls}
        name={name ?? "<BasicCaptions>"}
        outlineRef={outlineRef}
      >
        <div
          ref={outlineRef}
          style={{
            alignItems: "center",
            display: "flex",
            justifyContent: "center",
            marginInline: "auto",
            width,
            height,
            ...style,
          }}
        >
          <BasicCaptionsContent
            captions={captions}
            combineTokensWithinMilliseconds={
              resolvedCombineTokensWithinMilliseconds
            }
          />
        </div>
      </Sequence>
    );
  },
);

const BasicCaptionsLayer = Interactive.withSchema({
  Component: BasicCaptionsInner,
  componentName: "<BasicCaptions>",
  schema: basicCaptionsSchema,
  supportsEffects: false,
}) as React.FC<BasicCaptionsProps>;

export const BasicCaptions: React.FC = () => {
  return (
    <BasicCaptionsLayer
      captions={[
        {
          text: "Simple captions,ready for every video.",
          startMs: 0,
          endMs: 2200,
          timestampMs: 1100,
          confidence: null,
          pageBreakAfter: true,
        },
        {
          text: "No animation,\njust clear text.",
          startMs: 2200,
          endMs: 4400,
          timestampMs: 3300,
          confidence: null,
          pageBreakAfter: true,
        },
        {
          text: "Easy to read,\nand easy to customize.",
          startMs: 4400,
          endMs: 7000,
          timestampMs: 5700,
          confidence: null,
        },
      ]}
      combineTokensWithinMilliseconds={null}
      height={220}
      width={900}
      style={{
        translate: "0px 250px",
      }}
    />
  );
};
