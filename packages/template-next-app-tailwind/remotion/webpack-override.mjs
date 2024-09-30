import { enableTailwind } from "@remotion/tailwind";

/**
 *  @param {import('webpack').Configuration} currentConfig
 */
export const webpackOverride = (currentConfig) => {
  return enableTailwind(currentConfig);
};
