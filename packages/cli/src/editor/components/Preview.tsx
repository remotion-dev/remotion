import React from "react";
import styled from "styled-components";
import { useRecoilState } from "recoil";
import { previewSizeState } from "../state/preview-size";
import { getVideo, useVideoConfig } from "@jonny/motion-core";
import { Size } from "../hooks/get-el-size";

export const Container = styled.div<{
  scale: number;
  xCorrection: number;
  yCorrection: number;
  width: number;
  height: number;
}>`
  transform: scale(${(props) => props.scale});
  margin-left: ${(props) => props.xCorrection}px;
  margin-top: ${(props) => props.yCorrection}px;
  width: ${(props) => props.width}px;
  height: ${(props) => props.height}px;
`;

const Video = getVideo();

export const VideoPreview: React.FC<{
  canvasSize: Size;
}> = ({ canvasSize }) => {
  const [previewSize] = useRecoilState(previewSizeState);
  const config = useVideoConfig();

  const scale = Number(previewSize);
  const correction = 0 - (1 - scale) / 2;
  const xCorrection = correction * config.width;
  const yCorrection = correction * config.height;
  const width = config.width * scale;
  const height = config.height * scale;
  const centerX = canvasSize.width / 2 - width / 2;
  const centerY = canvasSize.height / 2 - height / 2;

  return (
    <div
      style={{
        width: config.width * scale,
        height: config.height * scale,
        display: "block",
        position: "absolute",
        left: centerX,
        top: centerY,
      }}
    >
      <Container
        {...{
          scale,
          xCorrection,
          yCorrection,
          width: config.width,
          height: config.height,
        }}
      >
        <Video></Video>
      </Container>
    </div>
  );
};
