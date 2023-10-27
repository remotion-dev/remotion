import { useColorMode } from "@docusaurus/theme-common";
import { getBoundingBox, parsePath, resetPath } from "@remotion/paths";
import { Player } from "@remotion/player";
import { makeTriangle } from "@remotion/shapes";
import React, { useMemo } from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { useMobileLayout } from "../../helpers/mobile-layout";
import { transformElement } from "./element";
import { Faces } from "./Faces";
import { extrudeElement } from "./join-inbetween-tiles";
import {
  rotateX,
  rotateY,
  rotateZ,
  scaled,
  translateX,
  translateY,
  translateZ,
} from "./matrix";
import styles from "./more.module.css";

const InFrameLogo: React.FC<{
  background: string;
  dark: boolean;
}> = ({ background, dark }) => {
  const { width: bBoxWidth, height: bBoxHeight, fps } = useVideoConfig();
  const viewBox = [-bBoxWidth / 2, -bBoxHeight / 2, bBoxWidth, bBoxHeight].join(
    " ",
  );
  const frame = useCurrentFrame();

  const zoomIn = (Math.sin(frame / 100) + 1) * 0.2;

  const delayedFrame = Math.max(frame - 80, 0);

  const paths = new Array(3).fill(true).map((_, i) => {
    const triangle = makeTriangle({
      direction: "right",
      length: 1500 + i * 675,
      edgeRoundness: 0.71,
    });
    const path = resetPath(triangle.path);
    const parsed = parsePath(path);

    const boundingBox = getBoundingBox(path);
    const width = boundingBox.x2 - boundingBox.x1;
    const height = boundingBox.y2 - boundingBox.y1;

    const depth = 20 * 7.5;
    const spread =
      depth +
      (Math.sin(frame / 200) +
        (1 +
          spring({
            frame,
            fps,
            config: {
              damping: 200,
            },
            durationInFrames: 200,
            delay: 80,
          }))) *
        500;

    const darkColor = i === 2 ? "#bbb" : i === 1 ? "#ddd" : "#fff";
    const color = i === 2 ? "#E9F3FD" : i === 1 ? "#C1DBF9" : "#0b84f3";

    const actualColor = dark ? darkColor : color;

    const extruded = extrudeElement({
      backFaceColor: actualColor,
      sideColor: "black",
      frontFaceColor: actualColor,
      depth,
      points: parsed,
      strokeWidth: 20,
      description: `triangle-${i}`,
      strokeColor: "black",
    });
    const projected = transformElement(extruded, [
      translateZ(spread * i - spread),
      translateX(-width / 2),
      translateY(-height / 2 + 20),
      rotateX(-(i * delayedFrame) / 300),
      rotateY(delayedFrame / 100),
      rotateZ(delayedFrame / 100),
      scaled(0.3 + zoomIn),
    ]);

    return projected;
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: background,
      }}
    >
      <svg
        viewBox={viewBox}
        style={{
          overflow: "visible",
          opacity: interpolate(frame, [0, 70], [0, 1]),
        }}
      >
        <Faces elements={paths.reverse()} />
      </svg>
    </AbsoluteFill>
  );
};

export const DoMoreHero: React.FC = () => {
  const mobile = useMobileLayout();
  const theme = useColorMode();

  const dimensions = mobile
    ? {
        width: 1080 * 2,
        height: 1920 * 0.8,
      }
    : {
        width: 1920 * 2,
        height: 1080 * 1.4,
      };

  const inputProps = useMemo(() => {
    return { dark: theme.colorMode === "dark" };
  }, [theme.colorMode]);

  return (
    <div
      style={{
        position: "relative",
      }}
    >
      <Player
        component={InFrameLogo}
        compositionWidth={dimensions.width}
        compositionHeight={dimensions.height}
        durationInFrames={100000}
        fps={30}
        loop
        autoPlay
        style={{
          width: "100%",
        }}
        inputProps={inputProps}
      />
      <div
        className={styles.gradient}
        style={{
          height: "20vw",
          marginTop: "-20vw",
          width: "100%",
          position: "absolute",
        }}
      />
    </div>
  );
};
