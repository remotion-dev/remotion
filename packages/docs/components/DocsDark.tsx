import { useColorMode } from "@docusaurus/theme-common";
import { PlayerInternals } from "@remotion/player";
import React, { useEffect, useMemo, useRef } from "react";
import { Spacer } from "./layout/Spacer";

export const SingleVideoDemo: React.FC<{
  dark: string;
  light: string;
}> = ({ dark, light }) => {
  const { colorMode } = useColorMode();

  const container = useRef<HTMLDivElement>(null);
  const ref1 = useRef<HTMLVideoElement>(null);

  const style: React.CSSProperties = useMemo(
    () => ({
      display: "flex",
    }),
    []
  );

  const videoContainer: React.CSSProperties = useMemo(() => {
    return {
      border:
        "1px solid " +
        (colorMode === "dark"
          ? "transparent"
          : "var(--ifm-color-emphasis-300)"),
      flex: 1,
      display: "block",
      overflow: "hidden",
      borderRadius: "var(--ifm-code-border-radius)",
    };
  }, [colorMode]);

  useEffect(() => {
    ref1.current.addEventListener(
      "progress",
      () => {
        ref1.current.play();
      },
      {
        once: true,
      }
    );
  }, [colorMode]);

  return (
    <div ref={container} style={style}>
      <div style={videoContainer}>
        <video
          ref={ref1}
          preload="metadata"
          src={colorMode === "dark" ? dark : light}
          muted
          loop
          playsInline
        />
      </div>
    </div>
  );
};

export const DualVideoDemo: React.FC<{
  leftDark: string;
  leftLight: string;
  rightDark: string;
  rightLight: string;
}> = ({ leftDark, leftLight, rightDark, rightLight }) => {
  const { colorMode } = useColorMode();

  const container = useRef<HTMLDivElement>(null);
  const ref1 = useRef<HTMLVideoElement>(null);
  const ref2 = useRef<HTMLVideoElement>(null);

  const size = PlayerInternals.useElementSize(container, {
    triggerOnWindowResize: false,
    shouldApplyCssTransforms: true,
  });

  const mobile = size?.width < 700;

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
        ref1.current.addEventListener("progress", () => resolve(), {
          once: true,
        });
      }),
      new Promise<void>((resolve) => {
        ref2.current.addEventListener("progress", () => resolve(), {
          once: true,
        });
      }),
    ]).then(() => {
      ref1.current.play();
      ref2.current.play();
    });
  }, [colorMode]);

  return (
    <div ref={container} style={style}>
      <div style={videoContainer}>
        <video
          ref={ref1}
          preload="metadata"
          src={colorMode === "dark" ? leftDark : leftLight}
          muted
          loop
          playsInline
        />
      </div>
      <Spacer />
      <Spacer />
      <div style={videoContainer}>
        <video
          ref={ref2}
          preload="metadata"
          src={colorMode === "dark" ? rightDark : rightLight}
          muted
          loop
          playsInline
        />
      </div>
    </div>
  );
};

export const AnimatingProperties: React.FC = () => {
  return (
    <div>
      <DualVideoDemo
        leftDark="/img/animating-properties-left-dark.mp4"
        leftLight="/img/animating-properties-left-light.mp4"
        rightDark="/img/animating-properties-right-dark.mp4"
        rightLight="/img/animating-properties-right-light.mp4"
      />
    </div>
  );
};

export const Springs: React.FC = () => {
  return (
    <div>
      <DualVideoDemo
        leftDark="/img/spring-left-dark.mp4"
        leftLight="/img/spring-left-light.mp4"
        rightDark="/img/spring-right-dark.mp4"
        rightLight="/img/spring-right-light.mp4"
      />
    </div>
  );
};

export const Transforms: React.FC = () => {
  return (
    <div>
      <SingleVideoDemo
        dark="/img/transforms-dark.mp4"
        light="/img/transforms-light.mp4"
      />
    </div>
  );
};
