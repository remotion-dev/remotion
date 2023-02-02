import BrowserOnly from "@docusaurus/BrowserOnly";
import React, { useCallback } from "react";
import { VideoPlayerWithControls } from "./VideoPlayerWithControls";

const link: React.CSSProperties = {
  color: "inherit",
  all: "unset",
  display: "block",
  cursor: "pointer",
};

const container: React.CSSProperties = {
  border: "1px solid #888",
  borderRadius: 10,
  overflow: "hidden",
  marginBottom: 30,
  display: "flex",
  flexDirection: "row",
};

const thumbnail: React.CSSProperties = {
  height: 100,
  display: "inline",
  marginBottom: 0,
  borderRight: "1px solid #888",
};

const right: React.CSSProperties = {
  padding: 16,
  lineHeight: 1.5,
  display: "flex",
  flex: 1,
  flexDirection: "column",
  justifyContent: "center",
};

const wouldYouRather: React.CSSProperties = {
  fontSize: ".9em",
};

export const AlsoAvailableAsVideo: React.FC<{
  minutes: number;
  playbackId: string;
  title: string;
  thumb: string;
}> = ({ minutes, title, thumb, playbackId }) => {
  const [showVideo, setShowVideo] = React.useState(false);

  const onClick = useCallback(() => {
    setShowVideo(true);
  }, []);

  if (showVideo) {
    return (
      <div style={{ marginBottom: 30 }}>
        <BrowserOnly>
          {() => (
            <VideoPlayerWithControls
              playbackId={playbackId}
              poster={thumb}
              onError={(error) => {
                console.log(error);
              }}
              onLoaded={() => undefined}
              onSize={() => undefined}
              autoPlay
            />
          )}
        </BrowserOnly>
      </div>
    );
  }

  return (
    <button type="button" style={link} onClick={onClick}>
      <div style={container}>
        <img style={thumbnail} src={thumb} />
        <div style={right}>
          <div style={wouldYouRather}>
            Also available as a {minutes}min video
          </div>
          <div>
            <strong>{title}</strong>
          </div>
        </div>
      </div>
    </button>
  );
};
