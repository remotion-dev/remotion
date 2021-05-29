import Hls from "hls.js";
import React, { useEffect, useRef } from "react";
import styled from "styled-components";
import { ShowcaseVideo } from "../data/showcase-videos";
import { useElementSize } from "../helpers/use-el-size";
import { VideoSidebar } from "./VideoSidebar";

export const Container = styled.div`
  background-color: white;
  margin-bottom: 0;
  display: flex;
  flex-direction: row;
`;

const Video = styled.video`
  margin-bottom: 0;
  background-color: white;
`;

const RESERVED_FOR_SIDEBAR = 300;

const Sidebar = styled.div`
  width: ${RESERVED_FOR_SIDEBAR}px;
`;

const getVideoToPlayUrl = (video: ShowcaseVideo) => {
  if (video.type === "mux_video") {
    return `https://stream.mux.com/${video.muxId}.m3u8`;
  }

  throw new Error("no url");
};

export const VideoPlayerContent: React.FC<{ video: ShowcaseVideo }> = ({
  video,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const container = useRef<HTMLDivElement>(null);
  const vidUrl = getVideoToPlayUrl(video);

  const containerSize = useElementSize(document.body);

  const containerWidth = Math.min(containerSize?.width ?? 0, 1200) - 200;
  const containerHeight = Math.min(containerSize?.height ?? 0, 800);

  const heightRatio = (containerHeight ?? 0) / video.height;
  const widthRatio = (containerWidth ?? 0) / video.width;

  const ratio = Math.min(heightRatio, widthRatio);

  const height = ratio * video.height;
  const width = ratio * video.width;

  useEffect(() => {
    let hls: Hls;
    if (videoRef.current) {
      const { current } = videoRef;
      if (current.canPlayType("application/vnd.apple.mpegurl")) {
        // Some browers (safari and ie edge) support HLS natively
        current.src = vidUrl;
      } else if (Hls.isSupported()) {
        // This will run in all other modern browsers
        hls = new Hls();
        hls.loadSource(vidUrl);
        hls.attachMedia(current);
      } else {
        console.error("This is a legacy browser that doesn't support MSE");
      }
    }

    return () => {
      if (hls) {
        hls.destroy();
      }
    };
  }, [vidUrl, videoRef]);

  return (
    <Container ref={container}>
      <Video ref={videoRef} height={height} width={width} autoPlay />
      <Sidebar>
        <VideoSidebar video={video} />
      </Sidebar>
    </Container>
  );
};
