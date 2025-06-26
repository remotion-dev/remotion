import React, { useCallback, useMemo } from "react";
import {
  AbsoluteFill,
  getRemotionEnvironment,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import type { CanvasLayout } from "../../../config/layout";
import type {
  SceneAndMetadata,
  VideoSceneAndMetadata,
} from "../../../config/scenes";
import type { Theme } from "../../../config/themes";
import { B_ROLL_TRANSITION_DURATION } from "../../../config/transitions";
import { getShouldTransitionIn } from "../../animations/transitions";
import { BoxedCaptions } from "../../captions/boxed/BoxedCaptions";
import { SrtPreviewAndEditor } from "../../captions/srt/SrtPreviewAndEditor/SrtPreviewAndEditor";
import { LandscapeChapters } from "../../chapters/landscape/LandscapeChapters";
import type { ChapterType } from "../../chapters/make-chapters";
import { SquareChapter } from "../../chapters/square/SquareChapter";
import { Actions } from "./ActionOverlay/Actions";
import { Display } from "./Display";
import { onBRollDragOver, onBRollDropHandler } from "./DragDropBRoll";
import { Webcam } from "./Webcam";

export const VideoScene: React.FC<{
  enterProgress: number;
  exitProgress: number;
  canvasLayout: CanvasLayout;
  sceneAndMetadata: VideoSceneAndMetadata;
  nextScene: SceneAndMetadata | null;
  previousScene: SceneAndMetadata | null;
  theme: Theme;
  chapters: ChapterType[];
  sceneIndex: number;
  hovered: boolean;
}> = ({
  enterProgress,
  exitProgress,
  sceneAndMetadata,
  canvasLayout,
  nextScene,
  previousScene,
  theme,
  chapters,
  sceneIndex,
  hovered,
}) => {
  const startFrame = sceneAndMetadata.startFrame;
  const endAt = sceneAndMetadata.endFrame;

  if (sceneAndMetadata.type !== "video-scene") {
    throw new Error("Not a camera scene");
  }

  const didTransitionIn = getShouldTransitionIn({
    previousSceneAndMetadata: previousScene,
    sceneAndMetadata: sceneAndMetadata,
    canvasLayout,
  });

  const bRollsOnTopOfWebcam = useMemo(() => {
    if (sceneAndMetadata.cameras.display !== null) {
      return [];
    }
    return sceneAndMetadata.bRolls;
  }, [sceneAndMetadata.bRolls, sceneAndMetadata.cameras.display]);

  const { id } = useVideoConfig();
  const frame = useCurrentFrame();

  const onDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      onBRollDropHandler({
        e,
        composition: id,
        sceneIndex,
        from: frame - B_ROLL_TRANSITION_DURATION,
      });
    },
    [frame, id, sceneIndex],
  );

  return (
    <AbsoluteFill onDragOver={onBRollDragOver} onDrop={onDrop}>
      {sceneAndMetadata.cameras.display ? (
        <Display
          scene={sceneAndMetadata}
          enterProgress={enterProgress}
          exitProgress={exitProgress}
          nextScene={nextScene}
          previousScene={previousScene}
          startFrame={startFrame}
          endAt={endAt}
          canvasLayout={canvasLayout}
        />
      ) : null}
      <Webcam
        bRolls={bRollsOnTopOfWebcam}
        currentScene={sceneAndMetadata}
        endAt={endAt}
        enterProgress={enterProgress}
        exitProgress={exitProgress}
        startFrame={startFrame}
        canvasLayout={canvasLayout}
        nextScene={nextScene}
        previousScene={previousScene}
      />
      {canvasLayout === "square" ? (
        <BoxedCaptions
          enterProgress={enterProgress}
          exitProgress={exitProgress}
          nextScene={nextScene}
          previousScene={previousScene}
          sceneAndMetadata={sceneAndMetadata}
          startFrame={startFrame}
          theme={theme}
        />
      ) : null}
      {sceneAndMetadata.scene.newChapter && canvasLayout === "square" ? (
        <SquareChapter
          title={sceneAndMetadata.scene.newChapter}
          displayLayout={sceneAndMetadata.layout.displayLayout}
          webcamLayout={sceneAndMetadata.layout.webcamLayout}
          didTransitionIn={didTransitionIn}
        />
      ) : null}
      {sceneAndMetadata.scene.newChapter && canvasLayout === "landscape" ? (
        <LandscapeChapters
          scene={sceneAndMetadata}
          theme={theme}
          chapters={chapters}
          didTransitionIn={didTransitionIn}
        />
      ) : null}
      {canvasLayout === "landscape" && sceneAndMetadata.cameras.captions ? (
        <SrtPreviewAndEditor
          captions={sceneAndMetadata.cameras.captions}
          startFrame={startFrame}
          theme={theme}
        ></SrtPreviewAndEditor>
      ) : null}
      {getRemotionEnvironment().isStudio ? (
        <Actions
          visible={hovered}
          sceneIndex={sceneIndex}
          cameras={sceneAndMetadata.cameras}
        />
      ) : null}
    </AbsoluteFill>
  );
};
