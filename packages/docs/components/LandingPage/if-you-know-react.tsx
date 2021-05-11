import React from "react";
import styled from "styled-components";
import { BlueButton } from "../layout/Button";
import { mobile } from "../layout/layout";
import { Spacer } from "../layout/Spacer";
import { CodeExample } from "./CodeExample";

const Row = styled.div`
  display: flex;
  flex-direction: row;
  text-align: right;
  justify-content: flex-end;
  align-items: center;
  ${mobile`
    flex-direction: column-reverse;
    text-align: left;
    justify-content: flex-start;
    align-items: flex-start;
  `}
`;

const Title = styled.h2`
  font-size: 2.5em;
  font-weight: 700;
  font-family: --apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen,
    Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif;
  line-height: 1.1;
  text-align: right;
  ${mobile`
    text-align: left;
  `}
`;

const Rea = styled.span`
  background: linear-gradient(to right, rgb(66, 144, 245), rgb(66, 233, 245));
  -webkit-text-fill-color: transparent;
  -webkit-background-clip: text;
`;

const A = styled.a`
  display: inline-block;
  ${mobile`
  
  margin-bottom: 80px;
  `};
  &:hover  {
    text-decoration: none;
  }
`;

export const IfYouKnowReact: React.FC = () => {
  return (
    <Row>
      <CodeExample></CodeExample>
      <div style={{ width: 40 }}></div>
      <div>
        <Title>
          If you know <Rea>React</Rea> <br />
          you can make videos.
        </Title>
        <p>
          Remotion gives you the tools for video creation, <br /> but the rules
          of React stay the same. <br />
          <br />
          Learn the fundamentals in just a few minutes.
          <Spacer></Spacer>
          <Spacer></Spacer>
          <A href="/docs/the-fundamentals">
            <BlueButton size="sm" fullWidth={false} loading={false}>
              Learn Remotion
            </BlueButton>
          </A>
        </p>
      </div>
    </Row>
  );
};
