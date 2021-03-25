import useBaseUrl from "@docusaurus/useBaseUrl";
import React, { useRef } from "react";
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

export const VideoPlayerContent: React.FC<{ video: ShowcaseVideo }> = ({
  video,
}) => {
  const container = useRef<HTMLDivElement>(null);
  const vidUrl = useBaseUrl(video.videoUrl);

  const containerSize = useElementSize(document.body);

  const containerWidth = Math.min(containerSize?.width ?? 0, 1200) - 200;
  const containerHeight = Math.min(containerSize?.height ?? 0, 800);

  const heightRatio = (containerHeight ?? 0) / video.height;
  const widthRatio = (containerWidth ?? 0) / video.width;

  const ratio = Math.min(heightRatio, widthRatio);

  const height = ratio * video.height;
  const width = ratio * video.width;

  return (
    <Container ref={container}>
      <Video src={vidUrl} height={height} width={width} autoPlay></Video>
      <Sidebar>
        <VideoSidebar video={video}></VideoSidebar>
      </Sidebar>
    </Container>
  );
};
