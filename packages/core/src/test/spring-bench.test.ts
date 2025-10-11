import {expect, test} from 'bun:test';
import {spring} from '../spring';

test('Springs should calculate fast and cache the natural duration', async () => {
	const date = performance.now();
	for (let i = 0; i < 100000; i++) {
		spring({
			frame: 8000,
			fps: 60,
			delay: 12000,
			durationInFrames: Math.round(Math.random() * 100) + 1,
		});
		spring({
			frame: 8000,
			fps: 60,
			durationInFrames: Math.round(Math.random() * 100) + 1,
		});
		spring({
			frame: 8000,
			fps: 60,
			reverse: true,
			durationInFrames: Math.round(Math.random() * 100) + 1,
		});
	}

	const time = await new Promise((resolve) => {
		setTimeout(() => {
			resolve(performance.now() - date);
		});
	});
	expect(time).toBeLessThan(
		process.platform === 'darwin' || process.platform === 'win32' ? 1500 : 800,
	);
});
