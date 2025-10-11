import React, { useCallback, useMemo, useState } from "react";
import { useDevices } from "../WaitingForDevices";
import { Prefix } from "../helpers/prefixes";
import { getPreferredDeviceIfExists } from "../preferred-device-localstorage";

export type StreamState =
  | { type: "initial" }
  | { type: "loading" }
  | { type: "loaded"; stream: MediaStream }
  | { type: "error"; error: string };

type PrefixState = {
  streamState: StreamState;
  videoDevice: string | null;
  audioDevice: string | null;
};

export type MediaSources = {
  [key in Prefix]: PrefixState;
};

export type MediaSourcesContextType = {
  mediaSources: MediaSources;
  setMediaStream: (prefix: Prefix, source: StreamState) => void;
  setAudioDevice: (prefix: Prefix, deviceId: string | null) => void;
  setVideoDevice: (prefix: Prefix, deviceId: string | null) => void;
};

const MediaSourcesContext = React.createContext<MediaSourcesContextType | null>(
  null,
);

const makeInitialState = (
  prefix: Prefix,
  devices: MediaDeviceInfo[],
): PrefixState => {
  return {
    streamState: { type: "initial" },
    audioDevice: getPreferredDeviceIfExists(prefix, "audio", devices),
    videoDevice: getPreferredDeviceIfExists(prefix, "video", devices),
  };
};

export const MediaSourcesProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const devices = useDevices();
  const [mediaSources, setMediaSources] = useState<MediaSources>({
    alternative1: makeInitialState("alternative1", devices),
    alternative2: makeInitialState("alternative2", devices),
    display: makeInitialState("display", devices),
    webcam: makeInitialState("webcam", devices),
  });

  const setMediaStream = useCallback((prefix: Prefix, source: StreamState) => {
    setMediaSources((prevMediaSources) => ({
      ...prevMediaSources,
      [prefix]: { ...prevMediaSources[prefix], streamState: source },
    }));
  }, []);

  const setAudioDevice = useCallback(
    (prefix: Prefix, deviceId: string | null) => {
      setMediaSources((prevMediaSources) => ({
        ...prevMediaSources,
        [prefix]: { ...prevMediaSources[prefix], audioDevice: deviceId },
      }));
    },
    [],
  );

  const setVideoDevice = useCallback(
    (prefix: Prefix, deviceId: string | null) => {
      setMediaSources((prevMediaSources) => ({
        ...prevMediaSources,
        [prefix]: { ...prevMediaSources[prefix], videoDevice: deviceId },
      }));
    },
    [],
  );

  const value: MediaSourcesContextType = useMemo(
    () => ({ mediaSources, setMediaStream, setAudioDevice, setVideoDevice }),
    [mediaSources, setMediaStream, setAudioDevice, setVideoDevice],
  );

  return (
    <MediaSourcesContext.Provider value={value}>
      {children}
    </MediaSourcesContext.Provider>
  );
};

export const useMediaSources = () => {
  const context = React.useContext(MediaSourcesContext);
  if (!context) {
    throw new Error(
      "useMediaSources must be used within a MediaSourcesProvider",
    );
  }

  return context;
};
