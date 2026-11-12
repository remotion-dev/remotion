import type {TestContext} from 'vitest';
import {server} from 'vitest/browser';

export const createFontFailureRecorder = (context: TestContext) => {
	const files = new Map<
		string,
		{contents: string; encoding: 'base64' | null}
	>();
	context.onTestFailed(async () => {
		const directory = `src/test/__screenshots__/native-pixel-failures/${server.browser}/font-${context.task.id}-${crypto.randomUUID()}`;
		for (const [name, {contents, encoding}] of files) {
			const target = `${directory}/${name.replace(/^validation\//, '')}`;
			if (encoding === 'base64')
				await server.commands.writeFile(target, contents, 'base64');
			else await server.commands.writeFile(target, contents);
		}
	});
	return {
		record: (
			name: string,
			contents: string,
			encoding: 'base64' | null = null,
		) => {
			files.set(name, {contents, encoding});
		},
		png: async (name: string, blob: Blob) => {
			let binary = '';
			for (const byte of new Uint8Array(await blob.arrayBuffer()))
				binary += String.fromCharCode(byte);
			files.set(name, {contents: btoa(binary), encoding: 'base64'});
		},
	};
};
