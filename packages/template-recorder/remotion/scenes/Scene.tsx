import { interpolateStyles } from "@remotion/animation-utils";
import React, { useMemo } from "react";
import {
  AbsoluteFill,
  Sequence,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import type { Platform } from "../../config/endcard";
import type { CanvasLayout } from "../../config/layout";
import type { SceneAndMetadata } from "../../config/scenes";
import type { Theme } from "../../config/themes";
import { SCENE_TRANSITION_DURATION } from "../../config/transitions";
import { getSceneEnter, getSceneExit } from "../animations/scene-transitions";
import {
  getShouldTransitionIn,
  getShouldTransitionOut,
} from "../animations/transitions";
import type { ChapterType } from "../chapters/make-chapters";
import { useRefreshOnPublicFolderChange } from "../helpers/refresh-on-public-folder-change";
import { useScrollToCurrentScene } from "../helpers/scroll-to-current-scene";
import { EndCard } from "./EndCard";
import { NoRecordingsScene } from "./Placeholders/NoRecordingsScene";
import { NoScenes } from "./Placeholders/NoScenes";
import { RecorderScene } from "./Recorder";
import { TableOfContents } from "./TableOfContents";
import { Title } from "./Title/Title";
import { SoundEffects } from "./VideoScene/SoundEffects";
import { VideoScene } from "./VideoScene/VideoScene";

type Props = {
  sceneAndMetadata: SceneAndMetadata;
  previousScene: SceneAndMetadata | null;
  nextScene: SceneAndMetadata | null;
  index: number;
  canvasLayout: CanvasLayout;
  chapters: ChapterType[];
  theme: Theme;
  platform: Platform;
  hovered: boolean;
};

const InnerScene: React.FC<
  Props & {
    enterProgress: number;
    exitProgress: number;
  }
> = ({
  canvasLayout,
  chapters,
  nextScene,
  previousScene,
  sceneAndMetadata,
  theme,
  enterProgress,
  exitProgress,
  platform,
  index,
  hovered,
}) => {
  if (sceneAndMetadata.type === "video-scene") {
    return (
      <VideoScene
        enterProgress={enterProgress}
        canvasLayout={canvasLayout}
        exitProgress={exitProgress}
        nextScene={nextScene}
        previousScene={previousScene}
        sceneAndMetadata={sceneAndMetadata}
        theme={theme}
        chapters={chapters}
        sceneIndex={index}
        hovered={hovered}
      />
    );
  }

  if (sceneAndMetadata.scene.type === "title") {
    return (
      <Title
        subtitle={sceneAndMetadata.scene.subtitle}
        title={sceneAndMetadata.scene.title}
        theme={theme}
      />
    );
  }

  if (sceneAndMetadata.scene.type === "recorder") {
    return <RecorderScene theme={theme} />;
  }

  if (sceneAndMetadata.scene.type === "endcard") {
    return (
      <EndCard
        theme={theme}
        platform={platform}
        canvasLayout={canvasLayout}
        channel={sceneAndMetadata.scene.channel}
        links={sceneAndMetadata.scene.links}
      />
    );
  }

  if (sceneAndMetadata.scene.type === "tableofcontents") {
    return <TableOfContents theme={theme} chapters={chapters} />;
  }

  if (sceneAndMetadata.scene.type === "norecordings") {
    return <NoRecordingsScene type="none" />;
  }

  if (sceneAndMetadata.scene.type === "nomorerecordings") {
    return <NoRecordingsScene type="no-more" />;
  }

  if (sceneAndMetadata.scene.type === "noscenes") {
    return <NoScenes />;
  }
  if (sceneAndMetadata.scene.type === "videoscene") {
    throw new Error(
      'Video scene should be handled using sceneAndMetadata.type === "video-scene"',
    );
  }

  throw new Error(
    "Scene type not implemented in Scene.tsx: " +
      // @ts-expect-error If this gives a TS error, then you need to implement a new scene type
      sceneAndMetadata.scene.type,
  );
};

const roundProgress = (progress: number) => {
  if (progress > 0.999) {
    return 1;
  }
  return progress;
};

const SceneWithTransition: React.FC<Props> = (props) => {
  const { fps, durationInFrames, width, id } = useVideoConfig();
  const frame = useCurrentFrame();

  const shouldEnter = getShouldTransitionIn({
    sceneAndMetadata: props.sceneAndMetadata,
    previousSceneAndMetadata: props.previousScene,
    canvasLayout: props.canvasLayout,
  });
  const shouldExit = getShouldTransitionOut({
    sceneAndMetadata: props.sceneAndMetadata,
    nextSceneAndMetadata: props.nextScene,
    canvasLayout: props.canvasLayout,
  });

  const enter = shouldEnter
    ? roundProgress(
        spring({
          fps,
          frame,
          config: {
            damping: 200,
          },
          durationInFrames: SCENE_TRANSITION_DURATION,
          durationRestThreshold: 0.001,
        }),
      )
    : 1;

  const exit = shouldExit
    ? roundProgress(
        spring({
          fps,
          frame,
          config: {
            damping: 200,
          },
          durationInFrames: SCENE_TRANSITION_DURATION,
          durationRestThreshold: 0.001,
          delay: durationInFrames - SCENE_TRANSITION_DURATION,
        }),
      )
    : 0;

  const startStyle = getSceneEnter({
    currentScene: props.sceneAndMetadata,
    previousScene: props.previousScene,
    canvasWidth: width,
  });
  const endStyle = getSceneExit({
    currentScene: props.sceneAndMetadata,
    nextScene: props.nextScene,
    canvasWidth: width,
  });

  const style = interpolateStyles(
    enter + exit,
    [0, 1, 2],
    [startStyle, { left: 0 }, endStyle],
  );

  useRefreshOnPublicFolderChange(id);
  useScrollToCurrentScene({ index: props.index, fullyEntered: enter === 1 });

  return (
    <AbsoluteFill style={style}>
      <InnerScene {...props} enterProgress={enter} exitProgress={exit} />
      {shouldEnter ? (
        <SoundEffects
          previousScene={props.previousScene}
          sceneAndMetadata={props.sceneAndMetadata}
        />
      ) : null}
    </AbsoluteFill>
  );
};

export const Scene: React.FC<Props> = ({
  index,
  nextScene,
  previousScene,
  sceneAndMetadata,
  canvasLayout,
  chapters,
  theme,
  platform,
  hovered,
}) => {
  const chapter = useMemo(() => {
    if (sceneAndMetadata.scene.type === "videoscene") {
      return sceneAndMetadata.scene.newChapter;
    }

    return undefined;
  }, [sceneAndMetadata.scene]);

  const sequenceName = useMemo(() => {
    if (chapter) {
      return `Scene ${index} (${chapter})`;
    }

    return `Scene ${index}`;
  }, [index, chapter]);

  return (
    <Sequence
      premountFor={30}
      name={sequenceName}
      from={sceneAndMetadata.from}
      durationInFrames={Math.max(1, sceneAndMetadata.durationInFrames)}
    >
      <SceneWithTransition
        canvasLayout={canvasLayout}
        chapters={chapters}
        nextScene={nextScene}
        index={index}
        previousScene={previousScene}
        sceneAndMetadata={sceneAndMetadata}
        theme={theme}
        platform={platform}
        hovered={hovered}
      />
    </Sequence>
  );
};
