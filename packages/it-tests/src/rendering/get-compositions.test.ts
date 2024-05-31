import { getCompositions } from "@remotion/renderer";
import { expect, test } from "vitest";

test("getCompositions() should give a good error message if there is no compositions file", async () => {
  // @ts-expect-error
  expect(() => getCompositions()).toThrow(
    "No serve URL or webpack bundle directory was passed to getCompositions()."
  );
});
