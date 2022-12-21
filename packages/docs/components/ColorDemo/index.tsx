import { parseToRgb } from "polished";
import React from "react";
import { AbsoluteFill, Sequence } from "remotion";
import { Big } from "./Big";
import { Shade } from "./ColorName";
import { Name } from "./Name";
import { Palette } from "./Palette";
import { Colors } from "./RGBColors";

export type ColorDemoProps = {
  color: string;
  username: string;
};

export const ColorDemo: React.FC<ColorDemoProps> = ({ color, username }) => {
  const isValid = (() => {
    try {
      parseToRgb(color);
      return true;
    } catch (err) {
      return false;
    }
  })();
  if (isValid === false) {
    return (
      <AbsoluteFill
        style={{
          justifyContent: "center",
          alignItems: "center",
          display: "flex",
          flex: 1,
          backgroundColor: "white",
          fontWeight: "bold",
          textAlign: "center",
        }}
      >
        <div style={{ fontFamily: "sans-serif", fontSize: 40 }}>
          Please pass a valid <br /> hex color code like #ffaa00
        </div>
      </AbsoluteFill>
    );
  }

  return (
    <AbsoluteFill>
      <Sequence from={0} durationInFrames={120}>
        <Name name={username} />
      </Sequence>
      <Sequence from={50} durationInFrames={140}>
        <Palette color={color} />
      </Sequence>
      <Sequence from={110} durationInFrames={80}>
        <Big color={color} />
      </Sequence>
      <Sequence from={190} durationInFrames={80}>
        <Colors color={color} />
      </Sequence>
      <Sequence from={270} durationInFrames={80}>
        <Shade color={color} />
      </Sequence>
    </AbsoluteFill>
  );
};
