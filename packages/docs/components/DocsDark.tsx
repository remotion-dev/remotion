import { useColorMode } from "@docusaurus/theme-common";
import React, { useEffect, useMemo, useRef } from "react";
import { useMobileLayout } from "../src/helpers/mobile-layout";
import { Spacer } from "./layout/Spacer";

export const AnimatingProperties: React.FC = () => {
  const { colorMode } = useColorMode();
  const mobile = useMobileLayout();

  const ref1 = useRef<HTMLVideoElement>(null);
  const ref2 = useRef<HTMLVideoElement>(null);

  const style: React.CSSProperties = useMemo(
    () => ({
      display: "flex",
      flexDirection: mobile ? "column" : "row",
    }),
    [mobile]
  );

  const videoContainer: React.CSSProperties = useMemo(() => {
    return {
      border:
        "1px solid " +
        (colorMode === "dark"
          ? "transparent"
          : "var(--ifm-color-emphasis-300)"),
      flex: mobile ? 0 : 1,
      display: "block",
      overflow: "hidden",
      borderRadius: "var(--ifm-code-border-radius)",
      aspectRatio: "16/9",
    };
  }, [colorMode, mobile]);

  useEffect(() => {
    Promise.all([
      new Promise<void>((resolve) => {
        ref1.current.addEventListener("loadeddata", () => resolve(), {
          once: true,
        });
      }),
      new Promise<void>((resolve) => {
        ref2.current.addEventListener("loadeddata", () => resolve(), {
          once: true,
        });
      }),
    ]).then(() => {
      ref1.current.play();
      ref2.current.play();
    });
  }, [colorMode]);

  return (
    <div style={style}>
      <div style={videoContainer}>
        <video
          ref={ref1}
          src={
            colorMode === "dark"
              ? "/img/animating-properties-left-dark.mp4"
              : "/img/animating-properties-left-light.mp4"
          }
          muted
          loop
        />
      </div>
      <Spacer />
      <Spacer />
      <div style={videoContainer}>
        <video
          ref={ref2}
          src={
            colorMode === "dark"
              ? "/img/animating-properties-right-dark.mp4"
              : "/img/animating-properties-right-light.mp4"
          }
          muted
          loop
        />
      </div>
    </div>
  );
};
