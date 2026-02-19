import { spawn } from "child_process";
import { startServer } from "./server/server";

startServer();
spawn("npx", ["remotion", "studio"], {
  stdio: "inherit",
  shell: process.platform === "win32" ? "cmd.exe" : undefined,
});
