import {expect, test} from 'bun:test';

test('Serverless client should not contain certain things', async () => {
	const resolve = Bun.resolveSync('@remotion/serverless/client', __dirname);
	const out = await Bun.build({
		entrypoints: [resolve],
		external: ['remotion'],
	});
	if (!out.success) {
		throw new Error(out.logs.join('\n'));
	}

	const output = await out.outputs[0].text();
	expect(output).not.toContain('node:tty');
});

test('@remotion/renderer/pure client', async () => {
	const resolve = Bun.resolveSync('@remotion/renderer/pure', __dirname).replace(
		'pure',
		'dist/pure',
	);
	const out = await Bun.build({
		entrypoints: [resolve],
	});
	if (!out.success) {
		throw new Error(out.logs.join('\n'));
	}

	const output = await out.outputs[0].text();
	expect(output).not.toContain('node:tty');
});
