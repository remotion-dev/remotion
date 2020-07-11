import React, { useRef, useEffect } from "react";
import styled from "styled-components";
import { VideoPreview } from "./Preview";
import { useElementSize } from "../hooks/get-el-size";

export const Container = styled.div`
  flex: 1;
  display: flex;
  overflow: hidden;
  position: relative;
`;

export const Canvas = () => {
  const ref = useRef<HTMLDivElement>(null);

  const size = useElementSize(ref);

  return (
    <Container ref={ref}>
      {size ? <VideoPreview canvasSize={size} /> : null}
    </Container>
  );
};
