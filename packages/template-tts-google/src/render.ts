import { startServer } from "./server/server";
import { spawn } from "child_process";

export const render = async () => {
  const server = startServer();

  await new Promise<void>((resolve, reject) => {
    const proc = spawn("npx", ["remotion", "render"], {
      stdio: "inherit",
      shell: process.platform === "win32" ? "cmd.exe" : undefined,
    });
    proc.on("exit", (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error("Rendering failed"));
      }
    });
  });

  console.log("Finished rendering");
  return server.close();
};

render();
