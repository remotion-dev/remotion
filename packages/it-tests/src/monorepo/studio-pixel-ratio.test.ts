import {expect, test} from 'bun:test';
import path from 'path';

test('Studio canvas uses the device pixel ratio by default', () => {
	const modulePath = path.join(
		__dirname,
		'..',
		'..',
		'..',
		'studio',
		'src',
		'helpers',
		'studio-pixel-ratio.ts',
	);

	const result = Bun.spawnSync([
		process.execPath,
		'--eval',
		`
		globalThis.window = {
			location: {search: ''},
			sessionStorage: {getItem: () => null},
			devicePixelRatio: 2,
		};
		const {getStudioPixelRatio} = await import(${JSON.stringify(modulePath)});
		const initialPixelRatio = getStudioPixelRatio();
		window.devicePixelRatio = 3;
		process.stdout.write(JSON.stringify([initialPixelRatio, getStudioPixelRatio()]));
		`,
	]);

	expect(result.exitCode).toBe(0);
	expect(JSON.parse(result.stdout.toString())).toEqual([2, 3]);
});
