import {expect, test} from 'bun:test';

test('@remotion/renderer/pure client', async () => {
	const resolve = Bun.resolveSync('@remotion/renderer/pure', __dirname);
	const out = await Bun.build({
		entrypoints: [resolve],
	});
	if (!out.success) {
		throw new Error(out.logs.join('\n'));
	}

	const output = await out.outputs[0].text();
	expect(output).not.toContain('node:tty');
});
