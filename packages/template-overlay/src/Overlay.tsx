import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import React, { useMemo } from "react";
import { loadFont } from "@remotion/google-fonts/Roboto";

const { fontFamily } = loadFont();

const title: React.CSSProperties = {
  fontFamily,
  fontSize: 80,
  fontWeight: "bold",
};

const text: React.CSSProperties = {
  fontWeight: "bold",
  fontFamily,
  fontSize: 40,
  color: "#4290F5",
};

const disappearBeforeEnd = 20;

export const Overlay: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const scale = spring({
    fps,
    frame,
    config: {
      mass: 0.5,
    },
  });

  const out = spring({
    fps,
    frame: frame - durationInFrames + disappearBeforeEnd,
    config: {
      damping: 200,
    },
    durationInFrames: disappearBeforeEnd,
  });

  const rotate = interpolate(out, [0, 1], [0, -Math.PI / 20]);
  const outY = interpolate(out, [0, 1], [0, -500]);

  const container: React.CSSProperties = useMemo(() => {
    return {
      position: "absolute",
      backgroundColor: "white",
      borderRadius: 25,
      right: 90,
      top: 90,
      scale: String(scale),
      translate: `0 ${outY}px`,
      rotate: `${rotate}rad`,
      padding: 40,
    };
  }, [scale, outY, rotate]);

  return (
    <AbsoluteFill>
      <div style={container}>
        <div style={title}>Look</div>
        <div style={text}>I&apos;m an overlay!</div>
      </div>
    </AbsoluteFill>
  );
};
