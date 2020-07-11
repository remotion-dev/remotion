import React from "react";
import styled from "styled-components";
import { getVideo } from "@jonny/motion-core";

const Video = getVideo();

const Background = styled.div`
  background: #222;
  display: flex;
  width: 100%;
  height: 100%;
`;

export const Editor = () => {
  return (
    <Background>
      <Video />
    </Background>
  );
};
