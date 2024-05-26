import React, { useRef } from "react";
import "./transparent-video.css";

export const OverlayInDavinci: React.FC = () => {
  const ref = useRef<HTMLVideoElement>(null);

  return (
    <div>
      <video ref={ref} src="/img/OverlayInDavinci.mp4" controls autoPlay loop />
    </div>
  );
};
