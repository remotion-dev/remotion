import React, { useState } from "react";
import styled, { keyframes } from "styled-components";
import { BlueButton } from "../layout/Button";
import { GithubButton } from "./GithubButton";

const Row = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
`;

const CodeBlock = styled.div`
  background-color: #333;
  padding: 12px 16px;
  border-radius: 8px;
  color: white;
  font: var(--ifm-code-font-size) / var(--ifm-pre-line-height)
    var(--ifm-font-family-monospace);
  cursor: pointer;
  &:hover {
    background-color: #444;
  }
`;

const A = styled.a`
  &:hover {
    text-decoration: none;
  }
`;

const animation = keyframes`
  0% {
    transform: translateY(-18px);
    opacity: 0;
  }

  30% {
    opacity: 0.7;
  }
  70% {
    opacity: 0.7;
  }
  100% {
    transform: translateY(-23px);
    opacity: 0;
  }
`;

const Copied = styled.div`
  position: absolute;
  animation: ${animation} 0.7s linear;
  z-index: 0;
  animation-fill-mode: forwards;
  top: 0;
  font: var(--ifm-code-font-size) / var(--ifm-pre-line-height)
    var(--ifm-font-family-monospace);
  font-size: 13px;
  width: 100%;
  text-align: center;
`;

export const GetStarted: React.FC = () => {
  const [clicked, setClicked] = useState<number | null>(null);
  return (
    <>
      <Row>
        <div style={{ position: "relative" }}>
          {clicked ? <Copied key={clicked}>Copied!</Copied> : null}
          <CodeBlock
            onClick={() => {
              navigator.clipboard.writeText("npm init video");

              setClicked(Date.now());
            }}
            title="Click to copy"
          >
            $ npm init video
          </CodeBlock>
        </div>
        <div style={{ width: 10 }}></div>
        <A href="/docs">
          <BlueButton size="sm" loading={false} fullWidth={false}>
            Docs
          </BlueButton>
        </A>
        <div style={{ width: 10 }}></div>
        <A href="https://github.com/JonnyBurger/remotion">
          <BlueButton size="sm" loading={false} fullWidth={false}>
            <GithubButton></GithubButton>
          </BlueButton>
        </A>
      </Row>
      <div style={{ height: 10 }}></div>
      <Row></Row>
    </>
  );
};
