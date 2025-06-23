/* eslint-disable react-hooks/rules-of-hooks */
import { useOffthreadVideoTexture, useVideoTexture } from "@remotion/three";
import { getRemotionEnvironment } from "remotion";

export const useTexture = (
  src: string,
  videoRef: React.RefObject<HTMLVideoElement | null>,
) => {
  if (getRemotionEnvironment().isRendering) {
    return useOffthreadVideoTexture({
      src,
    });
  }

  return useVideoTexture(videoRef);
};
