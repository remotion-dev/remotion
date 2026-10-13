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
		console.log(getStudioPixelRatio());
		window.devicePixelRatio = 3;
		console.log(getStudioPixelRatio());
		`,
	]);

	expect(result.exitCode).toBe(0);
	expect(result.stdout.toString().trim()).toBe('2\n3');
});
