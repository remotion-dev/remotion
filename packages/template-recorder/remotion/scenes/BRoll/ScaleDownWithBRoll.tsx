import React, { useMemo } from "react";
import { AbsoluteFill, spring, useVideoConfig } from "remotion";
import type { BRoll } from "../../../config/scenes";
import { B_ROLL_TRANSITION_DURATION } from "../../../config/transitions";
import type { BRollType } from "../../layout/layout-types";

// A value of 0.1 means that the original
// video only has a 90% of its original size
// when a b-roll is shown
const SCALE_DOWN = 0.1;

type Props = {
  bRolls: BRoll[];
  frame: number;
  children: React.ReactNode;
};

const ScaleDownWithBRoll: React.FC<Props> = ({ bRolls, frame, children }) => {
  const { fps } = useVideoConfig();

  const springs = bRolls.map((roll) => {
    const enter = spring({
      fps,
      frame,
      config: {
        damping: 200,
      },
      delay: roll.from,
      durationInFrames: B_ROLL_TRANSITION_DURATION,
    });
    const exit = spring({
      fps,
      frame,
      config: {
        damping: 200,
      },
      delay: roll.from + roll.durationInFrames - B_ROLL_TRANSITION_DURATION,
      durationInFrames: B_ROLL_TRANSITION_DURATION,
    });
    return enter - exit;
  }, []);

  const scale = useMemo(() => {
    return springs.reduce((acc, instance) => {
      return acc - instance * SCALE_DOWN;
    }, 1);
  }, [springs]);

  const style: React.CSSProperties = useMemo(() => {
    return {
      scale: String(scale),
      justifyContent: "center",
      alignItems: "center",
    };
  }, [scale]);

  return <AbsoluteFill style={style}>{children}</AbsoluteFill>;
};

export const ScaleDownIfBRollRequiresIt: React.FC<
  Props & {
    bRollType: BRollType;
  }
> = ({ bRollType, bRolls, frame, children }) => {
  if (bRollType !== "scale") {
    return <>{children}</>;
  }

  return (
    <ScaleDownWithBRoll bRolls={bRolls} frame={frame}>
      {children}
    </ScaleDownWithBRoll>
  );
};
