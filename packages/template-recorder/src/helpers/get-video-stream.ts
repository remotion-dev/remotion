import { DEFAULT_MINIMUM_FPS } from "../preferred-resolution";
import { SelectedSource } from "./get-selected-video-source";

const getDisplayStream = async (selectedVideoSource: SelectedSource) => {
  if (
    selectedVideoSource.type !== "display-without-audio" &&
    selectedVideoSource.type !== "display-with-audio"
  ) {
    throw new Error("Unknown video source type");
  }

  const stream = await window.navigator.mediaDevices
    // GetDisplayMedia asks the user for permission to capture the screen
    .getDisplayMedia({
      video: {
        height: {
          ideal: 1080,
        },
      },
      audio: selectedVideoSource.type === "display-with-audio",
    });

  return stream;
};

export const getCameraStreamConstraints = (
  selectedVideoSource: SelectedSource,
  preferPortrait: boolean,
) => {
  if (selectedVideoSource.type !== "camera") {
    return null;
  }
  const video: MediaTrackConstraints = {
    deviceId: selectedVideoSource.deviceId,
    width: preferPortrait
      ? undefined
      : selectedVideoSource.maxWidth
        ? { ideal: selectedVideoSource.maxWidth }
        : undefined,
    height: preferPortrait
      ? selectedVideoSource.maxHeight
        ? { ideal: selectedVideoSource.maxHeight }
        : undefined
      : undefined,
    frameRate: {
      min: selectedVideoSource.minFps ?? DEFAULT_MINIMUM_FPS,
    },
  };
  return video;
};

const getCameraStram = ({
  selectedVideoSource,
  preferPortrait,
  recordAudio,
  selectedAudioSource,
}: {
  selectedVideoSource: SelectedSource;
  preferPortrait: boolean;
  recordAudio: boolean;
  selectedAudioSource: ConstrainDOMString | null;
}): Promise<MediaStream> => {
  if (selectedVideoSource.type !== "camera") {
    throw new Error("Unknown video source type");
  }
  const video = getCameraStreamConstraints(selectedVideoSource, preferPortrait);

  const mediaStreamConstraints: MediaStreamConstraints = {
    video: video ?? undefined,
    audio:
      recordAudio && selectedAudioSource
        ? { deviceId: selectedAudioSource }
        : undefined,
  };

  return window.navigator.mediaDevices.getUserMedia(mediaStreamConstraints);
};

export const getVideoStream = async ({
  selectedVideoSource,
  preferPortrait,
  recordAudio,
  selectedAudioSource,
}: {
  selectedVideoSource: SelectedSource;
  preferPortrait: boolean;
  recordAudio: boolean;
  selectedAudioSource: ConstrainDOMString | null;
}): Promise<MediaStream> => {
  if (selectedVideoSource.type === "display-with-audio") {
    return getDisplayStream(selectedVideoSource);
  }
  if (selectedVideoSource.type === "display-without-audio") {
    return getDisplayStream(selectedVideoSource);
  }
  if (selectedVideoSource.type === "camera") {
    return getCameraStram({
      selectedVideoSource,
      preferPortrait,
      recordAudio,
      selectedAudioSource,
    });
  }

  throw new Error("Unknown video source type");
};
