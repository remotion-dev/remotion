import { useColorMode } from "@docusaurus/theme-common";
import { Player } from "@remotion/player";
import React, { useCallback, useMemo, useState } from "react";
import { AbsoluteFill } from "remotion";
import { Control } from "./control";
import styles from "./styles.module.css";
import type { DemoType } from "./types";
import {
  circleDemo,
  clockWipePresentationDemo,
  customPresentationDemo,
  customTimingDemo,
  ellipseDemo,
  fadePresentationDemo,
  flipPresentationDemo,
  noiseDemo,
  opacityDemo,
  pieDemo,
  polygonDemo,
  rectDemo,
  rotateDemo,
  scaleDemo,
  skewDemo,
  slidePresentationDemo,
  slidePresentationDemoLongThreshold,
  starDemo,
  translateDemo,
  triangleDemo,
  wipePresentationDemo,
} from "./types";

const container: React.CSSProperties = {
  overflow: "hidden",
  width: "100%",
  border: "1px solid var(--ifm-color-emphasis-300)",
  borderRadius: "var(--ifm-pre-border-radius)",
  marginBottom: 40,
};

const demos: DemoType[] = [
  noiseDemo,
  triangleDemo,
  rectDemo,
  circleDemo,
  ellipseDemo,
  starDemo,
  polygonDemo,
  pieDemo,
  translateDemo,
  skewDemo,
  rotateDemo,
  scaleDemo,
  opacityDemo,
  fadePresentationDemo,
  wipePresentationDemo,
  slidePresentationDemo,
  slidePresentationDemoLongThreshold,
  flipPresentationDemo,
  customPresentationDemo,
  customTimingDemo,
  clockWipePresentationDemo,
];

export const Demo: React.FC<{
  type: string;
}> = ({ type }) => {
  const demo = demos.find((d) => d.id === type);
  const { colorMode } = useColorMode();

  const [key, setKey] = useState(() => 0);

  const initialState = useMemo(() => {
    return demo.options
      .map(
        (o) =>
          [
            o.name,
            o.optional === "default-disabled" ? null : o.default,
          ] as const,
      )
      .reduce((a, b) => {
        a[b[0]] = b[1];
        return a;
      }, {});
  }, [demo.options]);

  const [state, setState] = useState(() => initialState);

  const restart = useCallback(() => {
    setState(initialState);
    setKey((k) => k + 1);
  }, [initialState]);

  if (!demo) {
    throw new Error("Demo not found");
  }

  return (
    <div style={container}>
      <Player
        key={key}
        component={demo.comp}
        compositionWidth={demo.compWidth}
        compositionHeight={demo.compHeight}
        durationInFrames={demo.durationInFrames}
        fps={demo.fps}
        style={{
          width: "100%",
          aspectRatio: demo.compWidth / demo.compHeight,
          borderBottom:
            demo.options.length > 0
              ? "1px solid var(--ifm-color-emphasis-300)"
              : 0,
        }}
        errorFallback={({ error }) => {
          return (
            <AbsoluteFill
              style={{
                justifyContent: "center",
                alignItems: "center",
                fontSize: 30,
                textAlign: "center",
                lineHeight: 1.5,
              }}
            >
              {error.message}
              <br />
              <button
                style={{
                  fontSize: 30,
                }}
                onClick={restart}
                type="button"
              >
                Restart
              </button>
            </AbsoluteFill>
          );
        }}
        inputProps={{ ...state, darkMode: colorMode === "dark" }}
        autoPlay={demo.autoPlay}
        loop
      />
      <div className={styles.containerrow}>
        {demo.options.map((option) => {
          return (
            <Control
              key={option.name}
              option={option}
              value={state[option.name]}
              setValue={(value) => {
                setState((s) => ({
                  ...s,
                  [option.name]: value,
                }));
              }}
            />
          );
        })}
      </div>
    </div>
  );
};
