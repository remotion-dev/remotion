import { Sandbox } from "@vercel/sandbox";
import path from "path";
import { VERSION } from "remotion/version";
import {
	createDisposableSandbox,
	ensureLocalBundle,
	getEnsureBrowserScript,
	getRemotionBundleFiles,
	OnProgressFn,
} from "./helpers";
import { BUILD_DIR } from "../../../../build-dir.mjs";

export async function createSandbox({
	onProgress,
}: {
	onProgress: OnProgressFn;
}): Promise<Sandbox & AsyncDisposable> {
	const sandbox = await createDisposableSandbox({
		runtime: "node24",
		timeout: 5 * 60 * 1000,
	});

	const preparingPhase = "Preparing machine...";
	const preparingSubtitle = process.env.VERCEL
		? "This only needs to be done once."
		: "This is only needed during development.";

	// Preparation has 3 stages with weights:
	// - System dependencies: 60%
	// - Copying bundle: 20%
	// - Downloading browser: 20%
	const WEIGHT_SYS_DEPS = 0.6;
	const WEIGHT_BUNDLE = 0.2;
	const WEIGHT_BROWSER = 0.2;

	await onProgress({
		type: "phase",
		phase: preparingPhase,
		subtitle: preparingSubtitle,
		progress: 0,
	});

	// Stage 1: Install system dependencies (60%)
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
		await onProgress({
			type: "phase",
			phase: preparingPhase,
			subtitle: preparingSubtitle,
			progress: stageProgress * WEIGHT_SYS_DEPS,
		});
	}

	const sysInstallResult = await sysInstallCmd.wait();
	if (sysInstallResult.exitCode !== 0) {
		throw new Error(
			`System dependencies install failed: ${await sysInstallResult.stderr()}`,
		);
	}

	await onProgress({ type: "phase", phase: "Bundling video...", progress: 0 });
	await ensureLocalBundle();

	// Stage 2: Copy Remotion bundle (20%)
	const bundleFiles = await getRemotionBundleFiles();

	// Create the directories first
	const dirs = new Set<string>();
	for (const file of bundleFiles) {
		const dir = path.dirname(file.path);
		if (dir && dir !== ".") {
			dirs.add(dir);
		}
	}

	for (const dir of Array.from(dirs).sort()) {
		await sandbox.mkDir(BUILD_DIR + "/" + dir);
	}

	// Write all files to the sandbox
	await sandbox.writeFiles(
		bundleFiles.map((file) => ({
			path: BUILD_DIR + "/" + file.path,
			content: file.content,
		})),
	);

	await onProgress({
		type: "phase",
		phase: preparingPhase,
		subtitle: preparingSubtitle,
		progress: WEIGHT_SYS_DEPS + WEIGHT_BUNDLE,
	});

	// Install renderer and blob SDK (part of bundle stage, no separate progress)
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

	// Stage 3: Download browser (20%)
	const ensureBrowserScript = await getEnsureBrowserScript();
	await sandbox.writeFiles([
		{
			path: "ensure-browser.ts",
			content: ensureBrowserScript,
		},
	]);

	const ensureBrowserCmd = await sandbox.runCommand({
		cmd: "node",
		args: ["--strip-types", "ensure-browser.ts"],
		detached: true,
	});

	for await (const log of ensureBrowserCmd.logs()) {
		// Parse browser download progress from JSON output
		if (log.stream === "stdout") {
			try {
				const message = JSON.parse(log.data);
				if (message.type === "browser-progress") {
					const browserProgress = message.percent ?? 0;
					await onProgress({
						type: "phase",
						phase: preparingPhase,
						subtitle: preparingSubtitle,
						progress:
							WEIGHT_SYS_DEPS +
							WEIGHT_BUNDLE +
							browserProgress * WEIGHT_BROWSER,
					});
					continue;
				}
			} catch {
				// Not JSON, ignore
			}
		}
		// Ignore other logs during preparation
	}

	const ensureBrowserResult = await ensureBrowserCmd.wait();
	if (ensureBrowserResult.exitCode !== 0) {
		throw new Error(
			`ensure-browser failed: ${await ensureBrowserResult.stderr()} ${await ensureBrowserResult.stdout()}`,
		);
	}

	return sandbox;
}
