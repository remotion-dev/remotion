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
    // A string constraint is only an "ideal" preference. Use an exact
    // constraint so Chrome cannot silently substitute the default webcam.
    deviceId: { exact: selectedVideoSource.deviceId },
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

export const getAudioStreamConstraints = ({
  recordAudio,
  selectedAudioSource,
}: {
  recordAudio: boolean;
  selectedAudioSource: string | null;
}): MediaTrackConstraints | undefined => {
  if (!recordAudio || !selectedAudioSource) {
    return undefined;
  }

  // A string constraint is only an "ideal" preference. Use an exact
  // constraint so Chrome cannot silently substitute the default microphone.
  return { deviceId: { exact: selectedAudioSource } };
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
  selectedAudioSource: string | null;
}): Promise<MediaStream> => {
  if (selectedVideoSource.type !== "camera") {
    throw new Error("Unknown video source type");
  }
  const video = getCameraStreamConstraints(selectedVideoSource, preferPortrait);

  const mediaStreamConstraints: MediaStreamConstraints = {
    video: video ?? undefined,
    audio: getAudioStreamConstraints({ recordAudio, selectedAudioSource }),
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
  selectedAudioSource: string | null;
}): Promise<MediaStream> => {
  if (selectedVideoSource.type === "display-with-audio") {
    return getDisplayStream(selectedVideoSource);
  }
  if (selectedVideoSource.type === "display-without-audio") {
    const displayStream = await getDisplayStream(selectedVideoSource);
    if (recordAudio && selectedAudioSource) {
      const audioStream = await window.navigator.mediaDevices.getUserMedia({
        audio: getAudioStreamConstraints({ recordAudio, selectedAudioSource }),
      });
      return new MediaStream([
        ...displayStream.getVideoTracks(),
        ...audioStream.getAudioTracks(),
      ]);
    }

    return displayStream;
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
