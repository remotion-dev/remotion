import { Sandbox } from "@vercel/sandbox";
import { readdir, readFile } from "fs/promises";
import path from "path";
import { BUILD_DIR } from "../../../../build-dir.mjs";

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
	const bundleDir = path.join(process.cwd(), BUILD_DIR);

	const remotionDir = bundleDir;

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

export async function getRenderScript(): Promise<Buffer> {
	const renderScriptPath = path.join(process.cwd(), "render.ts");
	return readFile(renderScriptPath);
}

export async function getEnsureBrowserScript(): Promise<Buffer> {
	const scriptPath = path.join(process.cwd(), "ensure-browser.mjs");
	return readFile(scriptPath);
}
