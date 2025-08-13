import React, { useMemo } from "react";
import { AbsoluteFill, useVideoConfig } from "remotion";
import type {
  SceneAndMetadata,
  VideoSceneAndMetadata,
} from "../../../../config/scenes";
import type { Theme } from "../../../../config/themes";
import { COLORS } from "../../../../config/themes";
import { shouldInlineTransitionSubtitles } from "../../../animations/caption-transitions/should-transition-subtitle";
import { getSubtitleTransform } from "../../../animations/caption-transitions/subtitle-transitions";
import { Layout } from "../../../layout/layout-types";
import { useCaptions } from "../../editor/captions-provider";
import { layoutCaptions } from "../../processing/layout-captions";
import { postprocessCaptions } from "../../processing/postprocess-subs";
import {
  CaptionSentence,
  getBorderWidthForSubtitles,
  getSubtitlesLines,
} from "./CaptionSentence";
import {
  TransitionFromPreviousSubtitles,
  TransitionToNextSubtitles,
} from "./TransitionBetweenSubtitles";

const LINE_HEIGHT = 2;
const SUBTITLES_FONT_SIZE = 56;

export const AnimatedCaptions: React.FC<{
  trimStart: number;
  scene: VideoSceneAndMetadata;
  enterProgress: number;
  exitProgress: number;
  nextScene: SceneAndMetadata | null;
  previousScene: SceneAndMetadata | null;
  theme: Theme;
  subtitleLayout: Layout;
}> = ({
  trimStart,
  scene,
  enterProgress,
  exitProgress,
  nextScene,
  previousScene,
  theme,
  subtitleLayout,
}) => {
  const { width, height } = useVideoConfig();

  const shouldTransitionToNext = shouldInlineTransitionSubtitles({
    currentScene: scene,
    nextScene,
  });
  const shouldTransitionFromPrevious = shouldInlineTransitionSubtitles({
    currentScene: scene,
    nextScene: previousScene,
  });

  const captions = useCaptions();

  const subtitleLines = getSubtitlesLines({
    boxHeight: subtitleLayout.height,
    fontSize: SUBTITLES_FONT_SIZE,
  });

  const postprocessed = useMemo(() => {
    const processed = postprocessCaptions(captions);

    return layoutCaptions({
      boxWidth: subtitleLayout.width,
      maxLines: subtitleLines,
      fontSize: SUBTITLES_FONT_SIZE,
      captions: processed,
    });
  }, [captions, subtitleLayout, subtitleLines]);

  const outer: React.CSSProperties = useMemo(() => {
    const backgroundColor = COLORS[theme].CAPTIONS_BACKGROUND;

    return {
      fontSize: SUBTITLES_FONT_SIZE,
      display: "flex",
      lineHeight: LINE_HEIGHT,
      borderWidth: getBorderWidthForSubtitles(),
      borderStyle: "solid",
      borderColor: COLORS[theme].BORDER_COLOR,
      backgroundColor,
      justifyContent: "center",
      ...getSubtitleTransform({
        enterProgress,
        exitProgress,
        canvasHeight: height,
        nextScene,
        previousScene,
        scene,
        canvasWidth: width,
        subtitleLayout,
      }),
    };
  }, [
    enterProgress,
    exitProgress,
    height,
    nextScene,
    previousScene,
    scene,
    subtitleLayout,
    theme,
    width,
  ]);

  return (
    <AbsoluteFill style={outer}>
      <TransitionFromPreviousSubtitles
        shouldTransitionFromPreviousSubtitle={shouldTransitionFromPrevious}
      >
        <TransitionToNextSubtitles
          shouldTransitionToNextsSubtitles={shouldTransitionToNext}
        >
          {postprocessed.segments.map((segment, index) => {
            return (
              <CaptionSentence
                key={index}
                isFirst={index === 0}
                isLast={index === postprocessed.segments.length - 1}
                segment={segment}
                trimStart={trimStart}
                theme={theme}
                fontSize={SUBTITLES_FONT_SIZE}
                lines={subtitleLines}
              />
            );
          })}
        </TransitionToNextSubtitles>
      </TransitionFromPreviousSubtitles>
    </AbsoluteFill>
  );
};
