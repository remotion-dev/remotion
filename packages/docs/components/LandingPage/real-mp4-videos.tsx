import React from "react";
import styled from "styled-components";

const Title = styled.h2`
  font-size: 2.5em;
  font-weight: 700;
  font-family: --apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen,
    Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif;
  line-height: 1.1;
`;

export const RealMP4Videos: React.FC = () => {
  return (
    <div>
      <Title>Real MP4 videos</Title>
    </div>
  );
};
