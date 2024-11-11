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
  progressOverride?: number;
}

export const RemotionPersonToFusion = ({
  horizontalOffset = 0,
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

  const tHorizontalPosition = -810;

  const iHorizontalPosition = -798;

  const nHorizontalPosition = -1140;
  const nVerticalPosition = -100;

  const rHorizontalPosition = -80;
  const rVerticalPosition = -260;

  const firstOHorizontalPosition = -650;
  const firstOVerticalPosition = -440;

  const secondOHorizontalPosition = -982;
  const secondOVerticalPosition = -440;

  const eHorizontalPosition = -212;
  const eVerticalPosition = -107;

  const mHorizontalPosition = interpolate(progressToUse, [0, 1], [-140, -760]);
  const mVerticalPosition = interpolate(
    progressToUse,
    [0, 0.25, 0.75, 1],
    [-566, -790, -790, -566],
  );
  const mRotation = interpolate(progressToUse, [0, 1], [-90, -270]);

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
