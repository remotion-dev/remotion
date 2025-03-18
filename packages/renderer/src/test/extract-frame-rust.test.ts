import {exampleVideos} from '@remotion/example-videos';
import {expect, test} from 'bun:test';
import {interpolate} from 'remotion';
import {startLongRunningCompositor} from '../compositor/compositor';

const BMP_HEADER_SIZE = 54;

test(
	'Should be able to extract a frame using Rust',
	async () => {
		const compositor = startLongRunningCompositor({
			maximumFrameCacheItemsInBytes: null,
			logLevel: 'info',
			indent: false,
			binariesDirectory: null,
			extraThreads: 2,
		});

		const data = await compositor.executeCommand('ExtractFrame', {
			src: exampleVideos.bigBuckBunny,
			original_src: exampleVideos.bigBuckBunny,
			time: 40,
			transparent: false,
			tone_mapped: true,
		});
		expect(data.length).toBe(1280 * 720 * 3 + BMP_HEADER_SIZE);

		const data2 = await compositor.executeCommand('ExtractFrame', {
			src: exampleVideos.bigBuckBunny,
			original_src: exampleVideos.bigBuckBunny,
			time: 40.4,
			transparent: false,
			tone_mapped: true,
		});
		expect(data2.length).toBe(1280 * 720 * 3 + BMP_HEADER_SIZE);

		await compositor.finishCommands();
		await compositor.waitForDone();

		expect(data.subarray(0, 1000)).not.toEqual(data2.subarray(0, 1000));
	},
	{timeout: 10000},
);

test(
	'Should be able to get a PNG',
	async () => {
		const compositor = startLongRunningCompositor({
			maximumFrameCacheItemsInBytes: null,
			logLevel: 'info',
			indent: false,
			binariesDirectory: null,
			extraThreads: 2,
		});

		const data = await compositor.executeCommand('ExtractFrame', {
			src: exampleVideos.transparentWebm,
			original_src: exampleVideos.transparentWebm,
			time: 1,
			transparent: true,
			tone_mapped: true,
		});

		// Platform specific PNG encoder settings

		if (data.length === 169002) {
			expect(data[100000] / 100).toBeCloseTo(0.01, 0.01);
			expect(data[100001] / 100).toBeCloseTo(1.28, 0.01);
			expect(data[140001] / 100).toBeCloseTo(1.85, 0.01);
		} else if (data.length === 170905) {
			expect(data.length).toBe(170905);
		} else if (data.length === 164353) {
			expect(data.length).toBe(164353);
		} else {
			expect(data.length).toBe(173198);
		}

		await compositor.finishCommands();
		await compositor.waitForDone();
	},
	{timeout: 10000},
);

test('Should be able to start two compositors', async () => {
	const compositor = startLongRunningCompositor({
		maximumFrameCacheItemsInBytes: null,
		logLevel: 'info',
		indent: false,
		binariesDirectory: null,
		extraThreads: 2,
	});

	const compositor2 = startLongRunningCompositor({
		maximumFrameCacheItemsInBytes: null,
		logLevel: 'info',
		indent: false,
		binariesDirectory: null,
		extraThreads: 2,
	});

	await compositor.executeCommand('ExtractFrame', {
		src: exampleVideos.bigBuckBunny,
		original_src: exampleVideos.bigBuckBunny,
		time: 40,
		transparent: false,
		tone_mapped: true,
	});
	await compositor2.executeCommand('ExtractFrame', {
		src: exampleVideos.bigBuckBunny,
		original_src: exampleVideos.bigBuckBunny,
		time: 40,
		transparent: false,
		tone_mapped: true,
	});
});

test('Should be able to seek backwards', async () => {
	const compositor = startLongRunningCompositor({
		maximumFrameCacheItemsInBytes: null,
		logLevel: 'info',
		indent: false,
		binariesDirectory: null,
		extraThreads: 2,
	});

	const data = await compositor.executeCommand('ExtractFrame', {
		src: exampleVideos.bigBuckBunny,
		original_src: exampleVideos.bigBuckBunny,
		time: 40,
		transparent: false,
		tone_mapped: true,
	});
	expect(data.length).toBe(2764854);
	const data2 = await compositor.executeCommand('ExtractFrame', {
		src: exampleVideos.bigBuckBunny,
		original_src: exampleVideos.bigBuckBunny,
		time: 35,
		transparent: false,
		tone_mapped: true,
	});
	expect(data2.length).toBe(2764854);

	await compositor.finishCommands();
	await compositor.waitForDone();
});

test(
	'Should be able to extract a frame that has no file extension',
	async () => {
		const compositor = startLongRunningCompositor({
			maximumFrameCacheItemsInBytes: null,
			logLevel: 'info',
			indent: false,
			binariesDirectory: null,
			extraThreads: 2,
		});

		const data = await compositor.executeCommand('ExtractFrame', {
			src: exampleVideos.framerWithoutFileExtension,
			original_src: exampleVideos.framerWithoutFileExtension,
			time: 0.04,
			transparent: false,
			tone_mapped: true,
		});
		expect(data.length).toBe(3499254);

		await compositor.finishCommands();
		await compositor.waitForDone();
	},
	{timeout: 10000},
);

test(
	'Should get the last frame if out of range',
	async () => {
		const compositor = startLongRunningCompositor({
			maximumFrameCacheItemsInBytes: null,
			logLevel: 'info',
			indent: false,
			binariesDirectory: null,
			extraThreads: 2,
		});

		const data = await compositor.executeCommand('ExtractFrame', {
			src: exampleVideos.framerWithoutFileExtension,
			original_src: exampleVideos.framerWithoutFileExtension,
			time: 3.33,
			transparent: false,
			tone_mapped: true,
		});

		const expectedLength = BMP_HEADER_SIZE + 1080 * 1080 * 3;
		expect(data.length).toBe(expectedLength);
		const topLeftPixelR = data[expectedLength - 1];
		const topLeftPixelG = data[expectedLength - 2];
		const topLeftPixelB = data[expectedLength - 3];

		expect(topLeftPixelR / 100).toBeCloseTo(0.48, 0.01);
		expect(topLeftPixelG / 100).toBeCloseTo(1.13, 0.01);
		expect(topLeftPixelB / 100).toBeCloseTo(1.96, 0.01);

		await compositor.finishCommands();
		await compositor.waitForDone();
	},
	{timeout: 10000},
);

test(
	'Should get the last frame of a corrupted video',
	async () => {
		const compositor = startLongRunningCompositor({
			maximumFrameCacheItemsInBytes: null,
			logLevel: 'info',
			indent: false,
			binariesDirectory: null,
			extraThreads: 2,
		});

		const data = await compositor.executeCommand('ExtractFrame', {
			src: exampleVideos.corrupted,
			original_src: exampleVideos.corrupted,
			time: 100,
			transparent: false,
			tone_mapped: true,
		});

		// Pixel fixing
		expect(data.length).toBe(6220854);
		expect(data[1045650] / 100).toBeCloseTo(0.18, 0.01);
		expect(data[1645650] / 100).toBeCloseTo(0.41, 0.01);
		expect(data[2000000] / 100).toBeCloseTo(0.2, 0.01);

		await compositor.finishCommands();
		await compositor.waitForDone();
	},
	{timeout: 20000},
);

test(
	'Should get a frame of a transparent video with a custom DAR',
	async () => {
		const compositor = startLongRunningCompositor({
			maximumFrameCacheItemsInBytes: null,
			logLevel: 'info',
			indent: false,
			binariesDirectory: null,
			extraThreads: 2,
		});

		const data = await compositor.executeCommand('ExtractFrame', {
			src: exampleVideos.transparentwithdar,
			original_src: exampleVideos.transparentwithdar,
			time: 0.5,
			transparent: false,
			tone_mapped: true,
		});

		const header = data.subarray(0, BMP_HEADER_SIZE);

		expect(Buffer.from([...header.subarray(18, 22)]).readInt32LE(0)).toBe(683);
		expect(Buffer.from([...header.subarray(22, 26)]).readInt32LE(0)).toBe(512);

		// Expected length fixing
		expect(data.length).toBe(1050678);

		const transparentdata = await compositor.executeCommand('ExtractFrame', {
			src: exampleVideos.transparentwithdar,
			original_src: exampleVideos.transparentwithdar,
			time: 0.5,
			transparent: true,
			tone_mapped: true,
		});

		// Expected length fixing
		expect(transparentdata.length).toBeGreaterThan(142000);
		expect(transparentdata.length).toBeLessThan(143000);

		await compositor.finishCommands();
		await compositor.waitForDone();
	},
	{timeout: 20000},
);

test('Should be able to extract a frame with abnormal DAR', async () => {
	const compositor = startLongRunningCompositor({
		maximumFrameCacheItemsInBytes: null,
		logLevel: 'info',
		indent: false,
		binariesDirectory: null,
		extraThreads: 2,
	});

	const data = await compositor.executeCommand('ExtractFrame', {
		src: exampleVideos.customDar,
		original_src: exampleVideos.customDar,
		time: 3.33,
		transparent: false,
		tone_mapped: true,
	});

	const header = data.subarray(0, BMP_HEADER_SIZE);

	expect(Buffer.from([...header.subarray(18, 22)]).readInt32LE(0)).toBe(1280);
	expect(Buffer.from([...header.subarray(22, 26)]).readInt32LE(0)).toBe(2276);

	expect(data[0x00169915] / 100).toBeCloseTo(2.5, 1);
	expect(data[0x0012dd58] / 100).toBeCloseTo(2.5, 1);
	expect(data[0x00019108] / 100).toBeCloseTo(2.5, 1);

	await compositor.finishCommands();
	await compositor.waitForDone();
});

test('Should be able to extract the frames in reverse order', async () => {
	const compositor = startLongRunningCompositor({
		maximumFrameCacheItemsInBytes: null,
		logLevel: 'info',
		indent: false,
		binariesDirectory: null,
		extraThreads: 2,
	});

	let prevPixel = '';

	for (let i = 30; i > 0; i -= 2) {
		const data = await compositor.executeCommand('ExtractFrame', {
			src: exampleVideos.bigBuckBunny,
			original_src: exampleVideos.bigBuckBunny,
			time: i,
			transparent: false,
			tone_mapped: true,
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
	const compositor = startLongRunningCompositor({
		maximumFrameCacheItemsInBytes: null,
		logLevel: 'info',
		indent: false,
		binariesDirectory: null,
		extraThreads: 2,
	});

	const time = Date.now();

	const data = await compositor.executeCommand('ExtractFrame', {
		src: exampleVideos.transparentWebm,
		original_src: exampleVideos.transparentWebm,
		time: 5.0,
		transparent: false,
		tone_mapped: true,
	});

	const time_end = Date.now();
	expect(data.length).toBe(6220854);

	const time2 = Date.now();
	const data2 = await compositor.executeCommand('ExtractFrame', {
		src: exampleVideos.transparentWebm,
		original_src: exampleVideos.transparentWebm,
		time: 5.0,
		transparent: false,
		tone_mapped: true,
	});

	// Time should be way less now
	const time2_end = Date.now();
	expect(time2_end - time2).toBeLessThan(time_end - time);
	expect(data2.length).toBe(6220854);

	const time3 = Date.now();
	const data3 = await compositor.executeCommand('ExtractFrame', {
		src: exampleVideos.transparentWebm,
		original_src: exampleVideos.transparentWebm,
		time: 100,
		transparent: false,
		tone_mapped: true,
	});

	// Time should be way less now
	const time3_end = Date.now();
	expect(time3_end - time3).toBeLessThan(time_end - time);
	expect(data3.length).toBe(6220854);

	// Transparent frame should be different, so it should take a lot more time
	// Improve me: This file is corrupt and cannot seek to the last frame.. get a better example
	const time4 = Date.now();
	const data4 = await compositor.executeCommand('ExtractFrame', {
		src: exampleVideos.transparentWebm,
		original_src: exampleVideos.transparentWebm,
		time: 1,
		transparent: true,
		tone_mapped: true,
	});

	const time4_end = Date.now();
	expect(time4_end - time4).toBeGreaterThan((time3_end - time3) * 2);
	expect(data4.length).not.toBe(6220854);

	await compositor.finishCommands();
	await compositor.waitForDone();
});

test('Should get from a screen recording', async () => {
	const compositor = startLongRunningCompositor({
		maximumFrameCacheItemsInBytes: null,
		logLevel: 'info',
		indent: false,
		binariesDirectory: null,
		extraThreads: 2,
	});

	const data = await compositor.executeCommand('ExtractFrame', {
		src: exampleVideos.screenrecording,
		original_src: exampleVideos.screenrecording,
		time: 0.5,
		transparent: false,
		tone_mapped: true,
	});

	expect(data.length).toBe(15230038);

	await compositor.finishCommands();
	await compositor.waitForDone();
});

test('Should get from video with no fps', async () => {
	const compositor = startLongRunningCompositor({
		maximumFrameCacheItemsInBytes: null,
		logLevel: 'info',
		indent: false,
		binariesDirectory: null,
		extraThreads: 2,
	});

	const data = await compositor.executeCommand('ExtractFrame', {
		src: exampleVideos.nofps,
		original_src: exampleVideos.nofps,
		time: 0.5,
		transparent: false,
		tone_mapped: true,
	});

	expect(data.length).toBe(3044334);

	await compositor.finishCommands();
	await compositor.waitForDone();
});

test('Should get from broken webcam video', async () => {
	const compositor = startLongRunningCompositor({
		maximumFrameCacheItemsInBytes: null,
		logLevel: 'info',
		indent: false,
		binariesDirectory: null,
		extraThreads: 2,
	});

	const data = await compositor.executeCommand('ExtractFrame', {
		src: exampleVideos.webcam,
		original_src: exampleVideos.webcam,
		time: 0,
		transparent: false,
		tone_mapped: true,
	});

	expect(data.length).toBe(921654);

	await compositor.finishCommands();
	await compositor.waitForDone();
});

test(
	'Should get from iPhone video',
	async () => {
		const compositor = startLongRunningCompositor({
			maximumFrameCacheItemsInBytes: null,
			logLevel: 'info',
			indent: false,
			binariesDirectory: null,
			extraThreads: 2,
		});

		const data = await compositor.executeCommand('ExtractFrame', {
			src: exampleVideos.iphonevideo,
			original_src: exampleVideos.iphonevideo,
			time: 1,
			transparent: false,
			tone_mapped: true,
		});

		expect(data.length).toBe(24883254);

		await compositor.finishCommands();
		await compositor.waitForDone();
	},
	{
		timeout: 30000,
	},
);

test('Should get from AV1 video', async () => {
	const compositor = startLongRunningCompositor({
		maximumFrameCacheItemsInBytes: null,
		logLevel: 'info',
		indent: false,
		binariesDirectory: null,
		extraThreads: 2,
	});

	const data = await compositor.executeCommand('ExtractFrame', {
		src: exampleVideos.av1,
		original_src: exampleVideos.av1,
		time: 0.5,
		transparent: false,
		tone_mapped: true,
	});

	expect(data.length).toBe(6220854);

	await compositor.finishCommands();
	await compositor.waitForDone();
});

test('Should handle getting a frame from a WebM when it is not transparent', async () => {
	const compositor = startLongRunningCompositor({
		maximumFrameCacheItemsInBytes: null,
		logLevel: 'info',
		indent: false,
		binariesDirectory: null,
		extraThreads: 2,
	});

	const data = await compositor.executeCommand('ExtractFrame', {
		src: exampleVideos.variablefps,
		original_src: exampleVideos.variablefps,
		time: 0,
		transparent: true,
		tone_mapped: true,
	});

	// Should resort back to BMP because it is faster
	const header = new TextDecoder('utf-8').decode(data.slice(0, 8));
	expect(header).toContain('BM60');

	expect(data.length).toBe(2764854);

	await compositor.finishCommands();
	await compositor.waitForDone();
});

test('Should handle a video with no frames at the beginning', async () => {
	const compositor = startLongRunningCompositor({
		maximumFrameCacheItemsInBytes: null,
		logLevel: 'info',
		indent: false,
		binariesDirectory: null,
		extraThreads: 2,
	});

	const data = await compositor.executeCommand('ExtractFrame', {
		src: exampleVideos.zerotimestamp,
		original_src: exampleVideos.zerotimestamp,
		time: 1.5,
		transparent: false,
		tone_mapped: true,
	});

	// Should resort back to BMP because it is faster
	const header = new TextDecoder('utf-8').decode(data.slice(0, 8));
	expect(header).toContain('BM6');

	expect(data.length).toBe(6220854);

	await compositor.finishCommands();
	await compositor.waitForDone();
});

test(
	'Two different starting times should not result in big seeking',
	async () => {
		const compositor = startLongRunningCompositor({
			maximumFrameCacheItemsInBytes: 500 * 1024 * 1024,
			logLevel: 'info',
			indent: false,
			binariesDirectory: null,
			extraThreads: 2,
		});

		const expected = [];

		for (let i = 0; i < 10; i++) {
			const time = i + (i % 2 === 0 ? 60 : 0);
			const data = await compositor.executeCommand('ExtractFrame', {
				src: exampleVideos.bigBuckBunny,
				original_src: exampleVideos.bigBuckBunny,
				time,
				transparent: false,
				tone_mapped: true,
			});

			const expectedLength = BMP_HEADER_SIZE + 1280 * 720 * 3;
			const centerLeftPixelR =
				data[Math.round(expectedLength - expectedLength / 2 - 1)];
			const centerLeftPixelG =
				data[Math.round(expectedLength - expectedLength / 2 - 2)];
			const centerLeftPixelB =
				data[Math.round(expectedLength - expectedLength / 2 - 3)];

			expected.push([centerLeftPixelR, centerLeftPixelG, centerLeftPixelB]);
		}

		expect(expected[0][0] / 100).toBeCloseTo(1.52, 1);
		expect(expected[0][1] / 100).toBeCloseTo(1.86, 1);
		expect(expected[0][2] / 100).toBeCloseTo(2.24, 1);

		expect(expected[1][0] / 100).toBeCloseTo(0.69, 1);
		expect(expected[1][1] / 100).toBeCloseTo(0.7, 1);
		expect(expected[1][2] / 100).toBeCloseTo(0.68, 1);

		expect(expected[2][0] / 100).toBeCloseTo(1.52, 1);
		expect(expected[2][1] / 100).toBeCloseTo(1.86, 1);
		expect(expected[2][2] / 100).toBeCloseTo(2.24, 1);

		expect(expected[3][0] / 100).toBeCloseTo(2.52, 1);
		expect(expected[3][1] / 100).toBeCloseTo(2.51, 1);
		expect(expected[3][2] / 100).toBeCloseTo(2.45, 1);

		expect(expected[4][0] / 100).toBeCloseTo(1.5, 1);
		expect(expected[4][1] / 100).toBeCloseTo(1.86, 1);
		expect(expected[4][2] / 100).toBeCloseTo(2.24, 1);

		expect(expected[5][0] / 100).toBeCloseTo(1.32, 1);
		expect(expected[5][2] / 100).toBeCloseTo(1.2, 1);

		expect(expected[6][0] / 100).toBeCloseTo(1.52, 1);
		expect(expected[6][1] / 100).toBeCloseTo(1.86, 1);
		expect(expected[6][2] / 100).toBeCloseTo(2.24, 1);

		expect(expected[7][0] / 100).toBeCloseTo(1.38, 1);
		expect(expected[7][1] / 100).toBeCloseTo(1.41, 1);
		expect(expected[7][2] / 100).toBeCloseTo(1.07, 1);

		expect(expected[8][0] / 100).toBeCloseTo(1.52, 1);
		expect(expected[8][1] / 100).toBeCloseTo(1.86, 1);
		expect(expected[8][2] / 100).toBeCloseTo(2.24, 1);

		expect(expected[9][0] / 100).toBeCloseTo(1.27, 1);
		expect(expected[9][1] / 100).toBeCloseTo(1.47, 1);
		expect(expected[9][2] / 100).toBeCloseTo(1.07, 1);

		const stats = await compositor.executeCommand('GetOpenVideoStats', {});
		const statsJson = JSON.parse(new TextDecoder('utf-8').decode(stats));
		expect(statsJson.open_streams).toBe(2);

		await compositor.finishCommands();
		await compositor.waitForDone();
	},
	{timeout: 30000},
);

const getExpectedMediaFrameUncorrected = ({
	frame,
	playbackRate,
	startFrom,
}: {
	frame: number;
	playbackRate: number;
	startFrom: number;
}) => {
	return interpolate(
		frame,
		[-1, startFrom, startFrom + 1],
		[-1, startFrom, startFrom + playbackRate],
	);
};

test(
	'Should not duplicate frames for iphoneVideo',
	async () => {
		const frame30 =
			getExpectedMediaFrameUncorrected({
				frame: 30,
				playbackRate: 1,
				startFrom: 0,
			}) / 30;
		const frame31 =
			getExpectedMediaFrameUncorrected({
				frame: 31,
				playbackRate: 1,
				startFrom: 0,
			}) / 30;

		const compositor = startLongRunningCompositor({
			maximumFrameCacheItemsInBytes: 500_000_000,
			logLevel: 'info',
			indent: false,
			binariesDirectory: null,
			extraThreads: 2,
		});

		const firstFrame = await compositor.executeCommand('ExtractFrame', {
			src: exampleVideos.iphonevideo,
			original_src: exampleVideos.iphonevideo,
			time: frame30,
			transparent: false,
			tone_mapped: true,
		});

		const secondFrame = await compositor.executeCommand('ExtractFrame', {
			src: exampleVideos.iphonevideo,
			original_src: exampleVideos.iphonevideo,
			time: frame31,
			transparent: false,
			tone_mapped: true,
		});

		const hundredRandomPixels = new Array(100).fill(true).map(() => {
			return Math.round(Math.random() * firstFrame.length);
		});

		let isSame = true;
		for (const pixel of hundredRandomPixels) {
			if (firstFrame[pixel] !== secondFrame[pixel]) {
				isSame = false;
				break;
			}
		}

		expect(isSame).toBe(false);
	},
	{
		timeout: 30000,
	},
);
