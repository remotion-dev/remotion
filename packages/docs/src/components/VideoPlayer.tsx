import React, { useEffect, useRef } from "react";
import { ShowcaseVideo } from "../data/showcase-videos";
import { VideoPlayerContent } from "./VideoPlayerContent";
const container: React.CSSProperties = {
  position: "fixed",
  top: 0,
  bottom: 0,
  left: 0,
  right: 0,
  backgroundColor: "rgba(0, 0, 0, 0.6)",
  // Higher than Docusaurus highest
  zIndex: 1000,
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
};

export const VideoPlayer: React.FC<{
  video: ShowcaseVideo | null;
  dismiss: () => void;
}> = ({ video, dismiss }) => {
  const outside = useRef<HTMLDivElement>(null);
  const inside = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const { current } = outside;
    if (!current) {
      return;
    }
    const onClick = (event: MouseEvent) => {
      // @ts-expect-error
      if (inside.current.contains(event.target)) {
        return;
      }
      dismiss();
    };
    current.addEventListener("click", onClick);
    return () => {
      current.removeEventListener("click", onClick);
    };
  }, [video]);

  if (!video) {
    return null;
  }
  return (
    <div ref={outside} style={container}>
      <div ref={inside}>
        <VideoPlayerContent video={video}></VideoPlayerContent>
      </div>
    </div>
  );
};
