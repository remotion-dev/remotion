import { useColorMode } from "@docusaurus/theme-common";
import { getBoundingBox, parsePath, resetPath } from "@remotion/paths";
import { Player } from "@remotion/player";
import { makeTriangle } from "@remotion/shapes";
import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
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

const InFrameLogo: React.FC<{
  background: string;
}> = ({ background }) => {
  const { width: bBoxWidth, height: bBoxHeight, fps } = useVideoConfig();
  const viewBox = [-bBoxWidth / 2, -bBoxHeight / 2, bBoxWidth, bBoxHeight].join(
    " "
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

    const color = i === 2 ? "#E9F3FD" : i === 1 ? "#C1DBF9" : "#0b84f3";

    const extruded = extrudeElement({
      backFaceColor: color,
      sideColor: "black",
      frontFaceColor: color,
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

const gradientSteps = [
  0, 0.013, 0.049, 0.104, 0.175, 0.259, 0.352, 0.45, 0.55, 0.648, 0.741, 0.825,
  0.896, 0.951, 0.987,
];

const gradientOpacities = [
  0, 8.1, 15.5, 22.5, 29, 35.3, 41.2, 47.1, 52.9, 58.8, 64.7, 71, 77.5, 84.5,
  91.9,
];

const globalGradientOpacity = 1;

const inputProps = {};

export const DoMoreHero: React.FC = () => {
  const { colorMode } = useColorMode();

  const targetColor =
    colorMode === "dark" ? "hsl(240deg, 4%, 11%)" : "hsl(0, 0%, 100%)";

  const steps =
    colorMode === "dark"
      ? gradientSteps
          .map((g, i) => {
            return `hsla(240deg, 4%, 11%, ${g}) ${
              gradientOpacities[i] * globalGradientOpacity
            }%`;
          })
          .join(", ")
      : gradientSteps
          .map((g, i) => {
            return `hsla(0, 0%, 100%, ${g}) ${
              gradientOpacities[i] * globalGradientOpacity
            }%`;
          })
          .join(", ");

  return (
    <div
      style={{
        position: "relative",
      }}
    >
      <Player
        component={InFrameLogo}
        compositionWidth={1920 * 2}
        compositionHeight={1080 * 1.4}
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
        style={{
          height: "20vw",
          marginTop: "-20vw",
          width: "100%",
          position: "absolute",
          backgroundImage: `linear-gradient(to bottom, ${steps}, ${targetColor} 100%)`,
        }}
      />
    </div>
  );
};
