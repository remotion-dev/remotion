import React from "react";
import styled from "styled-components";
import { PreviewToolbar } from "./PreviewToolbar";
import { Canvas } from "./Canvas";

export const Container = styled.div`
  flex: 2;
  border-bottom: 3px solid black;
  display: flex;
  flex-direction: column;
`;

export const TopPanel = () => {
  return (
    <Container>
      <Canvas></Canvas>
      <PreviewToolbar />
    </Container>
  );
};
