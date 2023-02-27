import { DEFAULT_CLOUDWATCH_RETENTION_PERIOD } from "@remotion/lambda/defaults";
import React from "react";

export const DefaultLogRetention: React.FC = () => {
  return <span>{DEFAULT_CLOUDWATCH_RETENTION_PERIOD}</span>;
};
