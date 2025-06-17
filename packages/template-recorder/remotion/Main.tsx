import React, { useCallback, useMemo, useState } from "react";
import { AbsoluteFill, Sequence } from "remotion";
import type { Platform } from "../config/endcard";
import type { CanvasLayout } from "../config/layout";
import type { SceneAndMetadata, SelectableScene } from "../config/scenes";
import type { Theme } from "../config/themes";
import { COLORS } from "../config/themes";
import { AudioTrack } from "./audio/AudioTrack";
import { captionEditorPortal } from "./captions/editor/layout";
import { EmitSrtFile } from "./captions/srt/EmitSrtFile";
import { makeChapters } from "./chapters/make-chapters";
import { Scene } from "./scenes/Scene";
import { NoDataScene } from "./scenes/VideoScene/NoDataScene";

export type MainProps = {
  canvasLayout: CanvasLayout;
  scenes: SelectableScene[];
  scenesAndMetadata: SceneAndMetadata[];
  theme: Theme;
  platform: Platform;
};

export const Main: React.FC<MainProps> = ({
  scenesAndMetadata,
  canvasLayout,
  theme,
  platform,
  scenes,
}) => {
  const chapters = useMemo(() => {
    return makeChapters({ scenes: scenesAndMetadata });
  }, [scenesAndMetadata]);

  const [hovered, setHovered] = useState(false);
  const onPointerEnter = useCallback(() => {
    setHovered(true);
  }, []);

  const onPointerLeave = useCallback(() => {
    setHovered(false);
  }, []);

  if (scenesAndMetadata.length === 0) {
    return <NoDataScene theme={theme} />;
  }

  const lastSceneIndex = scenesAndMetadata[
    scenesAndMetadata.length - 1
  ] as SceneAndMetadata;
  const lastSceneFrame =
    lastSceneIndex.from + lastSceneIndex.durationInFrames - 1;

  return (
    <AbsoluteFill
      style={{
        background: COLORS[theme].BACKGROUND,
      }}
      onPointerEnter={onPointerEnter}
      onPointerLeave={onPointerLeave}
    >
      {scenesAndMetadata.map((sceneAndMetadata, i) => {
        return (
          <Scene
            key={i}
            index={i}
            nextScene={scenesAndMetadata[i + 1] ?? null}
            previousScene={scenesAndMetadata[i - 1] ?? null}
            chapters={chapters}
            canvasLayout={canvasLayout}
            sceneAndMetadata={sceneAndMetadata}
            theme={theme}
            platform={platform}
            hovered={hovered}
          />
        );
      })}
      {scenes.length > scenesAndMetadata.length ? (
        <Sequence
          name="No more videos"
          from={lastSceneFrame}
          durationInFrames={120}
        >
          <NoDataScene theme={theme} />
        </Sequence>
      ) : null}
      <AudioTrack
        scenesAndMetadata={scenesAndMetadata}
        canvasLayout={canvasLayout}
      />
      {canvasLayout === "landscape" ? (
        <EmitSrtFile scenesAndMetadata={scenesAndMetadata} />
      ) : null}
      <div ref={captionEditorPortal} />
    </AbsoluteFill>
  );
};
