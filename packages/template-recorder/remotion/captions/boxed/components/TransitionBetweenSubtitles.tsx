import React from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { SCENE_TRANSITION_DURATION } from "../../../../config/transitions";

export const TransitionFromPreviousSubtitles: React.FC<{
  children: React.ReactNode;
  shouldTransitionFromPreviousSubtitle: boolean;
}> = ({ children, shouldTransitionFromPreviousSubtitle }) => {
  const frame = useCurrentFrame();
  if (!shouldTransitionFromPreviousSubtitle) {
    return <div>{children}</div>;
  }

  return (
    <div
      style={{
        // TODO: Differentiate between layout change and not
        opacity: interpolate(
          frame,
          [SCENE_TRANSITION_DURATION, SCENE_TRANSITION_DURATION + 5],
          [0, 1],
          {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          },
        ),
      }}
    >
      {children}
    </div>
  );
};

export const TransitionToNextSubtitles: React.FC<{
  children: React.ReactNode;
  shouldTransitionToNextsSubtitles: boolean;
}> = ({ children, shouldTransitionToNextsSubtitles }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  if (!shouldTransitionToNextsSubtitles) {
    return <div>{children}</div>;
  }

  return (
    <div
      style={{
        opacity: interpolate(
          frame,
          [
            durationInFrames - SCENE_TRANSITION_DURATION - 5,
            durationInFrames - SCENE_TRANSITION_DURATION,
          ],
          [1, 0],
          {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          },
        ),
      }}
    >
      {children}
    </div>
  );
};
