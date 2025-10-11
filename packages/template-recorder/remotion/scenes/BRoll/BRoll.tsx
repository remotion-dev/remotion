import React from "react";
import { Sequence, spring, useCurrentFrame, useVideoConfig } from "remotion";
import type { CanvasLayout } from "../../../config/layout";
import type { BRollWithDimensions } from "../../../config/scenes";
import { B_ROLL_TRANSITION_DURATION } from "../../../config/transitions";
import type { BRollEnterDirection, Layout } from "../../layout/layout-types";
import { Fade, FadeBRoll } from "./FadeBRoll";
import { ScaleDownBRoll } from "./ScaleDownBRoll";

const InnerBRoll: React.FC<{
  bRoll: BRollWithDimensions;
  bRollsBefore: BRollWithDimensions[];
  bRollEnterDirection: BRollEnterDirection;
  bRollLayout: Layout;
  sceneFrame: number;
  canvasLayout: CanvasLayout;
}> = ({
  bRoll,
  bRollsBefore,
  bRollLayout,
  bRollEnterDirection,
  sceneFrame,
  canvasLayout,
}) => {
  const { fps } = useVideoConfig();
  const frame = useCurrentFrame();

  const bRollType = canvasLayout === "landscape" ? "fade" : "scale";

  const appearProgress = spring({
    fps,
    frame,
    config: {
      damping: 200,
    },
    durationInFrames: B_ROLL_TRANSITION_DURATION,
  });

  const disappearProgress = spring({
    fps,
    frame,
    delay: bRoll.durationInFrames - B_ROLL_TRANSITION_DURATION,
    config: {
      damping: 200,
    },
    durationInFrames: B_ROLL_TRANSITION_DURATION,
  });

  if (bRollType === "fade") {
    return (
      <Fade
        appearProgress={appearProgress}
        disappearProgress={disappearProgress}
      >
        <FadeBRoll layout={bRollLayout} bRoll={bRoll} />
      </Fade>
    );
  }

  return (
    <ScaleDownBRoll
      bRoll={bRoll}
      bRollsBefore={bRollsBefore}
      bRollLayout={bRollLayout}
      bRollEnterDirection={bRollEnterDirection}
      sceneFrame={sceneFrame}
      appearProgress={appearProgress}
      disappearProgress={disappearProgress}
    />
  );
};

export const BRoll: React.FC<{
  bRoll: BRollWithDimensions;
  bRollsBefore: BRollWithDimensions[];
  bRollEnterDirection: BRollEnterDirection;
  sceneFrame: number;
  bRollLayout: Layout;
  canvasLayout: CanvasLayout;
}> = ({
  bRoll,
  bRollsBefore,
  sceneFrame,
  bRollLayout,
  bRollEnterDirection,
  canvasLayout,
}) => {
  if (bRoll.durationInFrames <= 0) {
    return null;
  }

  return (
    <Sequence from={bRoll.from} durationInFrames={bRoll.durationInFrames}>
      <InnerBRoll
        sceneFrame={sceneFrame}
        bRollsBefore={bRollsBefore}
        bRoll={bRoll}
        bRollLayout={bRollLayout}
        bRollEnterDirection={bRollEnterDirection}
        canvasLayout={canvasLayout}
      />
    </Sequence>
  );
};
