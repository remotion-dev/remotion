import React from "react";
import {
  AbsoluteFill,
  Easing,
  Interactive,
  interpolate,
  Sequence,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Background } from "./Background";
import { FeatureCards } from "./FeatureCards";

export const Launch: React.FC<{
  title: string;
  subtitle: string;
  accent: string;
}> = ({ title, subtitle, accent }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill style={{ fontFamily: "sans-serif", color: "white" }}>
      <Background accent={accent} />
      <Sequence name="Intro" durationInFrames={150}>
        <Interactive.H1
          name="Title"
          style={{
            position: "absolute",
            left: 80,
            top: 140,
            margin: 0,
            fontSize: 84,
            fontWeight: 800,
            letterSpacing: -2,
            lineHeight: 1,
            maxWidth: 900,
            opacity: interpolate(frame, [0, 15], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
            scale: interpolate(frame, [0, fps], [0.9, 1], {
              easing: Easing.out(Easing.cubic),
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
            transformOrigin: "0% 50%",
          }}
        >
          {title}
        </Interactive.H1>
        <Interactive.P
          name="Subtitle"
          style={{
            position: "absolute",
            left: 80,
            top: 300,
            margin: 0,
            fontSize: 30,
            color: accent,
            fontWeight: 500,
            opacity: interpolate(frame, [10, 25], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
            translate: interpolate(frame, [10, 40], ["0px 24px", "0px 0px"], {
              easing: Easing.out(Easing.cubic),
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
          }}
        >
          {subtitle}
        </Interactive.P>
      </Sequence>
      <Sequence name="Features" from={40}>
        <FeatureCards accent={accent} />
      </Sequence>
      <Sequence name="Badge" from={100}>
        <Interactive.Div
          name="Remotion badge"
          style={{
            position: "absolute",
            right: 80,
            top: 140,
            padding: "10px 18px",
            borderRadius: 999,
            border: "1px solid rgba(255,255,255,0.2)",
            fontSize: 20,
            fontWeight: 600,
            backgroundColor: "rgba(255,255,255,0.08)",
            rotate: interpolate(frame, [0, 30], ["-12deg", "0deg"], {
              easing: Easing.out(Easing.back(1.5)),
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
            scale: interpolate(frame, [0, 30], [0, 1], {
              easing: Easing.out(Easing.back(1.5)),
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
          }}
        >
          Made with Remotion
        </Interactive.Div>
      </Sequence>
    </AbsoluteFill>
  );
};
