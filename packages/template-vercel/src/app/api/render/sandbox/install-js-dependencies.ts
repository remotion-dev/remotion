import { Sandbox } from "@vercel/sandbox";
import { VERSION } from "remotion/version";

export async function installJsDependencies({
	sandbox,
}: {
	sandbox: Sandbox;
}): Promise<void> {
	const installCmd = await sandbox.runCommand({
		cmd: "pnpm",
		args: [`i`, `@remotion/renderer@${VERSION}`, `@vercel/blob`],
		detached: true,
	});

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	for await (const _log of installCmd.logs()) {
		// Consume logs without displaying
	}

	const installResult = await installCmd.wait();
	if (installResult.exitCode !== 0) {
		throw new Error(`pnpm install failed: ${await installResult.stderr()}`);
	}
}
