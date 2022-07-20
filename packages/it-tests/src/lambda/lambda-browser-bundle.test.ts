import path from "path";
import { tmpdir } from "os";
import fs from "fs";
import { BundlerInternals } from "@remotion/bundler";
import { describe, expect, test } from "vitest";

test("Should not be able to bundle @remotion/lambda directly", async () => {
  expect(() =>
    BundlerInternals.esbuild.build({
      platform: "node",
      target: "node14",
      bundle: true,
      entryPoints: [require.resolve("@remotion/lambda")],
      logLevel: "silent",
    })
  ).rejects.toThrow(/Could not resolve "pnpapi"/);
});

describe("Should be able to bundle @remotion/lambda/client with ESBuild", () => {
  const outfile = path.join(tmpdir(), "esbuild-test.js");

  test("Should build without errors", async () => {
    const { errors } = await BundlerInternals.esbuild.build({
      platform: "node",
      target: "node14",
      bundle: true,
      logLevel: "silent",
      outfile,
      entryPoints: [require.resolve("@remotion/lambda/client")],
    });
    expect(errors.length).toBe(0);
  });

  test("Bundle should be below 6MB", async () => {
    const file = await fs.promises.readFile(outfile, "utf-8");
    expect(file.length).toBeGreaterThan(10000);
    expect(file.length).toBeLessThanOrEqual(6000000);
  });

  test("Bundle should not include Renderer", async () => {
    const file = await fs.promises.readFile(outfile, "utf-8");
    expect(file).not.toContain("@remotion/renderer");
  });

  test("Should be able to delete it", () => {
    fs.unlinkSync(outfile);
  });
});
