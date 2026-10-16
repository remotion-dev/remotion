import {
  Easing,
  Interactive,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

export const LowerThird = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  return (
    <div
      style={{
        width: 560,
        height: 150,
        position: "relative",
        fontFamily: "Arial, sans-serif",
        color: "#ffffff",
      }}
    >
      <Interactive.Div
        name="Name bar"
        cropRight={interpolate(
          frame,
          [0, 20, durationInFrames - 24, durationInFrames - 4],
          [1, 0, 0, 1],
          {
            easing: Easing.bezier(0.65, 0, 0.35, 1),
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          },
        )}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: 560,
          height: 86,
          boxSizing: "border-box",
          padding: "20px 30px",
          backgroundColor: "#174c3c",
          color: "#ffffff",
          fontSize: 40,
          fontWeight: 700,
          lineHeight: 1.15,
          whiteSpace: "nowrap",
        }}
      >
        Alex Morgan
      </Interactive.Div>
      <Interactive.Div
        name="Role bar"
        cropRight={interpolate(
          frame,
          [4, 24, durationInFrames - 28, durationInFrames - 8],
          [1, 0, 0, 1],
          {
            easing: Easing.bezier(0.65, 0, 0.35, 1),
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          },
        )}
        style={{
          position: "absolute",
          top: 86,
          left: 0,
          width: 430,
          height: 64,
          boxSizing: "border-box",
          padding: "18px 30px",
          backgroundColor: "#ffffff",
          color: "#174c3c",
          fontSize: 25,
          fontWeight: 500,
          lineHeight: 1.1,
          whiteSpace: "nowrap",
        }}
      >
        Designer & storyteller
      </Interactive.Div>
    </div>
  );
};
