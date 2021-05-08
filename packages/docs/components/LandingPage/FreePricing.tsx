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
`;

export const FreePricing: React.FC = () => {
  return (
    <Row>
      <div>
        <Title>Funded by companies</Title>
        <p>
          Remotion is free for individuals - you can even build a business on
          it! <br />
          As a company, you need a license to use Remotion. <br /> In return, we
          keep improving the Remotion experience.
        </p>
      </div>
    </Row>
  );
};
