import { Sandbox } from "@vercel/sandbox";
import { COMP_NAME } from "../../../../types/constants";
import { getRenderScript, OnProgressFn } from "./helpers";
import { BUILD_DIR } from "../../../../build-dir.mjs";
import type { RenderConfig } from "../../../../render";

export async function runRenderInSandbox({
	sandbox,
	inputProps,
	onProgress,
}: {
	sandbox: Sandbox & AsyncDisposable;
	inputProps: Record<string, unknown>;
	onProgress: OnProgressFn;
}): Promise<void> {
	const renderingPhase = "Rendering video...";
	await onProgress({ type: "phase", phase: renderingPhase, progress: 0 });

	// Use the local bundle copied to the sandbox
	const serveUrl = `/vercel/sandbox/${BUILD_DIR}`;

	const renderScript = await getRenderScript();
	await sandbox.writeFiles([
		{
			path: "render.ts",
			content: renderScript,
		},
	]);

	const renderId = crypto.randomUUID();
	const blobToken = process.env.BLOB_READ_WRITE_TOKEN;
	if (!blobToken) {
		throw new Error("BLOB_READ_WRITE_TOKEN is not set");
	}

	const renderConfig: RenderConfig = {
		serveUrl,
		compositionId: COMP_NAME,
		inputProps,
		blobToken,
		blobPath: `renders/${renderId}.mp4`,
	};

	// Run the render script
	const renderCmd = await sandbox.runCommand({
		cmd: "node",
		args: ["--strip-types", "render.ts", JSON.stringify(renderConfig)],
		detached: true,
	});

	let doneUrl: string | null = null;
	let doneSize: number | null = null;

	for await (const log of renderCmd.logs()) {
		if (log.stream === "stdout") {
			try {
				const message = JSON.parse(log.data);
				if (message.type === "progress") {
					await onProgress({
						type: "phase",
						phase: renderingPhase,
						progress: message.progress,
					});
				} else if (message.type === "uploading") {
					await onProgress({
						type: "phase",
						phase: "Uploading video...",
						progress: 1,
					});
				} else if (message.type === "done") {
					doneUrl = message.url;
					doneSize = message.size;
				}
			} catch {
				// Not JSON, ignore
			}
		}
	}

	const renderResult = await renderCmd.wait();
	if (renderResult.exitCode !== 0) {
		const stderr = await renderResult.stderr();
		const stdout = await renderResult.stdout();
		throw new Error(`Render failed: ${stderr} ${stdout}`);
	}

	if (!doneUrl || doneSize === null) {
		throw new Error("Render script did not return upload result");
	}

	await onProgress({
		type: "done",
		url: doneUrl,
		size: doneSize,
	});
}
