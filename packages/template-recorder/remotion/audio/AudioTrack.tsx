import React, { useMemo } from "react";
import { Audio, interpolate, Sequence, useVideoConfig } from "remotion";
import type { CanvasLayout } from "../../config/layout";
import type { SceneAndMetadata } from "../../config/scenes";
import {
  AUDIO_FADE_IN_FRAMES,
  BACKGROUND_VOLUME,
  getAudioSource,
  REGULAR_VOLUME,
} from "../../config/sounds";
import { SCENE_TRANSITION_DURATION } from "../../config/transitions";
import { getShouldTransitionOut } from "../animations/transitions";

type LoudPart = [number, number];

type TAudioTrack = {
  from: number;
  src: string;
  duration: number;
  loudParts: LoudPart[];
};

const calculateVolume =
  ({
    durationInFrames,
    loudParts,
  }: {
    durationInFrames: number;
    loudParts: LoudPart[];
  }) =>
  (f: number) => {
    let isLoudPart: null | [number, number] = null;
    for (const loudPart of loudParts) {
      const [from, to] = loudPart;
      if (f >= from && f <= to) {
        isLoudPart = [from, to];
        break;
      }
    }

    const regularVolume = interpolate(
      f,
      [
        0,
        AUDIO_FADE_IN_FRAMES,
        durationInFrames - AUDIO_FADE_IN_FRAMES,
        durationInFrames - 1,
      ],
      [0, BACKGROUND_VOLUME, BACKGROUND_VOLUME, 0],
      {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      },
    );

    if (isLoudPart) {
      const loudPartDuration = isLoudPart[1] - isLoudPart[0];
      const isTooShort = loudPartDuration <= AUDIO_FADE_IN_FRAMES * 2;
      const firstKeyFrame = isTooShort
        ? loudPartDuration / 2 + isLoudPart[0]
        : isLoudPart[0] + AUDIO_FADE_IN_FRAMES;
      const secondKeyFrame = isTooShort
        ? loudPartDuration / 2 + isLoudPart[0] + 1
        : isLoudPart[1] - AUDIO_FADE_IN_FRAMES;
      return interpolate(
        f,
        [isLoudPart[0], firstKeyFrame, secondKeyFrame, isLoudPart[1]],
        [regularVolume, REGULAR_VOLUME, REGULAR_VOLUME, regularVolume],
      );
    }

    return regularVolume;
  };

const AudioClip: React.FC<{
  src: string;
  loudParts: LoudPart[];
}> = ({ src, loudParts }) => {
  const { durationInFrames } = useVideoConfig();

  const volumeFunction = useMemo(() => {
    return calculateVolume({ durationInFrames, loudParts });
  }, [durationInFrames, loudParts]);

  return (
    <Audio
      // Lint false positive: https://github.com/remotion-dev/remotion/issues/2706
      // eslint-disable-next-line @remotion/volume-callback
      volume={volumeFunction}
      loopVolumeCurveBehavior="extend"
      src={src}
      loop
    />
  );
};

export const AudioTrack: React.FC<{
  scenesAndMetadata: SceneAndMetadata[];
  canvasLayout: CanvasLayout;
}> = ({ scenesAndMetadata, canvasLayout }) => {
  let addedUpDurations = 0;
  const audioClips: TAudioTrack[] = [];

  scenesAndMetadata.forEach((scene, i) => {
    const metadataForScene = scenesAndMetadata[i];
    if (!metadataForScene) {
      return null;
    }

    const from = addedUpDurations;
    addedUpDurations += metadataForScene.durationInFrames;
    const isTransitioningOut = getShouldTransitionOut({
      sceneAndMetadata: scene,
      nextSceneAndMetadata: scenesAndMetadata[i + 1] ?? null,
      canvasLayout,
    });
    if (isTransitioningOut) {
      addedUpDurations -= SCENE_TRANSITION_DURATION;
    }

    const isLoud = scene.type !== "video-scene";

    const { music } = scene.scene;

    if (music === "previous" && audioClips.length > 0) {
      const lastAudioClip = audioClips[audioClips.length - 1] as TAudioTrack;

      lastAudioClip.duration += metadataForScene.durationInFrames;

      if (isTransitioningOut) {
        lastAudioClip.duration -= SCENE_TRANSITION_DURATION;
      }

      if (isLoud) {
        const lastLoudPart =
          lastAudioClip.loudParts[lastAudioClip.loudParts.length - 1];

        const end = from + metadataForScene.durationInFrames;

        if (lastLoudPart && lastLoudPart[1] > from) {
          lastLoudPart[1] = end;
        } else {
          lastAudioClip.loudParts.push([from, end]);
        }
      }
    } else {
      if (music === "previous") {
        return;
      }

      audioClips.push({
        src: getAudioSource(music),
        duration: metadataForScene.durationInFrames,
        from,
        loudParts: isLoud
          ? [[from, from + metadataForScene.durationInFrames]]
          : [],
      });
    }
  });

  return (
    <>
      {audioClips.map((clip) => {
        if (clip.src === "none") {
          return null;
        }

        return (
          <Sequence
            key={clip.from}
            from={clip.from}
            layout="none"
            durationInFrames={clip.duration}
          >
            <AudioClip
              src={clip.src}
              loudParts={clip.loudParts.map((l) => {
                return [l[0] - clip.from, l[1] - clip.from] as LoudPart;
              })}
            />
          </Sequence>
        );
      })}
    </>
  );
};
