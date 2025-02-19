import { makeConfig } from "@remotion/eslint-config-flat";

const conf = makeConfig({
  remotionDir: ["app/remotion/**"],
});

export default conf;
