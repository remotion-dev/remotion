import React, { useMemo } from "react";
import { OffthreadVideo, useCurrentFrame, useVideoConfig } from "remotion";
import type { CanvasLayout } from "../../../config/layout";
import type {
  SceneAndMetadata,
  VideoSceneAndMetadata,
} from "../../../config/scenes";
import { getDisplayPosition } from "../../animations/display-transitions";
import { BRollStack } from "../BRoll/BRollStack";
import { ScaleDownIfBRollRequiresIt } from "../BRoll/ScaleDownWithBRoll";

const outer: React.CSSProperties = {
  position: "absolute",
  display: "flex",
};

export const Display: React.FC<{
  scene: VideoSceneAndMetadata;
  enterProgress: number;
  exitProgress: number;
  nextScene: SceneAndMetadata | null;
  previousScene: SceneAndMetadata | null;
  startFrame: number;
  endAt: number | undefined;
  canvasLayout: CanvasLayout;
}> = ({
  scene,
  enterProgress,
  exitProgress,
  nextScene,
  canvasLayout,
  previousScene,
  endAt,
  startFrame,
}) => {
  if (scene.layout.displayLayout === null) {
    throw new Error("No display");
  }

  if (scene.cameras.display === null) {
    throw new Error("No display");
  }

  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();

  const displayLayout = useMemo(() => {
    return getDisplayPosition({
      enterProgress,
      exitProgress,
      canvasWidth: width,
      nextScene,
      previousScene,
      currentScene: scene,
      canvasHeight: height,
      canvasLayout,
    });
  }, [
    canvasLayout,
    enterProgress,
    exitProgress,
    height,
    nextScene,
    previousScene,
    scene,
    width,
  ]);

  const container: React.CSSProperties = useMemo(() => {
    return {
      position: "absolute",
      ...displayLayout,
    };
  }, [displayLayout]);

  return (
    <div style={outer}>
      <div style={container}>
        <ScaleDownIfBRollRequiresIt
          bRolls={scene.bRolls}
          bRollType={scene.layout.bRollType}
          frame={frame}
        >
          <OffthreadVideo
            startFrom={startFrame}
            endAt={endAt}
            src={scene.cameras.display.src}
            style={{
              width: displayLayout.width,
              height: displayLayout.height,
              borderRadius: displayLayout.borderRadius,
              objectFit: "cover",
            }}
          />
        </ScaleDownIfBRollRequiresIt>
      </div>

      <BRollStack
        bRollEnterDirection={scene.layout.bRollEnterDirection}
        bRolls={scene.bRolls}
        bRollLayout={scene.layout.bRollLayout}
        canvasLayout={canvasLayout}
      />
    </div>
  );
};
