import { Sandbox } from "@vercel/sandbox";
import { readdir, readFile } from "fs/promises";
import path from "path";

export const createDisposableSandbox = async (
	options: Parameters<typeof Sandbox.create>[0],
): Promise<Sandbox & AsyncDisposable> => {
	const sandbox = await Sandbox.create(options);
	return Object.assign(sandbox, {
		[Symbol.asyncDispose]: async () => {
			await sandbox.stop().catch(() => {});
		},
	});
};

export const createDisposableWriter = (
	writer: WritableStreamDefaultWriter<Uint8Array>,
): WritableStreamDefaultWriter<Uint8Array> & AsyncDisposable => {
	return Object.assign(writer, {
		[Symbol.asyncDispose]: async () => {
			await writer.close();
		},
	});
};

export async function getRemotionBundleFiles(): Promise<
	{ path: string; content: Buffer }[]
> {
	const remotionDir = path.join(__dirname, "../../.remotion");

	// Debug logging to verify paths
	console.log("__dirname:", __dirname);
	console.log("remotionDir:", remotionDir);

	const parentDir = path.dirname(remotionDir);
	const grandparentDir = path.dirname(parentDir);

	try {
		const parentContents = await readdir(parentDir);
		console.log(`Contents of ${parentDir}:`, parentContents);
	} catch {
		console.log(`Could not read ${parentDir}`);
	}

	try {
		const grandparentContents = await readdir(grandparentDir);
		console.log(`Contents of ${grandparentDir}:`, grandparentContents);
	} catch {
		console.log(`Could not read ${grandparentDir}`);
	}

	try {
		const remotionContents = await readdir(remotionDir);
		console.log(`Contents of ${remotionDir}:`, remotionContents);
	} catch {
		console.log(`Could not read ${remotionDir}`);
	}

	const files: { path: string; content: Buffer }[] = [];

	async function readDirRecursive(dir: string, basePath: string = "") {
		const entries = await readdir(dir, { withFileTypes: true });
		for (const entry of entries) {
			const fullPath = path.join(dir, entry.name);
			const relativePath = path.join(basePath, entry.name);
			if (entry.isDirectory()) {
				await readDirRecursive(fullPath, relativePath);
			} else {
				const content = await readFile(fullPath);
				files.push({ path: relativePath, content });
			}
		}
	}

	await readDirRecursive(remotionDir);
	return files;
}

export type SSEMessage =
	| { type: "log"; stream: "stdout" | "stderr"; data: string }
	| { type: "progress"; progress: number }
	| { type: "phase"; phase: string }
	| { type: "done"; url: string; size: number }
	| { type: "error"; message: string };

export function formatSSE(message: SSEMessage): string {
	return `data: ${JSON.stringify(message)}\n\n`;
}

export function generateRenderScript(options: {
	serveUrl: string;
	compositionId: string;
	inputProps: Record<string, unknown>;
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
			composition,
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
