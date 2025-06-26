import React, { useMemo } from "react";
import {
  AbsoluteFill,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { TITLE_FONT } from "../../../config/fonts";
import { getSafeSpace } from "../../../config/layout";
import { SCENE_TRANSITION_DURATION } from "../../../config/transitions";
import { borderRadius } from "../../layout/get-layout";
import type { Layout } from "../../layout/layout-types";

const HEIGHT = 78;

const gradientSteps = [
  0, 0.013, 0.049, 0.104, 0.175, 0.259, 0.352, 0.45, 0.55, 0.648, 0.741, 0.825,
  0.896, 0.951, 0.987,
];

const gradientOpacities = [
  0, 8.1, 15.5, 22.5, 29, 35.3, 41.2, 47.1, 52.9, 58.8, 64.7, 71, 77.5, 84.5,
  91.9,
];

const globalGradientOpacity = 1 / 0.7;

export const SquareChapter: React.FC<{
  title: string;
  didTransitionIn: boolean;
  displayLayout: Layout | null;
  webcamLayout: Layout;
}> = ({ title, webcamLayout, didTransitionIn, displayLayout }) => {
  const layout = useMemo(() => {
    return displayLayout ?? webcamLayout;
  }, [displayLayout, webcamLayout]);

  const top = useMemo(() => {
    return layout.height - HEIGHT - getSafeSpace("square");
  }, [layout.height]);

  const frame = useCurrentFrame();
  const { fps, width } = useVideoConfig();

  const enter = spring({
    fps,
    frame,
    config: {
      damping: 200,
    },
    delay: didTransitionIn ? SCENE_TRANSITION_DURATION : 0,
  });

  const exit = spring({
    fps,
    frame,
    config: {
      damping: 200,
    },
    delay: 70,
  });
  const toTop = (1 - enter) * (HEIGHT + getSafeSpace("square"));
  const toLeft = exit * -width;

  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div
        style={{
          ...layout,
          backgroundImage: `linear-gradient(to bottom,${gradientSteps
            .map((g, i) => {
              return `hsla(0, 0%, 100%, ${g}) ${
                (gradientOpacities[i] as number) * globalGradientOpacity
              }%`;
            })
            .join(", ")}, hsl(0, 0%, 100%) 100%)`,
          position: "absolute",
          opacity: (enter - exit) * 0.2,
        }}
      />
      <div style={{ ...layout, position: "absolute", overflow: "hidden" }}>
        <div
          style={{
            color: "white",
            padding: "0 30px",
            background: "black",
            position: "absolute",
            top: top + toTop,
            height: HEIGHT,
            left: getSafeSpace("square"),
            borderRadius,
            fontSize: 40,
            ...TITLE_FONT,
            display: "flex",
            alignItems: "center",
            transform: `translateX(${toLeft}px)`,
          }}
        >
          {title}
        </div>{" "}
      </div>
    </AbsoluteFill>
  );
};
