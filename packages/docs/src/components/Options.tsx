import { BrowserSafeApis } from "@remotion/renderer/client";
import type React from "react";

export const Options: React.FC<{
  id: string;
}> = ({ id }) => {
  const option = getOption(id);

  return option.description;
};

const options = Object.values(BrowserSafeApis.options);

const getOption = (id: string) => {
  const option = options.find((o) => o.cliFlag === id);

  if (!option) {
    throw new Error('Unknown option "' + id + '"');
  }

  return option;
};
