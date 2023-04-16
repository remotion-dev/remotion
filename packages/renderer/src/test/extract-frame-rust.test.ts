import fs from 'fs';
import path from 'path';
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
			time: 40.4,
		});
		expect(data2.length).toBe(2764854);

		fs.writeFileSync('test2.png', data2);

		compositor.finishCommands();
		await compositor.waitForDone();
	},
	{timeout: 10000}
);

test('Should be able to start two compositors', async () => {
	const compositor = startCompositor({
		type: 'StartLongRunningProcess',
		params: {
			nonce: makeNonce(),
		},
	});

	const compositor2 = startCompositor({
		type: 'StartLongRunningProcess',
		params: {
			nonce: makeNonce(),
		},
	});

	await compositor.executeCommand('ExtractFrame', {
		input: '/Users/jonathanburger/Downloads/fullmovie.mp4',
		time: 40,
	});
	await compositor2.executeCommand('ExtractFrame', {
		input: '/Users/jonathanburger/Downloads/fullmovie.mp4',
		time: 40,
	});
});

test('Should be able to seek backwards', async () => {
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
		time: 35,
	});
	expect(data2.length).toBe(2764854);

	fs.writeFileSync('test2.png', data2);

	compositor.finishCommands();
	await compositor.waitForDone();
});

test(
	'Should be able to extract a frame that has no file extension',
	async () => {
		const compositor = startCompositor({
			type: 'StartLongRunningProcess',
			params: {
				nonce: makeNonce(),
			},
		});

		const data = await compositor.executeCommand('ExtractFrame', {
			input: path.join(
				__dirname,
				'..',
				'..',
				'..',
				'example',
				'public',
				'framermp4withoutfileextension'
			),
			time: 1,
		});
		expect(data.length).toBe(3499254);
		fs.writeFileSync('nofileext.bmp', data);

		compositor.finishCommands();
		await compositor.waitForDone();
	},
	{timeout: 10000}
);

test(
	'Should get the last frame if out of range',
	async () => {
		const compositor = startCompositor({
			type: 'StartLongRunningProcess',
			params: {
				nonce: makeNonce(),
			},
		});

		// TODO: Should not return 97
		const data = await compositor.executeCommand('ExtractFrame', {
			input: path.join(
				__dirname,
				'..',
				'..',
				'..',
				'example',
				'public',
				'framermp4withoutfileextension'
			),
			time: 3.33,
		});
		expect(data.length).toBe(3499254);
		fs.writeFileSync('lastframe.bmp', data);

		compositor.finishCommands();
		await compositor.waitForDone();
	},
	{timeout: 10000}
);

test.skip(
	'Should get the last frame of a corrupted video',
	async () => {
		const compositor = startCompositor({
			type: 'StartLongRunningProcess',
			params: {
				nonce: makeNonce(),
			},
		});

		const data = await compositor.executeCommand('ExtractFrame', {
			input: path.join(
				__dirname,
				'..',
				'..',
				'..',
				'example',
				'public',
				'corrupted.mp4'
			),
			time: 100,
		});
		expect(data.length).toBe(3499254);
		fs.writeFileSync('corrupted.bmp', data);

		compositor.finishCommands();
		await compositor.waitForDone();
	},
	{timeout: 5000}
);
