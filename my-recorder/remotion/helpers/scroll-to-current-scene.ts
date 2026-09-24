// In the props editor, scroll to the current scene

import { focusDefaultPropsPath } from "@remotion/studio";
import { useEffect } from "react";
import { useCurrentFrame } from "remotion";

export const useScrollToCurrentScene = ({
  index,
  fullyEntered,
}: {
  index: number;
  fullyEntered: boolean;
}) => {
  const frame = useCurrentFrame();
  const isPremountingAndOrFirstFrame = frame === 0;

  useEffect(() => {
    if (isPremountingAndOrFirstFrame) {
      return;
    }

    if (!fullyEntered) {
      return;
    }

    // Reveal the current scene in the props editor
    focusDefaultPropsPath({
      path: ["scenes", index],
      scrollBehavior: "smooth",
    });
  }, [fullyEntered, index, isPremountingAndOrFirstFrame]);
};
