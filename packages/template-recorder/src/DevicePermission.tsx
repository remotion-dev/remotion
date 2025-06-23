import type { ReactNode } from "react";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { PermissionError } from "./PermissionError";
import { CircleSpinner } from "./components/Spinner";

type PermissionState = "granted" | "denied" | "prompt" | "initial";

const BORDERRADIUS = 10;
const largeContainer: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  flexDirection: "column",
  justifyContent: "center",
  height: "100%",
};

const explanationWrapper: React.CSSProperties = {
  display: "flex",
  textAlign: "start",
  paddingLeft: 10,
};

const explanationContainer: React.CSSProperties = {
  display: "flex",
  justifyContent: "flex-start",
  flexDirection: "column",
  maxWidth: 800,
  lineHeight: 2,
};

const innerContainer: React.CSSProperties = {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  flexDirection: "row",
};
const container: React.CSSProperties = {
  borderRadius: BORDERRADIUS,
  padding: 12,
  margin: 20,
};

const title: React.CSSProperties = {
  display: "flex",
  justifyContent: "center",
  fontSize: "1rem",
};

const textContainer: React.CSSProperties = {
  paddingLeft: 20,
  paddingRight: 20,
  paddingTop: 10,
  paddingBottom: 10,
  fontSize: 13,
};

const peripheralContainer: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  backgroundColor: "#242424",
  borderRadius: BORDERRADIUS,
  margin: 10,
  padding: 16,
  minWidth: 200,
  minHeight: 150,
};

const Permission: React.FC<{
  type: "audio" | "video";
  deviceState: PermissionState;
  setDeviceState: (newState: PermissionState) => void;
  isInitialState: boolean;
  onNoDevicesFound: () => void;
}> = ({
  type,
  deviceState,
  setDeviceState,
  isInitialState,
  onNoDevicesFound,
}) => {
  const dynamicStyle: React.CSSProperties = useMemo(() => {
    return {
      display: "flex",
      justifyContent: "flex-end",
      alignItems: "center",
      color: deviceState === "denied" ? "red" : "white",
    };
  }, [deviceState]);

  const microphoneIcon = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 384 512"
      style={{ maxHeight: 50 }}
    >
      <path
        fill="white"
        d="M192 0C139 0 96 43 96 96V256c0 53 43 96 96 96s96-43 96-96V96c0-53-43-96-96-96zM64 216c0-13.3-10.7-24-24-24s-24 10.7-24 24v40c0 89.1 66.2 162.7 152 174.4V464H120c-13.3 0-24 10.7-24 24s10.7 24 24 24h72 72c13.3 0 24-10.7 24-24s-10.7-24-24-24H216V430.4c85.8-11.7 152-85.3 152-174.4V216c0-13.3-10.7-24-24-24s-24 10.7-24 24v40c0 70.7-57.3 128-128 128s-128-57.3-128-128V216z"
      />
    </svg>
  );

  const cameraIcon = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 576 512 "
      style={{ maxHeight: 40 }}
    >
      <path
        fill="white"
        d="M0 128C0 92.7 28.7 64 64 64H320c35.3 0 64 28.7 64 64V384c0 35.3-28.7 64-64 64H64c-35.3 0-64-28.7-64-64V128zM559.1 99.8c10.4 5.6 16.9 16.4 16.9 28.2V384c0 11.8-6.5 22.6-16.9 28.2s-23 5-32.9-1.6l-96-64L416 337.1V320 192 174.9l14.2-9.5 96-64c9.8-6.5 22.4-7.2 32.9-1.6z"
      />
    </svg>
  );

  const handleError = useCallback(
    (error: Error) => {
      if (
        error.message.includes("Requested device not found") ||
        error.message.includes("The object can not be found here")
      ) {
        onNoDevicesFound();
        return;
      }

      setDeviceState("denied");
    },
    [onNoDevicesFound, setDeviceState],
  );

  const run = useCallback(async () => {
    const name =
      type === "audio"
        ? ("microphone" as PermissionName)
        : ("camera" as PermissionName);
    const result = await navigator.permissions
      .query({ name })
      .then((res) => res)
      .catch((e) => {
        // firefox doesn't support microphone and camera as valid property
        if (e instanceof TypeError) {
          return null;
        }

        console.log(e);
        return null;
      });
    // firefox case
    if (!result && deviceState === "initial") {
      // probe for permission
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: true,
        });
        setDeviceState("prompt");
        stream.getVideoTracks().forEach((track) => track.stop());
        stream.getAudioTracks().forEach((track) => track.stop());
      } catch (err) {
        console.log("Error on getUserMedia(", err);
        handleError(err as Error);
        return;
      }

      setDeviceState("granted");
      return;
    }

    if (!result) {
      return;
    }

    setDeviceState(result.state);

    if (result.state === "prompt" && type === "audio") {
      try {
        await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
      } catch (err) {
        console.log("Error on getUserMedia()", err);
        handleError(err as Error);
        return;
      }
    }

    if (result.state === "granted") {
      setDeviceState("granted");
    } else if (result.state === "denied") {
      setDeviceState("denied");
    }
  }, [deviceState, handleError, setDeviceState, type]);

  useEffect(() => {
    run();
  }, [run]);

  const accessInformation = useMemo(() => {
    if (deviceState === "prompt") return "Access requested";
    if (deviceState === "denied") return "Access denied";
    if (deviceState === "granted") return "Access granted";
  }, [deviceState]);

  if (isInitialState) return null;
  return (
    <div style={peripheralContainer}>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          flex: 1,
        }}
      >
        {type === "audio" ? microphoneIcon : cameraIcon}
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <div style={{ width: 16 }} />
        <div style={dynamicStyle}>{accessInformation} </div>
        {deviceState === "prompt" ? (
          <CircleSpinner />
        ) : (
          <div style={{ width: 16 }} />
        )}
      </div>
    </div>
  );
};

export const DevicePermission: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [noDeviceFound, setNoDeviceFound] = useState(false);
  const [audioState, setAudioState] = useState<PermissionState>("initial");
  const [videoState, setVideoState] = useState<PermissionState>("initial");

  const isInitialState = useMemo(() => {
    return audioState === "initial" || videoState === "initial";
  }, [audioState, videoState]);

  const dynamicContainer: React.CSSProperties = useMemo(() => {
    return {
      ...container,
      borderColor: isInitialState ? "black" : "white",
    };
  }, [isInitialState]);

  const onNoDevicesFound = useCallback(() => {
    setNoDeviceFound(true);
  }, []);

  if (noDeviceFound) {
    return <PermissionError />;
  }

  if (audioState === "granted" && videoState === "granted") {
    return <>{children}</>;
  }

  return (
    <div style={largeContainer}>
      <div style={dynamicContainer}>
        <div style={innerContainer}>
          <Permission
            isInitialState={isInitialState}
            type="audio"
            deviceState={audioState}
            setDeviceState={(newState) => setAudioState(newState)}
            onNoDevicesFound={onNoDevicesFound}
          />
          <Permission
            isInitialState={isInitialState}
            type="video"
            deviceState={videoState}
            setDeviceState={(newState) => setVideoState(newState)}
            onNoDevicesFound={onNoDevicesFound}
          />
        </div>
        {isInitialState ? null : (
          <div style={textContainer}>
            <div style={explanationContainer}>
              <div style={title}>
                This app requires access to your microphone and camera.
              </div>
              <div style={explanationWrapper}>
                1. Click on the padlock/info icon next to the web address in
                your browser&apos;s address bar.
              </div>
              <div style={explanationWrapper}>
                2. In the dropdown menu that appears, locate the
                &apos;Permissions&apos; or &apos;Site settings&apos; option.
              </div>
              <div style={explanationWrapper}>
                3. Look for &apos;Camera&apos; and &apos;Microphone&apos;
                settings and ensure they are set to &apos;Allow&apos; or
                &apos;Ask&apos;
              </div>
              <div style={explanationWrapper}>
                4. Refresh the page if necessary to apply the changes.
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
