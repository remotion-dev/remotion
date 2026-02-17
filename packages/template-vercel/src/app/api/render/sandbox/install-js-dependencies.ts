import { Sandbox } from "@vercel/sandbox";
import { VERSION } from "remotion/version";

export async function installJsDependencies({
  sandbox,
}: {
  sandbox: Sandbox;
}): Promise<void> {
  const installCmd = await sandbox.runCommand({
    cmd: "pnpm",
    args: [
      `i`,
      `@remotion/renderer@${VERSION}`,
      `@remotion/compositor-linux-x64-gnu@${VERSION}`,
      `@vercel/blob`,
    ],
    detached: true,
  });

  for await (const _log of installCmd.logs()) {
    console.log(_log.data);
  }

  const installResult = await installCmd.wait();
  if (installResult.exitCode !== 0) {
    throw new Error(`pnpm install failed: ${await installResult.stderr()}`);
  }
}
