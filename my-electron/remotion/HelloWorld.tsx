import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import type {HelloWorldProps} from "./types";

export const HelloWorld: React.FC<HelloWorldProps> = ({titleText}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const scale = spring({
    fps,
    frame,
    config: {
      damping: 14,
      stiffness: 120,
    },
  });
  const opacity = interpolate(frame, [0, 18], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const translateY = interpolate(frame, [0, 24], [36, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#1f2428",
        color: "white",
        fontFamily:
          '"SFMono-Regular", "Roboto Mono", "Menlo", "Monaco", "Liberation Mono", "Courier New", monospace',
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundColor: "#1f2428",
        }}
      />
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          padding: "72px 82px",
          justifyContent: "center",
          alignItems: "center",
          transform: `translateY(${translateY}px) scale(${scale})`,
          opacity,
        }}
      >
        <div
          style={{
            width: 960,
            border: "1px solid #000000",
            backgroundColor: "#1f2428",
            padding: "54px 58px",
            boxShadow: "0 18px 40px rgba(0, 0, 0, 0.35)",
            display: "flex",
            alignItems: "center",
            minHeight: 360,
          }}
        >
          <div
            style={{
              fontSize: 82,
              lineHeight: 0.98,
              fontWeight: 600,
              maxWidth: 760,
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
              overflowWrap: "anywhere",
            }}
          >
            {titleText}
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
