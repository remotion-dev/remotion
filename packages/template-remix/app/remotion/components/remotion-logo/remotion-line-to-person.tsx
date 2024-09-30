import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { E } from "./e";
import { FirstO } from "./first-o";
import { I } from "./i";
import { M } from "./m";
import { N } from "./n";
import { R } from "./r";
import { SecondO } from "./second-o";
import { T } from "./t";

interface Props {
  horizontalOffset?: number;
}

export const RemotionLineToPerson = ({ horizontalOffset = 0 }: Props) => {
  const { fps } = useVideoConfig();
  const frame = useCurrentFrame();

  const progress = spring({
    fps,
    frame,
    config: {
      damping: 200,
    },
  });

  const tHorizontalPosition = interpolate(progress, [0, 1], [0, -810]);

  const iHorizontalPosition = interpolate(progress, [0, 1], [0, -798]);

  const nHorizontalPosition = interpolate(progress, [0, 1], [0, -1140]);
  const nVerticalPosition = interpolate(progress, [0, 1], [0, -100]);

  const rHorizontalPosition = interpolate(progress, [0, 1], [0, -80]);
  const rVerticalPosition = interpolate(progress, [0, 1], [0, -260]);

  const firstOHorizontalPosition = interpolate(progress, [0, 1], [0, -650]);
  const firstOVerticalPosition = interpolate(progress, [0, 1], [0, -440]);

  const secondOHorizontalPosition = interpolate(progress, [0, 1], [0, -982]);
  const secondOVerticalPosition = interpolate(progress, [0, 1], [0, -440]);

  const eHorizontalPosition = interpolate(progress, [0, 1], [0, -212]);
  const eVerticalPosition = interpolate(progress, [0, 1], [0, -107]);

  const mHorizontalPosition = interpolate(progress, [0, 1], [0, -140]);
  const mVerticalPosition = interpolate(progress, [0, 1], [0, -566]);
  const mRotation = interpolate(progress, [0, 1], [0, -90]);

  return (
    <AbsoluteFill
      style={{
        display: "flex",
        left: `calc(16% + ${horizontalOffset}px)`,
        top: "7%",
        transform: "scale(0.45)",
      }}
    >
      <R marginLeft={rHorizontalPosition} marginTop={rVerticalPosition} />
      <E marginLeft={eHorizontalPosition} marginTop={eVerticalPosition} />
      <M
        marginLeft={mHorizontalPosition}
        marginTop={mVerticalPosition}
        rotation={mRotation}
      />
      <FirstO
        marginLeft={firstOHorizontalPosition}
        marginTop={firstOVerticalPosition}
      />
      <T marginLeft={tHorizontalPosition} />
      <I marginLeft={iHorizontalPosition} />
      <SecondO
        marginLeft={secondOHorizontalPosition}
        marginTop={secondOVerticalPosition}
      />
      <N marginLeft={nHorizontalPosition} marginTop={nVerticalPosition} />
    </AbsoluteFill>
  );
};
