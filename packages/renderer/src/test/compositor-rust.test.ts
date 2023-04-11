import {expect, test} from 'vitest';
import {startCompositor} from '../compositor/compositor';
import {makeNonce} from '../compositor/make-nonce';

test(
	'Compositor should process messages in the right order',
	async () => {
		const compositor = startCompositor({
			type: 'StartLongRunningProcess',
			params: {
				nonce: makeNonce(),
			},
		});

		const matching = await Promise.all(
			new Array(100).fill(true).map(async (_, i) => {
				await new Promise<void>((resolve) => {
					setTimeout(() => resolve(), Math.random() * 100);
				});
				const nonce = makeNonce();
				const expectedString = 'mystring-abc-' + String(i);
				const output = await compositor.executeCommand({
					type: 'Echo',
					params: {message: expectedString, nonce},
				});
				const isSame = output.toString('utf8') === 'Echo ' + expectedString;
				return isSame;
			})
		);

		compositor.finishCommands();
		await compositor.waitForDone();
		expect(matching.every((m) => m)).toBe(true);
	},
	{timeout: 5000}
);
