import React from "react";
import styled, { keyframes } from "styled-components";

const radius = 10;
const strokeWidth = 2.5;
const actualR = radius - strokeWidth;

export const Container = styled.div`
  width: ${radius * 2}px;
  height: ${radius * 2}px;
  border-radius: ${radius}px;
  margin-left: 10px;
`;

const circumference = 2 * actualR * Math.PI;
const anim = keyframes`
    from {
        stroke-dashoffset: 0
    }
    to {
        stroke-dashoffset: ${circumference}
    }
`;

const Circle = styled.circle`
  animation: ${anim} 2s infinite linear;
`;

export const ButtonSpinner: React.FC = () => {
  return (
    <Container>
      <svg viewBox="0 0 20 20">
        <Circle
          r={actualR}
          cx={radius}
          cy={radius}
          stroke="currentColor"
          strokeDasharray={`${circumference / 2}`}
          strokeLinecap="round"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
      </svg>
    </Container>
  );
};
