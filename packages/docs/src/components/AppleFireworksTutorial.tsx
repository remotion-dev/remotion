import React from "react";
import { VideoPlayerWithControls } from "./VideoPlayerWithControls";

export const AppleFireworksTutorial = () => {
  return (
    <VideoPlayerWithControls
      playbackId="RDHz028sflhaMtuCm1ogQTdtq02aLTspWjLrnEIlDS1ZM"
      poster="https://image.mux.com/RDHz028sflhaMtuCm1ogQTdtq02aLTspWjLrnEIlDS1ZM/thumbnail.png"
      onError={(error) => {
        console.log(error);
      }}
      onLoaded={() => undefined}
      onSize={() => undefined}
    />
  );
};
