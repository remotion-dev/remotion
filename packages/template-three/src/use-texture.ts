/* eslint-disable react-hooks/rules-of-hooks */
import { useOffthreadVideoTexture, useVideoTexture } from "@remotion/three";
import { useRemotionEnvironment } from "remotion";

export const useTexture = (
  src: string,
  videoRef: React.RefObject<HTMLVideoElement | null>,
) => {
  const env = useRemotionEnvironment();
  if (env.isRendering) {
    return useOffthreadVideoTexture({
      src,
    });
  }

  return useVideoTexture(videoRef);
};
