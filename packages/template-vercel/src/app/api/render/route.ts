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
	getRemotionBundleFiles,
	getRenderScript,
	SSEMessage,
} from "./helpers";
import { BUILD_DIR } from "../../../../build-dir.mjs";

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

		const payload = await req.json();
		const body = RenderRequest.parse(payload);

		await send({ type: "phase", phase: "Creating sandbox..." });

		await using sandbox = await createDisposableSandbox({
			runtime: "node24",
			timeout: 5 * 60 * 1000,
		});

		await send({ type: "phase", phase: "Copying Remotion bundle..." });

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
			type: "phase",
			phase: "Installing system dependencies...",
		});

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

		for await (const log of sysInstallCmd.logs()) {
			await send({ type: "log", stream: log.stream, data: log.data });
		}

		const sysInstallResult = await sysInstallCmd.wait();
		if (sysInstallResult.exitCode !== 0) {
			throw new Error(
				`System dependencies install failed: ${await sysInstallResult.stderr()}`,
			);
		}

		await send({ type: "phase", phase: "Installing renderer..." });

		const installCmd = await sandbox.runCommand({
			cmd: "pnpm",
			args: [`i`, `@remotion/renderer@${VERSION}`],
			detached: true,
		});

		for await (const log of installCmd.logs()) {
			await send({ type: "log", stream: log.stream, data: log.data });
		}

		const installResult = await installCmd.wait();
		if (installResult.exitCode !== 0) {
			throw new Error(`pnpm install failed: ${await installResult.stderr()}`);
		}

		await send({ type: "phase", phase: "Rendering video..." });

		// Use the local bundle copied to the sandbox
		const serveUrl = "/vercel/sandbox/" + BUILD_DIR + "/index.html";

		const renderScript = await getRenderScript();
		await sandbox.writeFiles([
			{
				path: "render.mjs",
				content: renderScript,
			},
		]);

		const renderConfig = JSON.stringify({
			serveUrl,
			compositionId: COMP_NAME,
			inputProps: body.inputProps,
		});

		// Run the render script
		const renderCmd = await sandbox.runCommand({
			cmd: "node",
			args: ["render.mjs", renderConfig],
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
	};

	waitUntil(
		runRender().catch(async (err) => {
			console.log(err);
			await send({ type: "error", message: (err as Error).message });
		}),
	);

	return new Response(stream.readable, {
		headers: {
			"Content-Type": "text/event-stream",
			"Cache-Control": "no-cache",
			Connection: "keep-alive",
		},
	});
}
