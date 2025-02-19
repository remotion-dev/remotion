import { startServer } from "./server/server";
import { spawn } from "child_process";

startServer();
spawn("npx", ["remotion", "studio"], {
  stdio: "inherit",
  shell: process.platform === "win32" ? "cmd.exe" : undefined,
});
