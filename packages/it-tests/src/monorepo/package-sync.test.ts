import { expect, test } from "bun:test";

import { CliInternals } from "@remotion/cli";
import { CreateVideoInternals } from "create-video";

test("create-video and cli should have the same list of packages", () => {
  expect(CreateVideoInternals.listOfRemotionPackages).toEqual(
    CliInternals.listOfRemotionPackages
  );
});
