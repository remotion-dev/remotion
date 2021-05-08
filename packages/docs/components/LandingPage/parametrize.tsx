import React from "react";
import styled from "styled-components";

const Row = styled.div`
  display: flex;
  flex-direction: row;
  text-align: left;
`;

const Title = styled.h2`
  font-size: 2.5em;
  font-weight: 700;
  font-family: --apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen,
    Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif;
  line-height: 1.1;
  text-align: left;
`;

const Mp4 = styled.span`
  background: linear-gradient(to right, rgb(66, 144, 245), rgb(66, 233, 245));
  -webkit-text-fill-color: transparent;
  -webkit-background-clip: text;
`;

export const Parametrize: React.FC = () => {
  return (
    <Row>
      <div>
        <Title>
          <Mp4>Programmatic</Mp4> content <br />
          and rendering
        </Title>
        <p>
          Fetch data from an API and use it as the content. <br />
          Render videos programmatically using our server-side APIs.
        </p>
      </div>
    </Row>
  );
};
