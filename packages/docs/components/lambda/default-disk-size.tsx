import { DEFAULT_EPHEMERAL_STORAGE_IN_MB } from "@remotion/lambda/defaults";
import React from "react";

export const DefaultEphemerealStorageInMb: React.FC = () => {
  return <span>{DEFAULT_EPHEMERAL_STORAGE_IN_MB}</span>;
};
