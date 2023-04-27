import path from 'path';
import {expect, test} from 'vitest';
import {startCompositor} from '../compositor/compositor';

const BMP_HEADER_SIZE = 54;

const examplePackage = path.join(__dirname, '..', '..', '..', 'example');
const docsPackage = path.join(__dirname, '..', '..', '..', 'docs');

const exampleVideos = {
	bigBuckBunny: path.join(examplePackage, 'public/bigbuckbunny.mp4'),
	transparentWebm: path.join(docsPackage, '/static/img/transparent-video.webm'),
	framerWithoutFileExtension: path.join(
		examplePackage,
		'public',
		'framermp4withoutfileextension'
	),
	corrupted: path.join(examplePackage, 'public', 'corrupted.mp4'),
	customDar: path.join(examplePackage, 'public', 'custom-dar.mp4'),
};

test(
	'Should be able to extract a frame using Rust',
	async () => {
		const compositor = startCompositor('StartLongRunningProcess', {});

		const data = await compositor.executeCommand('ExtractFrame', {
			input: exampleVideos.bigBuckBunny,
			time: 40,
			transparent: false,
		});
		expect(data.length).toBe(1280 * 720 * 3 + BMP_HEADER_SIZE);

		const data2 = await compositor.executeCommand('ExtractFrame', {
			input: exampleVideos.bigBuckBunny,
			time: 40.4,
			transparent: false,
		});
		expect(data2.length).toBe(1280 * 720 * 3 + BMP_HEADER_SIZE);

		compositor.finishCommands();
		await compositor.waitForDone();

		expect(data.subarray(0, 1000)).not.toEqual(data2.subarray(0, 1000));
	},
	{timeout: 10000}
);

test(
	'Should be able to get a PNG',
	async () => {
		const compositor = startCompositor('StartLongRunningProcess', {});

		const data = await compositor.executeCommand('ExtractFrame', {
			input: exampleVideos.transparentWebm,
			time: 1,
			transparent: true,
		});

		expect(data[100000]).toBe(13);
		expect(data[100001]).toBe(96);
		expect(data[140001]).toBe(253);
		expect(data[170001]).toBe(9);
		expect(data.length).toBe(191304);

		compositor.finishCommands();
		await compositor.waitForDone();
	},
	{timeout: 10000}
);

test('Should be able to start two compositors', async () => {
	const compositor = startCompositor('StartLongRunningProcess', {});

	const compositor2 = startCompositor('StartLongRunningProcess', {});

	await compositor.executeCommand('ExtractFrame', {
		input: exampleVideos.bigBuckBunny,
		time: 40,
		transparent: false,
	});
	await compositor2.executeCommand('ExtractFrame', {
		input: exampleVideos.bigBuckBunny,
		time: 40,
		transparent: false,
	});
});

test('Should be able to seek backwards', async () => {
	const compositor = startCompositor('StartLongRunningProcess', {});

	const data = await compositor.executeCommand('ExtractFrame', {
		input: exampleVideos.bigBuckBunny,
		time: 40,
		transparent: false,
	});
	expect(data.length).toBe(2764854);
	const data2 = await compositor.executeCommand('ExtractFrame', {
		input: exampleVideos.bigBuckBunny,
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
			input: exampleVideos.framerWithoutFileExtension,
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
			input: exampleVideos.framerWithoutFileExtension,
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
			input: exampleVideos.corrupted,
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

test('Should be able to extract a frame with abnormal DAR', async () => {
	const compositor = startCompositor('StartLongRunningProcess', {});

	const data = await compositor.executeCommand('ExtractFrame', {
		input: exampleVideos.customDar,
		time: 3.33,
		transparent: false,
	});

	const header = data.subarray(0, BMP_HEADER_SIZE);

	const width = header.readInt32LE(18);
	const height = header.readInt32LE(22);

	expect(height).toBe(1280);
	expect(width).toBe(720);

	compositor.finishCommands();
	await compositor.waitForDone();
});

test('Should be able to extract the frames in reverse order', async () => {
	const compositor = startCompositor('StartLongRunningProcess', {});

	let prevPixel = '';

	for (let i = 30; i > 0; i -= 2) {
		const data = await compositor.executeCommand('ExtractFrame', {
			input: exampleVideos.bigBuckBunny,
			time: i,
			transparent: false,
		});

		const expectedLength = BMP_HEADER_SIZE + 1280 * 720 * 3;
		expect(data.length).toBe(expectedLength);

		const topLeftPixelR = data[expectedLength - 1];
		const topLeftPixelG = data[expectedLength - 2];
		const topLeftPixelB = data[expectedLength - 3];

		const centerLeftPixelR =
			data[Math.round(expectedLength - expectedLength / 2 - 1)];
		const centerLeftPixelG =
			data[Math.round(expectedLength - expectedLength / 2 - 2)];
		const centerLeftPixelB =
			data[Math.round(expectedLength - expectedLength / 2 - 3)];

		const pixels = [
			topLeftPixelR,
			topLeftPixelG,
			topLeftPixelB,
			centerLeftPixelB,
			centerLeftPixelR,
			centerLeftPixelG,
		].join('-');
		expect(pixels).not.toBe(prevPixel);
		prevPixel = pixels;
	}
});

test('Last frame should be fast', async () => {
	const compositor = startCompositor('StartLongRunningProcess', {});

	const time = Date.now();

	const data = await compositor.executeCommand('ExtractFrame', {
		input: exampleVideos.framerWithoutFileExtension,
		time: 3.333,
		transparent: false,
	});

	const time_end = Date.now();
	expect(data.length).toBe(3499254);

	const time2 = Date.now();
	const data2 = await compositor.executeCommand('ExtractFrame', {
		input: exampleVideos.framerWithoutFileExtension,
		time: 3.333,
		transparent: false,
	});

	// Time should be way less now
	const time2_end = Date.now();
	expect(time2_end - time2).toBeLessThan(time_end - time);
	expect(data2.length).toBe(3499254);

	const time3 = Date.now();
	const data3 = await compositor.executeCommand('ExtractFrame', {
		input: exampleVideos.framerWithoutFileExtension,
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

test('Two different starting times should not result in big seeking', async () => {
	const compositor = startCompositor('StartLongRunningProcess', {});

	const expected = [];

	for (let i = 0; i < 10; i++) {
		const time = i + (i % 2 === 0 ? 60 : 0);
		const data = await compositor.executeCommand('ExtractFrame', {
			input: exampleVideos.bigBuckBunny,
			time,
			transparent: false,
		});

		const expectedLength = BMP_HEADER_SIZE + 1280 * 720 * 3;
		const centerLeftPixelR =
			data[Math.round(expectedLength - expectedLength / 2 - 1)];
		const centerLeftPixelG =
			data[Math.round(expectedLength - expectedLength / 2 - 2)];
		const centerLeftPixelB =
			data[Math.round(expectedLength - expectedLength / 2 - 3)];

		expected.push(
			[centerLeftPixelR, centerLeftPixelG, centerLeftPixelB].join('-')
		);
	}

	expect(expected).toEqual([
		'153-186-224',
		'60-60-60',
		'153-186-224',
		'252-251-245',
		'153-186-224',
		'140-154-130',
		'153-186-224',
		'150-166-129',
		'153-186-224',
		'112-133-86',
	]);

	const stats = await compositor.executeCommand('GetOpenVideoStats', {});
	expect(JSON.parse(stats.toString('utf-8'))).toEqual({
		open_streams: 2,
		open_videos: 1,
	});

	compositor.finishCommands();
	await compositor.waitForDone();
});

test.todo('transparent cache should be separate from non-transparent cache');
