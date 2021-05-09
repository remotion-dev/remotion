import React from "react";
import styled from "styled-components";
import { PricingTable } from "./PricingTable";

const Row = styled.div`
  display: flex;
  flex-direction: row;
  text-align: center;
`;

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

export const FreePricing: React.FC = () => {
  return (
    <>
      <div style={{ textAlign: "center" }}>
        <Title>
          <Mp4>Free</Mp4> for individuals <br /> Funded by companies
        </Title>
        <p>
          Remotion is free for individuals - you can even build a business on
          it! <br />
          As a company, you need a license to use Remotion. <br /> In return, we
          keep improving the Remotion experience.
        </p>
      </div>
      <PricingTable></PricingTable>
    </>
  );
};
