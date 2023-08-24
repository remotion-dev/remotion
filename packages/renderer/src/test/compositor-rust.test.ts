import {expect, test} from 'vitest';
import {
	getIdealMaximumFrameCacheSizeInBytes,
	startLongRunningCompositor,
} from '../compositor/compositor';

test(
	'Compositor should process messages in the right order',
	async () => {
		const compositor = startLongRunningCompositor(
			getIdealMaximumFrameCacheSizeInBytes(),
			'verbose',
			false,
		);

		const matching = await Promise.all(
			new Array(100).fill(true).map(async (_, i) => {
				await new Promise<void>((resolve) => {
					setTimeout(() => resolve(), Math.random() * 100);
				});
				const expectedString = 'mystring-abc-' + String(i);
				const output = await compositor.executeCommand('Echo', {
					message: expectedString,
				});
				const isSame = output.toString('utf8') === 'Echo ' + expectedString;
				return isSame;
			}),
		);

		compositor.finishCommands();
		await compositor.waitForDone();
		expect(matching.every((m) => m)).toBe(true);
	},
	{timeout: 5000},
);
