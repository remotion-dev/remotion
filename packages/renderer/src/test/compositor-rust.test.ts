import {test} from 'vitest';
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

		for (let i = 0; i < 10; i++) {
			const nonce = makeNonce();
			compositor.executeCommand({
				type: 'Echo',
				params: {message: 'mystring-abc-' + String(i), nonce},
			});
			await new Promise<void>((resolve) => {
				setTimeout(() => resolve(), 10);
			});
		}

		compositor.finishCommands();
		await compositor.waitForDone();
	},
	{timeout: 5000}
);
