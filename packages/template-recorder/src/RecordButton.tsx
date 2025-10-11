import { CameraIcon, MicIcon } from "lucide-react";
import React, { useCallback, useEffect, useMemo } from "react";
import { FPS } from "../config/fps";
import { truthy } from "../remotion/helpers/truthy";
import { RecordCircle } from "./BlinkingCircle";
import { ProcessStatus } from "./components/ProcessingStatus";
import { Button } from "./components/ui/button";
import { Prefix } from "./helpers/prefixes";
import {
  FinishedRecording,
  startMediaRecorder,
} from "./helpers/start-media-recorder";
import { useKeyPress } from "./helpers/use-key-press";
import { useMediaSources } from "./state/media-sources";
import { visibleByDefault } from "./state/visible-views";

export type CurrentRecorder = {
  recorder: MediaRecorder;
  stopAndWaitUntilDone: () => Promise<FinishedRecording>;
  mimeType: string;
};

export type RecordingStatus =
  | {
      type: "idle";
    }
  | {
      type: "recording";
      ongoing: OngoingRecording;
    }
  | {
      type: "recording-finished";
      blobs: FinishedRecording[];
      expectedFrames: number;
      endDate: number;
    };

type OngoingRecording = {
  startDate: number;
  recorders: CurrentRecorder[];
};

export const RecordButton: React.FC<{
  recordingStatus: RecordingStatus;
  setRecordingStatus: React.Dispatch<React.SetStateAction<RecordingStatus>>;
  showAllViews: boolean;
  processingStatus: ProcessStatus | null;
}> = ({
  setRecordingStatus,
  recordingStatus,
  showAllViews,
  processingStatus,
}) => {
  const discardVideos = useCallback(async () => {
    if (recordingStatus.type !== "recording-finished") {
      throw new Error("Recording not finished");
    }
    for (const blob of recordingStatus.blobs) {
      await blob.releaseData();
    }

    setRecordingStatus({ type: "idle" });
  }, [recordingStatus, setRecordingStatus]);

  const mediaSources = useMediaSources().mediaSources;

  const activeSources = useMemo(() => {
    return Object.entries(mediaSources).filter(([prefix, source]) => {
      return (
        (showAllViews || visibleByDefault[prefix as Prefix]) &&
        source.streamState.type === "loaded"
      );
    });
  }, [mediaSources, showAllViews]);

  const videoDeviceCount = useMemo(() => {
    return activeSources.filter(([, source]) => {
      return source.videoDevice !== null;
    }).length;
  }, [activeSources]);
  const audioDeviceCount = useMemo(() => {
    return activeSources.filter(([, source]) => {
      return source.audioDevice !== null;
    }).length;
  }, [activeSources]);

  const start = useCallback(async () => {
    const startDate = Date.now();
    const recorders = (
      await Promise.all(
        activeSources.map(
          ([prefix, source]): Promise<CurrentRecorder | null> => {
            return startMediaRecorder({
              prefix: prefix as Prefix,
              source: source.streamState,
              timestamp: startDate,
            });
          },
        ),
      )
    ).filter(truthy);

    return setRecordingStatus({
      type: "recording",
      ongoing: { recorders: recorders, startDate },
    });
  }, [activeSources, setRecordingStatus]);

  const onStop = useCallback(async () => {
    if (recordingStatus.type !== "recording") {
      return;
    }

    const blobs = await Promise.all(
      recordingStatus.ongoing.recorders.map((r) => r.stopAndWaitUntilDone()),
    );

    const endDate = Date.now();
    const expectedFrames =
      ((endDate - recordingStatus.ongoing.startDate) / 1000) * FPS;

    setRecordingStatus({
      type: "recording-finished",
      blobs,
      expectedFrames,
      endDate,
    });
  }, [recordingStatus, setRecordingStatus]);

  useEffect(() => {
    return () => {
      if (recordingStatus.type === "recording") {
        recordingStatus.ongoing.recorders.forEach((r) => {
          r.recorder.stop();
        });
      }
    };
  }, [recordingStatus]);

  const disabled =
    mediaSources.webcam.streamState.type !== "loaded" ||
    mediaSources.webcam.streamState.stream.getAudioTracks().length === 0 ||
    processingStatus !== null;

  const onPressR = useCallback(() => {
    if (disabled) {
      return;
    }

    const dialog = document.querySelector('[role="dialog"]');

    if (
      (document.activeElement && document.activeElement.tagName === "input") ||
      dialog
    ) {
      return;
    }

    if (recordingStatus.type === "recording") {
      onStop();
    } else if (recordingStatus.type === "idle") {
      start();
    }
  }, [onStop, disabled, recordingStatus.type, start]);

  const onDiscardAndRetake = useCallback(async () => {
    await discardVideos();
    start();
  }, [discardVideos, start]);

  useKeyPress({ keys: ["r"], callback: onPressR, metaKey: false });

  if (recordingStatus.type === "recording") {
    return (
      <>
        <Button
          variant="outline"
          type="button"
          style={{ display: "flex", alignItems: "center", gap: 10 }}
          title="Press R to stop recording"
          onClick={onStop}
        >
          Stop recording
        </Button>
      </>
    );
  }

  return (
    <div
      title={
        disabled
          ? "A webcam and an audio source have to be selected to start the recording"
          : undefined
      }
    >
      <Button
        variant="outline"
        type="button"
        disabled={disabled}
        title="Press R to start recording"
        className="flex flex-row items-center pl-3 pr-0 py-0"
        onClick={
          recordingStatus.type === "recording-finished"
            ? onDiscardAndRetake
            : start
        }
      >
        <RecordCircle />
        <div className="w-2"></div>
        <div>
          {disabled
            ? "Select audio+video to record"
            : recordingStatus.type === "recording-finished"
              ? "Discard and retake"
              : "Start recording"}
        </div>
        <div className="w-3"></div>
        {videoDeviceCount > 0 && !disabled && (
          <div className="flex flex-row items-center gap-1 border-l-[1px] h-full px-2">
            <CameraIcon className="w-5" />
            <div>{videoDeviceCount}</div>
          </div>
        )}
        {audioDeviceCount > 0 && !disabled && (
          <div className="flex flex-row items-center gap-1 border-l-[1px] h-full px-2">
            <MicIcon className="w-5" />
            <div>{audioDeviceCount}</div>
          </div>
        )}
      </Button>
    </div>
  );
};
