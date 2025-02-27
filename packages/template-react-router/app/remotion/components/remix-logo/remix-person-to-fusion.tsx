import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { RemixLetter } from "./remix-letter";

interface Props {
  horizontalOffset?: number;
  progressOverride?: number;
}

export const RemixPersonToFusion = ({
  horizontalOffset,
  progressOverride,
}: Props) => {
  const { fps } = useVideoConfig();
  const frame = useCurrentFrame();

  const progress = spring({
    fps,
    frame,
    config: {
      damping: 200,
    },
  });

  const progressToUse = progressOverride ?? progress;

  const mHorizontalPosition = interpolate(progressToUse, [0, 1], [210, 400]);
  const mVerticalPosition = interpolate(
    progressToUse,
    [0, 0.5, 1],
    [208, 160, 208],
  );
  const mRotation = interpolate(progressToUse, [0, 1], [90, 270]);

  return (
    <AbsoluteFill
      style={{
        display: "flex",
        left: `calc(16% + ${horizontalOffset}px)`,
        top: "7%",
        transform: "scale(1)",
      }}
    >
      <RemixLetter letterValue="R" marginLeft={320} marginTop={411} />
      <RemixLetter letterValue="e" marginLeft={320} marginTop={220} />
      <RemixLetter
        letterValue="m"
        marginLeft={mHorizontalPosition}
        marginTop={mVerticalPosition}
        rotation={mRotation}
      />
      <RemixLetter
        letterValue="i"
        marginLeft={320}
        marginTop={255}
        rotation={90}
      />
      <RemixLetter letterValue="x" marginLeft={324} marginTop={324} />
    </AbsoluteFill>
  );
};
