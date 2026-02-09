import { put } from "@vercel/blob";
import { waitUntil } from "@vercel/functions";
import path from "path";
import { RenderRequest } from "../../../../types/schema";
import { COMP_NAME } from "../../../../types/constants";
import { VERSION } from "remotion/version";
import {
	createDisposableSandbox,
	createDisposableWriter,
	formatSSE,
	getEnsureBrowserScript,
	getRemotionBundleFiles,
	getRenderScript,
	SSEMessage,
} from "./helpers";
import { BUILD_DIR } from "../../../../build-dir.mjs";
import type { RenderConfig } from "../../../../render";

export async function POST(req: Request) {
	const encoder = new TextEncoder();
	const stream = new TransformStream();
	const writer = stream.writable.getWriter();

	const send = async (message: SSEMessage) => {
		await writer.write(encoder.encode(formatSSE(message)));
	};

	const runRender = async () => {
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		await using _writer = createDisposableWriter(writer);

		try {
			const payload = await req.json();
			const body = RenderRequest.parse(payload);

			await send({ type: "phase", phase: "Creating sandbox..." });

			await using sandbox = await createDisposableSandbox({
				runtime: "node24",
				timeout: 5 * 60 * 1000,
			});

			await send({ type: "phase", phase: "Preparing machine..." });

			// Preparation has 3 stages with weights:
			// - System dependencies: 60%
			// - Copying bundle: 20%
			// - Downloading browser: 20%
			const WEIGHT_SYS_DEPS = 0.6;
			const WEIGHT_BUNDLE = 0.2;
			const WEIGHT_BROWSER = 0.2;

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
				await send({
					type: "progress",
					progress: stageProgress * WEIGHT_SYS_DEPS,
				});
			}

			const sysInstallResult = await sysInstallCmd.wait();
			if (sysInstallResult.exitCode !== 0) {
				throw new Error(
					`System dependencies install failed: ${await sysInstallResult.stderr()}`,
				);
			}

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

			await send({
				type: "progress",
				progress: WEIGHT_SYS_DEPS + WEIGHT_BUNDLE,
			});

			// Install renderer (part of bundle stage, no separate progress)
			const installCmd = await sandbox.runCommand({
				cmd: "pnpm",
				args: [`i`, `@remotion/renderer@${VERSION}`],
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
							await send({
								type: "progress",
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

			await send({ type: "phase", phase: "Rendering video..." });

			// Use the local bundle copied to the sandbox
			const serveUrl = `/vercel/sandbox/${BUILD_DIR}`;

			const renderScript = await getRenderScript();
			await sandbox.writeFiles([
				{
					path: "render.ts",
					content: renderScript,
				},
			]);

			const renderConfig: RenderConfig = {
				serveUrl,
				compositionId: COMP_NAME,
				inputProps: body.inputProps,
			};

			// Run the render script
			const renderCmd = await sandbox.runCommand({
				cmd: "node",
				args: ["--strip-types", "render.ts", JSON.stringify(renderConfig)],
				detached: true,
			});

			for await (const log of renderCmd.logs()) {
				// Parse progress messages from the script
				if (log.stream === "stdout") {
					try {
						const message = JSON.parse(log.data);
						if (message.type === "progress") {
							await send({ type: "progress", progress: message.progress });
							continue;
						}
					} catch {
						// Not JSON, send as regular log
					}
				}
				await send({ type: "log", stream: log.stream, data: log.data });
			}

			const renderResult = await renderCmd.wait();
			if (renderResult.exitCode !== 0) {
				const stderr = await renderResult.stderr();
				const stdout = await renderResult.stdout();
				throw new Error(`Render failed: ${stderr || stdout}`);
			}

			await send({ type: "phase", phase: "Uploading video..." });

			const videoBuffer = await sandbox.readFileToBuffer({
				path: "/tmp/video.mp4",
			});
			if (!videoBuffer) {
				throw new Error("Failed to read rendered video");
			}

			const renderId = crypto.randomUUID();
			const blob = await put(`renders/${renderId}.mp4`, videoBuffer, {
				access: "public",
				contentType: "video/mp4",
			});

			await send({
				type: "done",
				url: blob.url,
				size: videoBuffer.length,
			});
		} catch (err) {
			console.log(err);
			await send({ type: "error", message: (err as Error).message });
		}
	};

	waitUntil(runRender());

	return new Response(stream.readable, {
		headers: {
			"Content-Type": "text/event-stream",
			"Cache-Control": "no-cache",
			Connection: "keep-alive",
		},
	});
}
