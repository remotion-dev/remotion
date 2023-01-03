import BrowserOnly from "@docusaurus/BrowserOnly";
import React from "react";
import { VideoPlayerWithControls } from "./VideoPlayerWithControls";

export const AppleFireworksTutorial = () => {
  return (
    <BrowserOnly>
      {() => (
        <VideoPlayerWithControls
          playbackId="eEsG2GbZXAqNxays7TqDz24FS1OGCyYVuGYjRg2w2IM"
          poster="https://image.mux.com/eEsG2GbZXAqNxays7TqDz24FS1OGCyYVuGYjRg2w2IM/thumbnail.png"
          onError={(error) => {
            console.log(error);
          }}
          onLoaded={() => undefined}
          onSize={() => undefined}
        />
      )}
    </BrowserOnly>
  );
};
