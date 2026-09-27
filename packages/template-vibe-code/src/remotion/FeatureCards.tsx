import React from "react";
import {
  Easing,
  Interactive,
  interpolate,
  Sequence,
  useCurrentFrame,
} from "remotion";

const features = [
  { title: "Code", body: "Write React, see it live" },
  { title: "Canvas", body: "Select and inspect layers" },
  { title: "Timeline", body: "Trim, move and split" },
];

const Card: React.FC<{
  title: string;
  body: string;
  index: number;
  accent: string;
}> = ({ title, body, index, accent }) => {
  const frame = useCurrentFrame();

  return (
    <Interactive.Div
      name={title}
      style={{
        width: 340,
        padding: 24,
        borderRadius: 16,
        backgroundColor: "rgba(255, 255, 255, 0.06)",
        border: "1px solid rgba(255, 255, 255, 0.12)",
        color: "white",
        fontFamily: "sans-serif",
        opacity: interpolate(frame, [0, 15], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        }),
        translate: interpolate(frame, [0, 30], ["0px 60px", "0px 0px"], {
          easing: Easing.out(Easing.cubic),
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        }),
      }}
    >
      <div style={{ fontSize: 14, color: accent, fontWeight: 700 }}>
        0{index + 1}
      </div>
      <div style={{ fontSize: 28, fontWeight: 700, marginTop: 8 }}>{title}</div>
      <div style={{ fontSize: 18, opacity: 0.7, marginTop: 6 }}>{body}</div>
    </Interactive.Div>
  );
};

export const FeatureCards: React.FC<{ accent: string }> = ({ accent }) => {
  return (
    <Interactive.Div
      name="Feature cards"
      style={{
        position: "absolute",
        left: 80,
        top: 400,
        display: "flex",
        gap: 24,
      }}
    >
      {features.map((feature, index) => (
        // Stagger the cards by delaying each one a few frames.
        <Sequence key={feature.title} from={index * 6} layout="none">
          <Card
            title={feature.title}
            body={feature.body}
            index={index}
            accent={accent}
          />
        </Sequence>
      ))}
    </Interactive.Div>
  );
};
