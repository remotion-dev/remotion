import webpack from "webpack";
import fs from "fs";
import path from "path";
import os from "os";
import { promisify } from "util";
import execa from "execa";

const entry = require.resolve("./entry");

const promisified = promisify(webpack);

export const bundle = async () => {
  const tmpDir = await fs.promises.mkdtemp(
    path.join(os.tmpdir(), "react-motion-graphics")
  );
  const output = await promisified([
    {
      entry,
      mode: "development",
      output: {
        filename: "bundle.js",
        path: tmpDir,
      },
    },
  ]);
  const errors = output!.toJson().errors;
  if (errors.length > 0) {
    throw new Error(errors[0]);
  }
  await execa("cp", [
    path.join(__dirname, "..", "static", "index.html"),
    tmpDir,
  ]);
  return tmpDir;
};
