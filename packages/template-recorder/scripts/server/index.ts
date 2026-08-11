import { spawn } from "child_process";
import { startServer } from "./express-server";

export const startStudioAndServer = async () => {
  await startServer();

  const bunxProcess = spawn("bun", ["x", "remotion", "studio"], {
    stdio: "inherit",
    shell: process.platform === "win32" ? "cmd.exe" : undefined,
    detached: false,
  });

  // Forces the process to crash in case of error
  process.on("uncaughtException", (e) => {
    console.error(e);
    bunxProcess.kill();
  });
};
