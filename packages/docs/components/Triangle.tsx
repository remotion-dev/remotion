import React from "react";
import styled from "styled-components";

const Container = styled.svg`
  transform: rotate(90deg);
`;

export const Triangle: React.FC<{
  size: number;
  opacity: number;
  color1?: string;
}> = ({ size, opacity, color1 = "#42e9f5" }) => {
  return (
    <Container
      width={size}
      height={size}
      style={{ opacity }}
      viewBox="-100 -100 400 400"
    >
      <g stroke={color1} strokeWidth="100" strokeLinejoin="round">
        <path
          fill={color1}
          d="M 2 172 a 196 100 0 0 0 195 5 A 196 240 0 0 0 100 2.259 A 196 240 0 0 0 2 172 z"
        />
      </g>
    </Container>
  );
};
