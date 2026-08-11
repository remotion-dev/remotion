import {app} from "electron";
import path from "node:path";
import {renderVideo} from "./render-video";

export function getIntegrationRenderOutputPath(): string | null {
  const flagIndex = process.argv.indexOf("--integration-render-test");

  if (flagIndex === -1) {
    return null;
  }

  return process.argv[flagIndex + 1] ?? null;
}

export async function runIntegrationRenderTest(
  outputPath: string,
): Promise<void> {
  if (!path.isAbsolute(outputPath)) {
    throw new Error("Integration render output path must be absolute.");
  }

  try {
    const result = await renderVideo({
      isPackaged: app.isPackaged,
      outputPath,
      projectRoot: app.getAppPath(),
      titleText: "Integration render test",
      onUpdate: (update) => {
        if (update.type === "status") {
          console.log("[integration-render] " + update.message);
          return;
        }

        console.log(
          "[integration-render] " +
            update.stage +
            ": " +
            Math.round(update.progress) +
            "%",
        );
      },
    });

    console.log("[integration-render] complete: " + result.outputPath);
    app.exit(0);
  } catch (error) {
    const message =
      error instanceof Error ? error.stack ?? error.message : String(error);
    console.error(`[integration-render] failed: ${message}`);
    app.exit(1);
  }
}
