import React from "react";
import { AbsoluteFill } from "remotion";
import { Card, paddingAndMargin } from "./Card";

export const Comp: React.FC = () => {
  return (
    <AbsoluteFill
      style={{
        padding: paddingAndMargin,
      }}
    >
      <Card index={0} />
      <Card index={1} />
      <Card index={2} />
      <Card index={3} />
    </AbsoluteFill>
  );
};
