import React, { useMemo } from "react";
import { Artifact, useCurrentFrame } from "remotion";
import { FPS } from "../../../config/fps";
import { SceneAndMetadata } from "../../../config/scenes";
import { combineSrt } from "./helpers/combine-srt";
import { serializeSrt } from "./helpers/serialize-srt";

// Rendering this component will cause an `captions.srt` file to be generated
// while rendering.
export const EmitSrtFile: React.FC<{
  scenesAndMetadata: SceneAndMetadata[];
}> = ({ scenesAndMetadata }) => {
  const frame = useCurrentFrame();

  const srtFile = useMemo(() => {
    const toCombine = scenesAndMetadata.map((scene) => {
      return {
        offsetInMs: Math.round((scene.from * 1000) / FPS),
        srts: scene.type === "video-scene" ? scene.srt : [],
      };
    });

    const combined = combineSrt(toCombine);
    return serializeSrt(combined);
  }, [scenesAndMetadata]);

  if (!srtFile) {
    return null;
  }

  if (frame !== 0) {
    return null;
  }

  return <Artifact content={srtFile} filename="captions.srt" />;
};
