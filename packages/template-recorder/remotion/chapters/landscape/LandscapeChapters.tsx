import React, { useMemo } from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import type { VideoSceneAndMetadata } from "../../../config/scenes";
import { isWebCamRight } from "../../animations/webcam-transitions/helpers";

import { Theme } from "../../../config/themes";
import { SCENE_TRANSITION_DURATION } from "../../../config/transitions";
import type { ChapterType } from "../make-chapters";
import {
  CHAPTER_HEIGHT,
  CHAPTER_VERTICAL_MARGIN,
  LandscapeChapter,
} from "./LandscapeChapter";
import { getWidescreenChapterStyle } from "./layout";

export const LandscapeChapters: React.FC<{
  scene: VideoSceneAndMetadata;
  chapters: ChapterType[];
  didTransitionIn: boolean;
  theme: Theme;
}> = ({ chapters, scene, theme, didTransitionIn }) => {
  const frame = useCurrentFrame();
  const { fps, width } = useVideoConfig();
  const chapterIndex = chapters.findIndex((c) => c.title === scene.chapter);

  const shownChapters = useMemo(() => {
    if (chapterIndex === 0) {
      return chapters.slice(0, 3);
    }

    return chapters.slice(
      Math.max(0, chapterIndex - 1),
      Math.min(chapters.length, chapterIndex + 2),
    );
  }, [chapterIndex, chapters]);

  const tableOfContentHeight =
    (CHAPTER_HEIGHT + CHAPTER_VERTICAL_MARGIN * 2) * shownChapters.length -
    CHAPTER_VERTICAL_MARGIN * 2;

  const rightAligned = isWebCamRight(
    scene.webcamPosition === "center" ? "top-left" : scene.webcamPosition,
  );

  const delay = didTransitionIn ? SCENE_TRANSITION_DURATION : 0;

  const enter = spring({
    fps,
    frame,
    config: {
      damping: 200,
    },
    delay: delay,
  });

  const exit = spring({
    fps,
    frame,
    config: {
      damping: 200,
    },
    delay: 70 + delay,
  });

  const enterTranslation = interpolate(enter - exit, [0, 1], [-width / 2, 0]);

  const styles = getWidescreenChapterStyle(scene, tableOfContentHeight);

  return (
    <AbsoluteFill
      style={
        rightAligned
          ? { right: enterTranslation, left: undefined }
          : { left: enterTranslation, right: undefined }
      }
    >
      <AbsoluteFill
        style={{
          flexDirection: "column",
          height: tableOfContentHeight,
          flex: 1,
          ...styles,
        }}
      >
        {shownChapters.map((chapter, i) => {
          return (
            <LandscapeChapter
              key={chapter.index}
              activeIndex={chapterIndex}
              chapter={chapter}
              isFirstShown={i === 0}
              isLastShown={i === shownChapters.length - 1}
              rightAligned={rightAligned}
              theme={theme}
              timestampOfLastChapter={
                (shownChapters[shownChapters.length - 1] as ChapterType).start
              }
            />
          );
        })}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
