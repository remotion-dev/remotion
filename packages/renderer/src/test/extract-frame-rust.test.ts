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
			transparent: false,
		});
		expect(data.length).toBe(1280 * 720 * 3 + BMP_HEADER_SIZE);

		const data2 = await compositor.executeCommand('ExtractFrame', {
			input: '/Users/jonathanburger/Downloads/fullmovie.mp4',
			time: 40.4,
			transparent: false,
		});
		expect(data2.length).toBe(1280 * 720 * 3 + BMP_HEADER_SIZE);

		compositor.finishCommands();
		await compositor.waitForDone();

		expect(data.slice(0, 1000)).not.toEqual(data2.slice(0, 1000));
	},
	{timeout: 10000}
);

test('Should be able to start two compositors', async () => {
	const compositor = startCompositor('StartLongRunningProcess', {});

	const compositor2 = startCompositor('StartLongRunningProcess', {});

	await compositor.executeCommand('ExtractFrame', {
		input: '/Users/jonathanburger/Downloads/fullmovie.mp4',
		time: 40,
		transparent: false,
	});
	await compositor2.executeCommand('ExtractFrame', {
		input: '/Users/jonathanburger/Downloads/fullmovie.mp4',
		time: 40,
		transparent: false,
	});
});

test('Should be able to seek backwards', async () => {
	const compositor = startCompositor('StartLongRunningProcess', {});

	const data = await compositor.executeCommand('ExtractFrame', {
		input: '/Users/jonathanburger/Downloads/fullmovie.mp4',
		time: 40,
		transparent: false,
	});
	expect(data.length).toBe(2764854);
	const data2 = await compositor.executeCommand('ExtractFrame', {
		input: '/Users/jonathanburger/Downloads/fullmovie.mp4',
		time: 35,
		transparent: false,
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
			transparent: false,
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
			transparent: false,
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
			transparent: false,
		});

		// Pixel fixing
		expect(data.length).toBe(6220854);
		expect(data[1045650]).toBe(18);
		expect(data[1645650]).toBe(41);
		expect(data[2000000]).toBe(20);

		compositor.finishCommands();
		await compositor.waitForDone();
	},
	{timeout: 5000}
);

test.only('Should be able to extract a frame with abnormal DAR', async () => {
	const compositor = startCompositor('StartLongRunningProcess', {});

	const input = path.join(
		__dirname,
		'..',
		'..',
		'..',
		'example',
		'public',
		'custom-dar.mp4'
	);

	const data = await compositor.executeCommand('ExtractFrame', {
		input,
		time: 3.33,
		transparent: false,
	});

	const header = data.slice(0, BMP_HEADER_SIZE);

	const width = header.readInt32LE(18);
	const height = header.readInt32LE(22);

	expect(height).toBe(1280);
	expect(width).toBe(720);

	compositor.finishCommands();
	await compositor.waitForDone();
});

test('Last frame should be fast', async () => {
	const compositor = startCompositor('StartLongRunningProcess', {});

	const time = Date.now();

	const input = path.join(
		__dirname,
		'..',
		'..',
		'..',
		'example',
		'public',
		'framermp4withoutfileextension'
	);

	const data = await compositor.executeCommand('ExtractFrame', {
		input,
		time: 3.33,
		transparent: false,
	});

	const time_end = Date.now();
	expect(data.length).toBe(3499254);

	const time2 = Date.now();
	const data2 = await compositor.executeCommand('ExtractFrame', {
		input,
		time: 3.33,
		transparent: false,
	});

	// Time should be way less now
	const time2_end = Date.now();
	expect(time2_end - time2).toBeLessThan(time_end - time);
	expect(data2.length).toBe(3499254);

	const time3 = Date.now();
	const data3 = await compositor.executeCommand('ExtractFrame', {
		input,
		time: 100,
		transparent: false,
	});

	// Time should be way less now
	const time3_end = Date.now();
	expect(time3_end - time3).toBeLessThan(time_end - time);
	expect(data3.length).toBe(3499254);

	compositor.finishCommands();
	await compositor.waitForDone();
});
