import { existsSync } from "fs";
import { parsedCli } from "./parse-command-line";
import { ConfigInternals } from "./config";
import { Log } from "./log";

export const getEntryPoint = () => {
	let file: string | null = parsedCli._[1];
  if (file) return file;

  file = ConfigInternals.getEntryPoint();
  if (file) return file;

  if (existsSync("./src/index.tsx")) file = "src/index.tsx";
  else if (existsSync("./src/index.ts")) file = "src/index.ts";
  else if (existsSync("./src/index.js")) file = "src/index.js";
  else if (existsSync("./remotion/index.js")) file = "remotion/index.js";

  if (file) {
    Log.verbose(`No entry point specified. Using ${file} as fallback`);
    return file;
  }

  return null;
}