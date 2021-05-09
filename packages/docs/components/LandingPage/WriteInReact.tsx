import React, { useState } from "react";
import styled from "styled-components";
import styles from "../../src/pages/styles.module.css";
import { mobile } from "../layout/layout";
import { GetStarted } from "./GetStartedStrip";
import { PlayerPreview } from "./PlayerPreview";

const Row = styled.div`
  flex-direction: row;
  display: flex;
  ${mobile`
    flex-direction: column;
  `}
`;

const Title = styled.h1`
  font-size: 5em;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen,
    Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif;
  font-weight: 700;
  line-height: 1;
  -webkit-text-fill-color: transparent;
  background: linear-gradient(
    to right,
    var(--text-color),
    var(--light-text-color)
  );
  -webkit-background-clip: text;
  width: 500px;
`;

const Snippet: React.FC<{
  snippetValue: string;
}> = ({ snippetValue }) => {
  const [copied, setCopied] = useState(false);
  return (
    <div className={styles.snippet}>
      <div className={styles.snippetValue}>$ {snippetValue}</div>
      <div
        className={styles.copySnippet}
        onClick={() => {
          navigator.clipboard.writeText(snippetValue);
          setCopied(true);
        }}
      >
        {copied ? "Copied!" : "Copy"}
      </div>
    </div>
  );
};

const Right = styled.div`
  flex: 1;
  ${mobile`
  margin-top: 30px;
  `}
`;

export const WriteInReact: React.FC = () => {
  return (
    <Row>
      <div style={{ flex: 1 }}>
        <Title>
          Write videos <br /> in React.
        </Title>
        <p>
          Use your React knowledge to create real MP4 videos. <br /> Scale your
          video production using server-side rendering and parametrization.
        </p>

        <GetStarted></GetStarted>
      </div>
      <Right>
        <PlayerPreview />
      </Right>
    </Row>
  );
};
