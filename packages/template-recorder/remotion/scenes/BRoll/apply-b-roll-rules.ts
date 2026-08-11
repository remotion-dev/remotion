import type { BRollWithDimensions } from "../../../config/scenes";
import { SCENE_TRANSITION_DURATION } from "../../../config/transitions";

const ensureNoBRollOverlaps = (
  bRollsEnsureSceneEnds: BRollWithDimensions[],
): BRollWithDimensions[] => {
  let neededToCorrect = false;

  const corrected = bRollsEnsureSceneEnds.map((bRoll, i) => {
    const endPosition = bRoll.from + bRoll.durationInFrames;
    const laterBRolls = bRollsEnsureSceneEnds.slice(i + 1);
    const overlappingBRolls = laterBRolls
      .filter((laterRoll) => {
        return laterRoll.from < endPosition;
      })
      .map((laterBRoll) => {
        return laterBRoll.from + laterBRoll.durationInFrames;
      })
      .filter((laterBRollEndPosition) => {
        return laterBRollEndPosition > endPosition && bRoll.from;
      });

    if (overlappingBRolls.length === 0) {
      return bRoll;
    }

    neededToCorrect = true;

    const actualEndPosition = Math.max(...overlappingBRolls);
    return {
      ...bRoll,
      durationInFrames: actualEndPosition - bRoll.from,
    };
  });
  if (neededToCorrect) {
    return ensureNoBRollOverlaps(corrected);
  }

  return corrected;
};

export const applyBRollRules = ({
  bRolls,
  sceneDurationInFrames,
  willTransitionToNextScene,
}: {
  bRolls: BRollWithDimensions[];
  sceneDurationInFrames: number;
  willTransitionToNextScene: boolean;
}): BRollWithDimensions[] => {
  // The algorithm assumes the b-rolls are sorted by their start time
  const sortedBRolls = bRolls.sort((a, b) => a.from - b.from);

  // First rule: A b-roll must finish before the scene ends
  // and must allow for enough times to transition to the next scene
  // and hide itself

  // The hide animation is already included in the b-roll duration
  // we don't need to subtract it.

  const mustEndAt =
    sceneDurationInFrames -
    (willTransitionToNextScene ? SCENE_TRANSITION_DURATION : 0);

  const bRollsEnsureSceneEnds = sortedBRolls.map((bRoll) => {
    if (bRoll.from + bRoll.durationInFrames > mustEndAt) {
      return {
        ...bRoll,
        durationInFrames: mustEndAt - bRoll.from,
      };
    }

    return bRoll;
  });

  // Second rule: If another b-roll overlaps the current one,
  // the current one must stay at least as long
  const bRollsEnsureNoOverlap = ensureNoBRollOverlaps(bRollsEnsureSceneEnds);

  return bRollsEnsureNoOverlap;
};
