import { Sandbox } from "@vercel/sandbox";
import { readFile } from "fs/promises";
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

export type RenderProgress =
	| { type: "phase"; phase: string; progress: number; subtitle?: string }
	| { type: "done"; url: string; size: number }
	| { type: "error"; message: string };

export type OnProgressFn = (message: RenderProgress) => Promise<void>;

export function formatSSE(message: RenderProgress): string {
	return `data: ${JSON.stringify(message)}\n\n`;
}

export async function getRenderScript(): Promise<Buffer> {
	const renderScriptPath = path.join(process.cwd(), "render.ts");
	return readFile(renderScriptPath);
}
