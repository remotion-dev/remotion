import { Sandbox } from "@vercel/sandbox";
import { RenderRequest } from "../../../../types/schema";
import {
	COMP_NAME,
	DURATION_IN_FRAMES,
	VIDEO_FPS,
	VIDEO_HEIGHT,
	VIDEO_WIDTH,
} from "../../../../types/constants";

const REPO_URL = "https://github.com/remotion-dev/template-vercel.git";

type SSEMessage =
	| { type: "log"; stream: "stdout" | "stderr"; data: string }
	| { type: "phase"; phase: string }
	| { type: "done"; url: string; size: number }
	| { type: "error"; message: string };

function formatSSE(message: SSEMessage): string {
	return `data: ${JSON.stringify(message)}\n\n`;
}

export async function POST(req: Request) {
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

			await send({ type: "phase", phase: "Creating sandbox..." });

			sandbox = await Sandbox.create({
				runtime: "node24",
				timeout: 5 * 60 * 1000,
				source: {
					type: "git",
					url: REPO_URL,
				},
			});

			await send({ type: "phase", phase: "Installing system dependencies..." });

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

			await send({ type: "phase", phase: "Installing npm dependencies..." });

			const installCmd = await sandbox.runCommand({
				cmd: "pnpm",
				args: ["install"],
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

			const renderCmd = await sandbox.runCommand({
				cmd: "pnpm",
				args: [
					"exec",
					"remotion",
					"render",
					"src/remotion/index.ts",
					COMP_NAME,
					"out/video.mp4",
					"--props",
					JSON.stringify(body.inputProps),
					"--width",
					String(VIDEO_WIDTH),
					"--height",
					String(VIDEO_HEIGHT),
					"--fps",
					String(VIDEO_FPS),
					"--frames",
					`0-${DURATION_IN_FRAMES - 1}`,
				],
				detached: true,
			});

			for await (const log of renderCmd.logs()) {
				await send({ type: "log", stream: log.stream, data: log.data });
			}

			const renderResult = await renderCmd.wait();
			if (renderResult.exitCode !== 0) {
				const stderr = await renderResult.stderr();
				const stdout = await renderResult.stdout();
				throw new Error(`Render failed: ${stderr || stdout}`);
			}

			await send({ type: "phase", phase: "Reading output..." });

			const videoBuffer = await sandbox.readFileToBuffer({
				path: "out/video.mp4",
			});
			if (!videoBuffer) {
				throw new Error("Failed to read rendered video");
			}

			await send({
				type: "done",
				url: `data:video/mp4;base64,${videoBuffer.toString("base64")}`,
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
