import path from 'path';
import {expect, test} from 'vitest';
import {startCompositor} from '../compositor/compositor';

const BMP_HEADER_SIZE = 54;

test(
	'Should be able to extract a frame using Rust',
	async () => {
		const compositor = startCompositor('StartLongRunningProcess', {});

		const data = await compositor.executeCommand('ExtractFrame', {
			input: '/Users/jonathanburger/Downloads/fullmovie.mp4',
			time: 40,
		});
		expect(data.length).toBe(1280 * 720 * 3 + BMP_HEADER_SIZE);

		const data2 = await compositor.executeCommand('ExtractFrame', {
			input: '/Users/jonathanburger/Downloads/fullmovie.mp4',
			time: 40.4,
		});
		expect(data2.length).toBe(1280 * 720 * 3 + BMP_HEADER_SIZE);

		compositor.finishCommands();
		await compositor.waitForDone();

		expect(data).not.toEqual(data2);
	},
	{timeout: 10000}
);

test('Should be able to start two compositors', async () => {
	const compositor = startCompositor('StartLongRunningProcess', {});

	const compositor2 = startCompositor('StartLongRunningProcess', {});

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
	const compositor = startCompositor('StartLongRunningProcess', {});

	const data = await compositor.executeCommand('ExtractFrame', {
		input: '/Users/jonathanburger/Downloads/fullmovie.mp4',
		time: 40,
	});
	expect(data.length).toBe(2764854);
	const data2 = await compositor.executeCommand('ExtractFrame', {
		input: '/Users/jonathanburger/Downloads/fullmovie.mp4',
		time: 35,
	});
	expect(data2.length).toBe(2764854);

	compositor.finishCommands();
	await compositor.waitForDone();
});

test(
	'Should be able to extract a frame that has no file extension',
	async () => {
		const compositor = startCompositor('StartLongRunningProcess', {});

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

		compositor.finishCommands();
		await compositor.waitForDone();
	},
	{timeout: 10000}
);

test(
	'Should get the last frame if out of range',
	async () => {
		const compositor = startCompositor('StartLongRunningProcess', {});

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
		const expectedLength = BMP_HEADER_SIZE + 1080 * 1080 * 3;
		expect(data.length).toBe(expectedLength);
		const topLeftPixelR = data[expectedLength - 1];
		const topLeftPixelG = data[expectedLength - 2];
		const topLeftPixelB = data[expectedLength - 3];
		expect(topLeftPixelR).toBe(48);
		expect(topLeftPixelG).toBe(113);
		expect(topLeftPixelB).toBe(196);

		compositor.finishCommands();
		await compositor.waitForDone();
	},
	{timeout: 10000}
);

test(
	'Should get the last frame of a corrupted video',
	async () => {
		const compositor = startCompositor('StartLongRunningProcess', {});

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

		compositor.finishCommands();
		await compositor.waitForDone();
	},
	{timeout: 5000}
);
