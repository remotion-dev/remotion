import {expect, test} from 'bun:test';
import {startLongRunningCompositor} from '../compositor/compositor';

test(
	'Compositor should process messages in the right order',
	async () => {
		const compositor = startLongRunningCompositor({
			maximumFrameCacheItemsInBytes: null,
			logLevel: 'info',
			indent: false,
			binariesDirectory: null,
			extraThreads: 2,
		});

		const matching = await Promise.all(
			new Array(100).fill(true).map(async (_, i) => {
				await new Promise<void>((resolve) => {
					setTimeout(() => resolve(), Math.random() * 100);
				});
				const expectedString = 'mystring-abc-' + String(i);
				const output = await compositor.executeCommand('Echo', {
					message: expectedString,
				});
				const isSame =
					new TextDecoder('utf-8').decode(output) === 'Echo ' + expectedString;
				return isSame;
			}),
		);

		await compositor.finishCommands();
		await compositor.waitForDone();
		expect(matching.every((m) => m)).toBe(true);
	},
	{timeout: 5000, retry: 2},
);
