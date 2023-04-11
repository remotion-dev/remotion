import fs from 'fs';
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

		const data = await compositor.executeCommand('ExtractFrame', {
			input: '/Users/jonathanburger/Downloads/fullmovie.mp4',
			time: 40,
		});
		expect(data.length).toBe(2764854);
		fs.writeFileSync('test.png', data);

		const data2 = await compositor.executeCommand('ExtractFrame', {
			input: '/Users/jonathanburger/Downloads/fullmovie.mp4',
			time: 50,
		});
		expect(data2.length).toBe(2764854);
		fs.writeFileSync('test2.png', data2);

		// TODO: When not calling finishCommands, the compositor hangs with 400%
		compositor.finishCommands();
		await compositor.waitForDone();
	},
	{timeout: 10000}
);
