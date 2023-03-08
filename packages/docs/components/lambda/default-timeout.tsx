import { DEFAULT_TIMEOUT } from "@remotion/lambda/defaults";
import React from "react";

export const DefaultTimeout: React.FC = () => {
  return <span>{DEFAULT_TIMEOUT}</span>;
};
