import React from "react";
import styled from "styled-components";
import { mobile } from "../layout/layout";
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

const Container = styled.div`
  text-align: center;
  ${mobile`
    text-align: left;
  `}
`;

export const FreePricing: React.FC = () => {
  return (
    <>
      <Container>
        <Title>
          <Mp4>Free</Mp4> for individuals <br /> Funded by companies
        </Title>
        <p>
          Remotion is free for individuals - you can even build a business on
          it! <br />
          As a company, you need a license to use Remotion. <br /> With your
          support, we constantly improve Remotion for everyone.
        </p>
      </Container>
      <PricingTable></PricingTable>
      <br />
      <br />
      <br />
    </>
  );
};
