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

const Rea = styled.span`
  background: linear-gradient(to right, rgb(66, 144, 245), rgb(66, 233, 245));
  -webkit-text-fill-color: transparent;
  -webkit-background-clip: text;
`;

const Button = styled.div`
  padding: 10px 16px;
  background-color: rgb(66, 144, 245);
  display: inline-block;
  border-radius: 3px;
  color: white;
  font-weight: bold;
`;

export const IfYouKnowReact: React.FC = () => {
  return (
    <Row>
      <div>
        <Title>
          If you know <Rea>React</Rea> <br />
          you can make videos.
        </Title>
        <p>
          Remotion is a small set of utilities for video creation in React.{" "}
          <br /> The rules of React stay the same. <br />
          Learn the fundamentals in just a few minutes:
        </p>
        <Button>Learn Remotion</Button>
      </div>
    </Row>
  );
};
