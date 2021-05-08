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

export const Parametrize: React.FC = () => {
  return (
    <Row>
      <div>
        <Title>
          Programmatic content <br />
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
