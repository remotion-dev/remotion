import React, { useMemo } from "react";
import { AbsoluteFill } from "remotion";
import { DeviceItem } from "../DeviceItem";
import { useDevices } from "../WaitingForDevices";
import { Label, formatDeviceLabel } from "../helpers/format-device-label";
import { RescanDevices } from "./RescanDevices";

const title: React.CSSProperties = {
  fontWeight: "bold",
};

const container: React.CSSProperties = {
  display: "flex",
  backgroundColor: "rgba(0, 0, 0, 0.9)",
  padding: 20,
  gap: 20,
  overflowY: "auto",
};

const clearStyle: React.CSSProperties = {
  borderBottom: "1px solid",
  color: "rgba(255, 255, 255, 0.5)",
  fontSize: 14,
  marginTop: 10,
  display: "inline-block",
  cursor: "pointer",
};

export const getDeviceLabel = (device: MediaDeviceInfo): string => {
  const labels: Label[] = JSON.parse(localStorage.getItem("labels") ?? "[]");
  const found = labels.find((l) => l.id === device.deviceId);
  if (found) {
    return found.label;
  }

  return formatDeviceLabel(device.label);
};

export const StreamPicker: React.FC<{
  canSelectAudio: boolean;
  canSelectScreen: boolean;
  onPickVideo: (device: MediaDeviceInfo) => void;
  onPickAudio: (device: MediaDeviceInfo) => void;
  onPickScreenWithoutAudio: () => void;
  onPickScreenWithAudio: () => void;
  selectedVideoDevice: string | null;
  selectedAudioDevice: string | null;
  clear: () => void;
  canClear: boolean;
}> = ({
  canSelectAudio,
  canSelectScreen,
  onPickAudio,
  onPickVideo,
  onPickScreenWithoutAudio,
  onPickScreenWithAudio,
  selectedAudioDevice,
  selectedVideoDevice,
  clear,
  canClear,
}) => {
  const devices = useDevices();
  const videoInputs = useMemo(() => {
    return devices.filter((d) => d.kind === "videoinput");
  }, [devices]);
  const audioInputs = useMemo(() => {
    return devices.filter((d) => d.kind === "audioinput");
  }, [devices]);

  return (
    <AbsoluteFill style={container}>
      <div className="flex-1 flex-row flex">
        <div
          style={{
            flex: 1,
            opacity:
              canSelectAudio && selectedVideoDevice && !selectedAudioDevice
                ? 0.5
                : 1,
          }}
        >
          <div style={title}>Select video</div>
          {canSelectScreen ? (
            <DeviceItem
              handleClick={() => {
                onPickScreenWithoutAudio();
              }}
              deviceLabel={"Screen capture"}
              type="screen"
              selected={selectedVideoDevice === "display-without-audio"}
            />
          ) : null}
          {canSelectScreen ? (
            <DeviceItem
              handleClick={() => {
                onPickScreenWithAudio();
              }}
              deviceLabel={"Screen capture with audio"}
              type="screen"
              selected={selectedVideoDevice === "display-with-audio"}
            />
          ) : null}
          {videoInputs.map((d) => {
            return (
              <DeviceItem
                type="camera"
                key={d.deviceId}
                deviceLabel={getDeviceLabel(d)}
                handleClick={() => {
                  onPickVideo(d);
                }}
                selected={selectedVideoDevice === d.deviceId}
              />
            );
          })}
          {selectedVideoDevice && canClear ? (
            <a style={clearStyle} onClick={clear}>
              Clear
            </a>
          ) : null}
        </div>
        {canSelectAudio ? (
          <div
            style={{
              flex: 1,
              opacity: !selectedVideoDevice && selectedAudioDevice ? 0.5 : 1,
            }}
          >
            <div style={title}>Select audio</div>
            {audioInputs.map((d) => {
              return (
                <DeviceItem
                  type="microphone"
                  key={d.deviceId}
                  deviceLabel={getDeviceLabel(d)}
                  handleClick={() => {
                    onPickAudio(d);
                  }}
                  selected={selectedAudioDevice === d.deviceId}
                />
              );
            })}
          </div>
        ) : null}
      </div>
      <RescanDevices />
    </AbsoluteFill>
  );
};
