import {
  useAudioData,
  useWindowedAudioData,
  UseWindowedAudioDataReturnValue,
} from "@remotion/media-utils";
import { useState } from "react";

export const useWindowedAudioDataIfPossible = ({
  src,
  frame,
  fps,
  windowInSeconds,
}: {
  src: string;
  frame: number;
  fps: number;
  windowInSeconds: number;
}): UseWindowedAudioDataReturnValue => {
  const [initialSrc] = useState(src);
  if (initialSrc !== src) {
    throw new Error(
      "`src` cannot be changed dynamically - re-mount the component instead by setting a `key={src}`",
    );
  }
  if (src.endsWith(".wav")) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    return useWindowedAudioData({ src, frame, fps, windowInSeconds });
  }

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const audioData = useAudioData(src);
  return { audioData, dataOffsetInSeconds: 0 };
};
