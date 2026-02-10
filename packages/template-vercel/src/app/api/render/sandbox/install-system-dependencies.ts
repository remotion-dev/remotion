import { Sandbox } from "@vercel/sandbox";

export async function installSystemDependencies({
	sandbox,
	onProgress,
}: {
	sandbox: Sandbox;
	onProgress: (progress: number) => Promise<void>;
}): Promise<void> {
	const sysInstallCmd = await sandbox.runCommand({
		cmd: "sudo",
		args: [
			"dnf",
			"install",
			"-y",
			"nss",
			"atk",
			"at-spi2-atk",
			"cups-libs",
			"libdrm",
			"libXcomposite",
			"libXdamage",
			"libXrandr",
			"mesa-libgbm",
			"alsa-lib",
			"pango",
			"gtk3",
		],
		detached: true,
	});

	// We empirically tested how many lines are printed to stdout when installing the system dependencies:
	const EXPECTED_SYS_INSTALL_LINES = 272;
	let sysInstallLineCount = 0;
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	for await (const _log of sysInstallCmd.logs()) {
		sysInstallLineCount++;
		const stageProgress = Math.min(
			sysInstallLineCount / EXPECTED_SYS_INSTALL_LINES,
			1,
		);
		await onProgress(stageProgress);
	}

	const sysInstallResult = await sysInstallCmd.wait();
	if (sysInstallResult.exitCode !== 0) {
		throw new Error(
			`System dependencies install failed: ${await sysInstallResult.stderr()}`,
		);
	}
}
