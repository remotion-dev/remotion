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
}

export const RemixLineToPerson = ({ horizontalOffset }: Props) => {
  const { fps } = useVideoConfig();
  const frame = useCurrentFrame();

  const progress = spring({
    fps,
    frame,
    config: {
      damping: 200,
    },
  });

  const rHorizontalPosition = interpolate(progress, [0, 1], [0, 320]);

  const xHorizontalPosition = interpolate(progress, [0, 1], [290, 324]);
  const xVerticalPosition = interpolate(progress, [0, 1], [411, 324]);

  const iHorizontalPosition = interpolate(progress, [0, 1], [257, 320]);
  const iVerticalPosition = interpolate(progress, [0, 1], [411, 255]);
  const iRotation = interpolate(progress, [0, 1], [0, 90]);

  const eHorizontalPosition = interpolate(progress, [0, 1], [82, 320]);
  const eVerticalPosition = interpolate(progress, [0, 1], [411, 220]);

  const mHorizontalPosition = interpolate(progress, [0, 1], [148, 210]);
  const mVerticalPosition = interpolate(progress, [0, 1], [410, 208]);
  const mRotation = interpolate(progress, [0, 1], [0, 90]);

  return (
    <AbsoluteFill
      style={{
        display: "flex",
        left: `calc(16% + ${horizontalOffset}px)`,
        top: "7%",
        transform: "scale(1)",
      }}
    >
      <RemixLetter
        letterValue="R"
        marginLeft={rHorizontalPosition}
        marginTop={411}
      />
      <RemixLetter
        letterValue="e"
        marginLeft={eHorizontalPosition}
        marginTop={eVerticalPosition}
      />
      <RemixLetter
        letterValue="m"
        marginLeft={mHorizontalPosition}
        marginTop={mVerticalPosition}
        rotation={mRotation}
      />
      <RemixLetter
        letterValue="i"
        marginLeft={iHorizontalPosition}
        marginTop={iVerticalPosition}
        rotation={iRotation}
      />
      <RemixLetter
        letterValue="x"
        marginLeft={xHorizontalPosition}
        marginTop={xVerticalPosition}
      />
    </AbsoluteFill>
  );
};
