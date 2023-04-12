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

		console.time('first frame');
		const data = await compositor.executeCommand('ExtractFrame', {
			input: '/Users/jonathanburger/Downloads/fullmovie.mp4',
			time: 40,
		});
		expect(data.length).toBe(2764854);
		console.timeEnd('first frame');
		fs.writeFileSync('test.png', data);

		console.time('second frame');
		const data2 = await compositor.executeCommand('ExtractFrame', {
			input: '/Users/jonathanburger/Downloads/fullmovie.mp4',
			time: 50,
		});
		expect(data2.length).toBe(2764854);
		console.timeEnd('second frame');

		fs.writeFileSync('test2.png', data2);

		// TODO: When not calling finishCommands, the compositor hangs with 400%
		compositor.finishCommands();
		await compositor.waitForDone();
	},
	{timeout: 10000}
);
