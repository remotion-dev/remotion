import { Sandbox } from "@vercel/sandbox";
import { execSync } from "child_process";
import { existsSync } from "fs";
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
	| { type: "phase"; phase: string; progress: number; subtitle?: string }
	| { type: "done"; url: string; size: number }
	| { type: "error"; message: string };

export function formatSSE(message: SSEMessage): string {
	return `data: ${JSON.stringify(message)}\n\n`;
}

export async function ensureLocalBundle(): Promise<void> {
	if (process.env.VERCEL) {
		return;
	}

	const bundleDir = path.join(process.cwd(), BUILD_DIR);
	if (!existsSync(bundleDir)) {
		try {
			execSync(`node_modules/.bin/remotion bundle --out-dir ./${BUILD_DIR}`, {
				cwd: process.cwd(),
				stdio: "pipe",
			});
		} catch (e) {
			const stderr = (e as { stderr?: Buffer }).stderr?.toString() ?? "";
			throw new Error(`Remotion bundle failed: ${stderr}`);
		}
	}
}

export async function getRenderScript(): Promise<Buffer> {
	const renderScriptPath = path.join(process.cwd(), "render.ts");
	return readFile(renderScriptPath);
}

export async function getEnsureBrowserScript(): Promise<Buffer> {
	const scriptPath = path.join(process.cwd(), "ensure-browser.ts");
	return readFile(scriptPath);
}
