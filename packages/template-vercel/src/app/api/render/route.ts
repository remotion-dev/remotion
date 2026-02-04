import { put } from "@vercel/blob";
import { Sandbox } from "@vercel/sandbox";
import { RenderRequest } from "../../../../types/schema";
import {
	COMP_NAME,
	DURATION_IN_FRAMES,
	VIDEO_FPS,
	VIDEO_HEIGHT,
	VIDEO_WIDTH,
} from "../../../../types/constants";

type SSEMessage =
	| { type: "log"; stream: "stdout" | "stderr"; data: string }
	| { type: "progress"; progress: number }
	| { type: "phase"; phase: string }
	| { type: "done"; url: string; size: number }
	| { type: "error"; message: string };

function formatSSE(message: SSEMessage): string {
	return `data: ${JSON.stringify(message)}\n\n`;
}

function generateRenderScript(options: {
	serveUrl: string;
	compositionId: string;
	inputProps: Record<string, unknown>;
	width: number;
	height: number;
	fps: number;
	durationInFrames: number;
}): string {
	return `
const { renderMedia, selectComposition } = require("@remotion/renderer");

async function main() {
	try {
		const composition = await selectComposition({
			serveUrl: ${JSON.stringify(options.serveUrl)},
			id: ${JSON.stringify(options.compositionId)},
			inputProps: ${JSON.stringify(options.inputProps)},
		});

		await renderMedia({
			composition: {
				...composition,
				width: ${options.width},
				height: ${options.height},
				fps: ${options.fps},
				durationInFrames: ${options.durationInFrames},
			},
			serveUrl: ${JSON.stringify(options.serveUrl)},
			codec: "h264",
			outputLocation: "/tmp/video.mp4",
			inputProps: ${JSON.stringify(options.inputProps)},
			onProgress: ({ progress }) => {
				console.log(JSON.stringify({ type: "progress", progress }));
			},
		});

		console.log(JSON.stringify({ type: "done" }));
	} catch (err) {
		console.error(JSON.stringify({ type: "error", message: err.message }));
		process.exit(1);
	}
}

main();
`;
}

export async function POST(req: Request) {
	const serveUrl = process.env.REMOTION_SERVE_URL;
	if (!serveUrl) {
		return new Response(
			JSON.stringify({
				error: "REMOTION_SERVE_URL environment variable is not set",
			}),
			{ status: 500, headers: { "Content-Type": "application/json" } },
		);
	}

	const snapshotId = process.env.SANDBOX_SNAPSHOT_ID;

	let sandbox: Sandbox | null = null;

	const encoder = new TextEncoder();
	const stream = new TransformStream();
	const writer = stream.writable.getWriter();

	const send = async (message: SSEMessage) => {
		await writer.write(encoder.encode(formatSSE(message)));
	};

	const runRender = async () => {
		try {
			const payload = await req.json();
			const body = RenderRequest.parse(payload);

			// If we have a snapshot, use it to skip setup
			if (snapshotId) {
				await send({
					type: "phase",
					phase: "Creating sandbox from snapshot...",
				});

				sandbox = await Sandbox.create({
					source: { type: "snapshot", snapshotId },
					timeout: 5 * 60 * 1000,
				});
			} else {
				await send({ type: "phase", phase: "Creating sandbox..." });

				sandbox = await Sandbox.create({
					runtime: "node24",
					timeout: 5 * 60 * 1000,
				});

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
					args: ["install", "@remotion/renderer@latest"],
					detached: true,
				});

				for await (const log of installCmd.logs()) {
					await send({ type: "log", stream: log.stream, data: log.data });
				}

				const installResult = await installCmd.wait();
				if (installResult.exitCode !== 0) {
					throw new Error(
						`pnpm install failed: ${await installResult.stderr()}`,
					);
				}
			}

			await send({ type: "phase", phase: "Rendering video..." });

			const renderScript = generateRenderScript({
				serveUrl,
				compositionId: COMP_NAME,
				inputProps: body.inputProps,
				width: VIDEO_WIDTH,
				height: VIDEO_HEIGHT,
				fps: VIDEO_FPS,
				durationInFrames: DURATION_IN_FRAMES,
			});

			await sandbox.writeFiles([
				{
					path: "render.cjs",
					content: Buffer.from(renderScript),
				},
			]);

			// Run the render script
			const renderCmd = await sandbox.runCommand({
				cmd: "node",
				args: ["render.cjs"],
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
			await send({ type: "error", message: (err as Error).message });
		} finally {
			if (sandbox) {
				await sandbox.stop().catch(() => {});
			}
			await writer.close();
		}
	};

	runRender();

	return new Response(stream.readable, {
		headers: {
			"Content-Type": "text/event-stream",
			"Cache-Control": "no-cache",
			Connection: "keep-alive",
		},
	});
}
