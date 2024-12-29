import {expect, test} from 'bun:test';
import {unlinkSync} from 'fs';
import path from 'node:path';

test('Bundle size of media parser', async () => {
	const content = `import {parseMedia} from "@remotion/media-parser"; console.log(parseMedia);`;
	const entryPoint = path.join(__dirname, 'media-parser-index.ts');
	await Bun.write(entryPoint, content);

	const result = await Bun.build({
		entrypoints: [entryPoint],
		minify: true,
		root: __dirname,
		format: 'esm',
	});
	unlinkSync(entryPoint);
	if (!result.success) {
		throw new Error('Build failed');
	}

	const [output] = result.outputs;
	expect(output.size).toBeLessThan(200_000);
});

test('Bundle size of webcodecs', async () => {
	const content = `import {parseMedia} from "@remotion/media-parser"; console.log(parseMedia); import {convertMedia} from "@remotion/webcodecs"; console.log(convertMedia);`;
	const entryPoint = path.join(__dirname, 'media-parser-index.ts');
	await Bun.write(entryPoint, content);

	const result = await Bun.build({
		entrypoints: [entryPoint],
		minify: true,
		root: __dirname,
		format: 'esm',
	});
	unlinkSync(entryPoint);
	if (!result.success) {
		throw new Error(result.logs.toString());
	}

	const [output] = result.outputs;
	expect(output.size).toBeLessThan(200_000);
});
