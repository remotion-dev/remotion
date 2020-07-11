import React from "react";
import styled from "styled-components";
import { getVideo } from "@jonny/motion-core";
import { SizeSelector } from "./SizeSelector";
import { TopPanel } from "./TopPanel";
import { TimelineContainer } from "./Timeline";

const Background = styled.div`
  background: #222;
  display: flex;
  width: 100%;
  height: 100%;
  flex-direction: column;
  position: absolute;
`;

export const Editor = () => {
  return (
    <Background>
      <TopPanel></TopPanel>
      <TimelineContainer></TimelineContainer>
    </Background>
  );
};
