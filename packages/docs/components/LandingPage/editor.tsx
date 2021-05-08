import React from "react";
import styled from "styled-components";

const Row = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  text-align: right;
`;

const Title = styled.h2`
  font-size: 2.5em;
  font-weight: 700;
  font-family: --apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen,
    Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif;
  line-height: 1.1;
  text-align: right;
`;

const Mp4 = styled.span`
  background: linear-gradient(to right, rgb(66, 144, 245), rgb(66, 233, 245));
  -webkit-text-fill-color: transparent;
  -webkit-background-clip: text;
`;

export const LightningFastEditor: React.FC = () => {
  return (
    <Row>
      <div>
        <Title>
          Fast and <br /> delightful editing
        </Title>
        <p>
          Preview your video in the browser. <br />
          Fast refresh while the video is playing. <br />
          Scrub through the timeline to get every frame perfect.
        </p>
      </div>
    </Row>
  );
};
