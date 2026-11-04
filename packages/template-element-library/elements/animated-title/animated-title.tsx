import {
  Easing,
  Interactive,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

export const AnimatedTitle = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  return (
    <Interactive.Div
      name="Title"
      style={{
        width: 760,
        height: 180,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        fontFamily: "Arial, sans-serif",
        fontSize: 104,
        fontWeight: 700,
        letterSpacing: -4,
        lineHeight: 1.1,
        whiteSpace: "nowrap",
        color: "#202020",
        translate: interpolate(
          frame,
          [0, 24, durationInFrames - 20, durationInFrames - 1],
          ["0px 24px", "0px 0px", "0px 0px", "0px -16px"],
          {
            easing: Easing.bezier(0.22, 1, 0.36, 1),
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          },
        ),
        scale: interpolate(frame, [0, 28], [0.96, 1], {
          easing: Easing.bezier(0.22, 1, 0.36, 1),
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        }),
        opacity: interpolate(
          frame,
          [0, 16, durationInFrames - 20, durationInFrames - 1],
          [0, 1, 1, 0],
          { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
        ),
      }}
    >
      Make it move.
    </Interactive.Div>
  );
};
