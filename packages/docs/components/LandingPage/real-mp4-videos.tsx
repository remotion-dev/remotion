import React from "react";
import styled from "styled-components";

const Title = styled.h2`
  font-size: 2.5em;
  font-weight: 700;
  font-family: --apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen,
    Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif;
  line-height: 1.1;
`;

const Mp4 = styled.span`
  background: linear-gradient(to right, rgb(66, 144, 245), rgb(66, 233, 245));
  -webkit-text-fill-color: transparent;
  -webkit-background-clip: text;
`;

export const RealMP4Videos: React.FC = () => {
  return (
    <div>
      <Title>
        Real <Mp4>.mp4</Mp4> videos
      </Title>
      <p>
        Remotion renders all frames to images <br /> and encodes them to a real
        video - audio support included. <br /> WebM and other formats are also
        supported.
      </p>
    </div>
  );
};
