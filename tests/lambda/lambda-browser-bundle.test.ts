import path from "path";
import { tmpdir } from "os";
import fs from "fs";
import { BundlerInternals } from "@remotion/bundler";

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

test("Should be able to bundle @remotion/lambda/client with ESBuild", async () => {
  const outfile = path.join(tmpdir(), "esbuild-test.js");
  const { errors } = await BundlerInternals.esbuild.build({
    platform: "node",
    target: "node14",
    bundle: true,
    logLevel: "silent",
    outfile,
    entryPoints: [require.resolve("@remotion/lambda/client")],
  });
  expect(errors.length).toBe(0);
  fs.unlinkSync(outfile);
});
