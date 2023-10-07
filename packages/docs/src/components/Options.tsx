import type { AnyRemotionOption } from "@remotion/renderer";
import { BrowserSafeApis } from "@remotion/renderer/client";
import type React from "react";

export const Options: React.FC<{
  id: string;
  cli?: boolean;
}> = ({ id, cli }) => {
  const option = getOption(id);

  return option.description(cli ? "cli" : "ssr") as JSX.Element;
};

const options = Object.values(BrowserSafeApis.options);

const getOption = (id: string): AnyRemotionOption => {
  const option = options.find((o) => o.cliFlag === id);

  if (!option) {
    throw new Error('Unknown option "' + id + '"');
  }

  return option;
};
