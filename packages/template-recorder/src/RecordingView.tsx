/* eslint-disable no-negated-condition */
/* eslint-disable no-alert */
import { useCallback, useMemo, useState } from "react";
import { WEBCAM_PREFIX } from "../config/cameras";
import { CropIndicator } from "./CropIndicator";
import { PrefixLabel } from "./PrefixAndResolution";
import { RecordingStatus } from "./RecordButton";
import { ResolutionLimiter } from "./ResolutionLimiter";
import { ToggleRotate } from "./Rotate";
import { ResolutionAndFps, Stream } from "./Stream";
import { ToggleCrop } from "./ToggleCrop";
import { useDevices } from "./WaitingForDevices";
import { ClearCurrentVideo } from "./components/ClearCurrentVideo";
import { CurrentAudio } from "./components/CurrentAudio";
import { CurrentVideo } from "./components/CurrentVideo";
import { Divider } from "./components/Divider";
import { StreamPicker, getDeviceLabel } from "./components/StreamPicker";
import { VolumeMeter } from "./components/VolumeMeter";
import { canRotateCamera } from "./helpers/can-rotate-camera";
import {
  MaxResolution,
  getMaxResolutionOfDevice,
} from "./helpers/get-max-resolution-of-device";
import {
  SizeConstraint,
  getSelectedVideoSource,
} from "./helpers/get-selected-video-source";
import { Prefix } from "./helpers/prefixes";
import { setPreferredDeviceForPrefix } from "./preferred-device-localstorage";
import { getPreferredResolutionForDevice } from "./preferred-resolution";
import { useMediaSources } from "./state/media-sources";
import { visibleByDefault } from "./state/visible-views";
const viewContainer: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  margin: 10,
  backgroundColor: "#242424",
  borderRadius: 10,
  overflow: "hidden",
  width: "100%",
  height: "100%",
  maxHeight: "100%",
  maxWidth: "100%",
  position: "relative",
};

const topBar: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  paddingLeft: 10,
};

const streamViewport: React.CSSProperties = {
  flex: 1,
  position: "relative",
};

const localStorageKey = "showCropIndicator";

const InnerRecordingView: React.FC<{
  prefix: Prefix;
  recordingStatus: RecordingStatus;
}> = ({ prefix, recordingStatus }) => {
  const { mediaSources, setAudioDevice, setVideoDevice } = useMediaSources();
  const mediaStream = mediaSources[prefix];

  const initialCropIndicatorState = useMemo(() => {
    return (
      localStorage.getItem(localStorageKey) === "true" &&
      prefix === WEBCAM_PREFIX
    );
  }, [prefix]);

  const [showCropIndicator, setShowCropIndicator] = useState(
    initialCropIndicatorState,
  );

  const [showPickerPreference, setShowPicker] = useState(
    () => !mediaStream.videoDevice && !mediaStream.audioDevice,
  );

  const recordAudio = prefix === WEBCAM_PREFIX;
  const [resolution, setResolution] = useState<ResolutionAndFps | null>(null);
  const [preferPortrait, setPreferPortrait] = useState(false);
  const [sizeConstraint, setSizeConstraint] = useState<SizeConstraint>(() =>
    getPreferredResolutionForDevice(mediaStream.videoDevice),
  );

  const onToggleCrop = useCallback(() => {
    setShowCropIndicator((prev) => {
      window.localStorage.setItem(localStorageKey, String(!prev));
      return !prev;
    });
  }, []);

  const onToggleRotate = useCallback(() => {
    setPreferPortrait((prev) => {
      return !prev;
    });
  }, []);

  const selectScreenWithoutAudio = useCallback(async () => {
    setVideoDevice(prefix, "display-without-audio");
    setShowPicker(false);
  }, [prefix, setVideoDevice]);
  const selectScreenWithAudio = useCallback(async () => {
    setVideoDevice(prefix, "display-with-audio");
    setShowPicker(false);
  }, [prefix, setVideoDevice]);

  const devices = useDevices();

  const activeVideoDevice = useMemo(() => {
    return devices.find((d) => d.deviceId === mediaStream.videoDevice);
  }, [devices, mediaStream.videoDevice]);
  const activeAudioDevice = useMemo(() => {
    return devices.find((d) => d.deviceId === mediaStream.audioDevice);
  }, [devices, mediaStream.audioDevice]);

  const maxResolution = useMemo(() => {
    if (!activeVideoDevice) {
      return null;
    }

    return getMaxResolutionOfDevice(activeVideoDevice);
  }, [activeVideoDevice]);

  const selectedVideoSource = useMemo(() => {
    if (mediaStream.videoDevice === "display-without-audio") {
      return { type: "display-without-audio" as const };
    }
    if (mediaStream.videoDevice === "display-with-audio") {
      return { type: "display-with-audio" as const };
    }

    if (!activeVideoDevice) {
      return null;
    }

    return getSelectedVideoSource({
      device: activeVideoDevice,
      resolutionConstraint: sizeConstraint,
      maxResolution,
    });
  }, [
    activeVideoDevice,
    maxResolution,
    mediaStream.videoDevice,
    sizeConstraint,
  ]);

  const videoDeviceLabel = useMemo(() => {
    if (mediaStream.videoDevice === "display-without-audio") {
      return "Screen Share";
    }
    if (mediaStream.videoDevice === "display-with-audio") {
      return "Screen Share with audio";
    }

    if (!activeVideoDevice) {
      return null;
    }

    return getDeviceLabel(activeVideoDevice);
  }, [activeVideoDevice, mediaStream.videoDevice]);

  const audioDeviceLabel = useMemo(() => {
    if (!activeAudioDevice) {
      return null;
    }

    return getDeviceLabel(activeAudioDevice);
  }, [activeAudioDevice]);

  const cameraRotateable = useMemo(() => {
    return canRotateCamera({
      selectedSource: selectedVideoSource,
      preferPortrait,
      resolution,
    });
  }, [preferPortrait, resolution, selectedVideoSource]);

  const onPickVideo = useCallback(
    (device: MediaDeviceInfo) => {
      setVideoDevice(prefix, device.deviceId);
      setPreferredDeviceForPrefix(prefix, "video", device.deviceId);
      if (recordAudio && !mediaStream.audioDevice) {
        return;
      }
      setShowPicker(false);
    },
    [mediaStream.audioDevice, prefix, recordAudio, setVideoDevice],
  );

  const onPickAudio = useCallback(
    (device: MediaDeviceInfo) => {
      setAudioDevice(prefix, device.deviceId);
      setPreferredDeviceForPrefix(prefix, "audio", device.deviceId);
      if (!mediaStream.videoDevice) {
        return;
      }
      setShowPicker(false);
    },
    [mediaStream.videoDevice, prefix, setAudioDevice],
  );

  const clear = useCallback(() => {
    setVideoDevice(prefix, null);
    setAudioDevice(prefix, null);
    setPreferredDeviceForPrefix(prefix, "video", null);
    setShowPicker(true);
    setResolution(null);
  }, [prefix, setAudioDevice, setVideoDevice]);

  const [resolutionLimiterOpen, setResolutionLimiterOpen] = useState(false);

  const canShowResolutionLimiter = Boolean(
    selectedVideoSource?.type === "display-without-audio" ||
      selectedVideoSource?.type === "display-with-audio"
      ? false
      : videoDeviceLabel && activeVideoDevice && maxResolution,
  );

  const hasSelectedVideoOrAudio = Boolean(
    mediaStream.videoDevice || mediaStream.audioDevice,
  );

  const showPicker =
    showPickerPreference && recordingStatus.type !== "recording";
  const togglePicker = useCallback(() => {
    setShowPicker((prev) => !prev);
  }, []);

  return (
    <div
      style={viewContainer}
      data-recording={Boolean(
        recordingStatus.type === "recording" &&
          hasSelectedVideoOrAudio &&
          mediaStream.streamState.type === "loaded",
      )}
      className="outline-red-600 outline-0 data-[recording=true]:outline-2 outline"
    >
      <div style={topBar}>
        <div style={{ width: 10 }}></div>
        <PrefixLabel prefix={prefix} />
        <div style={{ width: 15 }}></div>
        <Divider></Divider>
        <CurrentVideo
          resolution={resolution}
          label={videoDeviceLabel ?? "No video selected"}
          isScreenshare={
            selectedVideoSource?.type === "display-without-audio" ||
            selectedVideoSource?.type === "display-with-audio"
          }
          onClick={togglePicker}
          setResolutionLimiterOpen={setResolutionLimiterOpen}
          canShowResolutionLimiter={canShowResolutionLimiter}
          disabled={recordingStatus.type === "recording"}
        ></CurrentVideo>
        {selectedVideoSource && recordingStatus.type !== "recording" ? (
          <ClearCurrentVideo onClick={clear} />
        ) : null}
        {prefix === WEBCAM_PREFIX ? (
          <>
            <Divider></Divider>
            <CurrentAudio
              disabled={recordingStatus.type === "recording"}
              onClick={togglePicker}
              label={audioDeviceLabel}
            />
          </>
        ) : null}
        {prefix === WEBCAM_PREFIX ? (
          <ToggleCrop
            pressed={showCropIndicator}
            onPressedChange={onToggleCrop}
          />
        ) : null}
        {cameraRotateable ? (
          <ToggleRotate
            pressed={preferPortrait}
            onPressedChange={onToggleRotate}
            disabled={recordingStatus.type === "recording"}
          />
        ) : null}
      </div>
      {prefix === WEBCAM_PREFIX ? (
        <VolumeMeter mediaStream={mediaStream.streamState} />
      ) : null}
      <div style={streamViewport}>
        <Stream
          selectedAudioSource={mediaStream.audioDevice}
          selectedVideoSource={selectedVideoSource}
          recordAudio={recordAudio}
          setResolution={setResolution}
          prefix={prefix}
          preferPortrait={preferPortrait}
          clear={clear}
        />
        {showCropIndicator && resolution && !showPicker ? (
          <CropIndicator resolution={resolution} />
        ) : null}
        {showPicker ? (
          <StreamPicker
            onPickVideo={onPickVideo}
            onPickAudio={onPickAudio}
            canSelectAudio={recordAudio}
            canSelectScreen={prefix !== WEBCAM_PREFIX}
            onPickScreenWithoutAudio={selectScreenWithoutAudio}
            onPickScreenWithAudio={selectScreenWithAudio}
            selectedAudioDevice={mediaStream.audioDevice}
            selectedVideoDevice={mediaStream.videoDevice}
            clear={clear}
            canClear={prefix !== WEBCAM_PREFIX}
          />
        ) : null}
        {canShowResolutionLimiter ? (
          <ResolutionLimiter
            sizeConstraint={sizeConstraint}
            setSizeConstraint={setSizeConstraint}
            maxResolution={maxResolution as MaxResolution}
            deviceName={videoDeviceLabel as string}
            deviceId={(activeVideoDevice as MediaDeviceInfo).deviceId}
            open={resolutionLimiterOpen}
            setOpen={setResolutionLimiterOpen}
          />
        ) : null}
      </div>
    </div>
  );
};

export const RecordingView: React.FC<{
  prefix: Prefix;
  recordingStatus: RecordingStatus;
  showAllViews: boolean;
}> = ({ prefix, recordingStatus, showAllViews }) => {
  if (!visibleByDefault[prefix] && !showAllViews) {
    return null;
  }

  return (
    <InnerRecordingView prefix={prefix} recordingStatus={recordingStatus} />
  );
};
