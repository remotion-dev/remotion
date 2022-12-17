import { execSync } from "child_process";
import type { CliInput, Layer } from "./payload";

export const compose = ({
  height,
  width,
  layers,
  output,
}: {
  height: number;
  width: number;
  layers: Layer[];
  output: string;
}) => {
  // TODO: Unhardcode
  const bin =
    "/Users/jonathanburger/remotion/packages/compositor/dist/aarch64-apple-darwin/release/compositor";

  const payload: CliInput = {
    v: 1,
    height,
    width,
    layers,
    output,
  };

  // TODO: Don't use sync
  execSync(`${bin} ${JSON.stringify(JSON.stringify(payload))}`);
};
