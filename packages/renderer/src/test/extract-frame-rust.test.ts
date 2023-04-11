import {expect, test} from 'vitest';
import {startCompositor} from '../compositor/compositor';
import {makeNonce} from '../compositor/make-nonce';

test(
	'Should be able to extract a frame using Rust',
	async () => {
		const compositor = startCompositor({
			type: 'StartLongRunningProcess',
			params: {
				nonce: makeNonce(),
			},
		});

		const data = compositor.executeCommand('ExtractFrame', {
			input:
				'/Users/jonathanburger/remotion/packages/example/public/framer.webm',
			time: 2.5,
		});
		// TODO: When not calling finishCommands, the compositor hangs with 400%
		compositor.finishCommands();
		await compositor.waitForDone();
		expect((await data).length).toBe(3499254);
	},
	{timeout: 10000}
);
