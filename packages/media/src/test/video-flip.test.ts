import {ALL_FORMATS, Input, UrlSource, VideoSampleSink} from 'mediabunny';
import {assert, expect, test} from 'vitest';
import {
	getMaxVideoCacheSize,
	globalMediaCache,
	keyframeManager,
} from '../caches';
import {extractFrameAndAudio} from '../extract-frame-and-audio';
import {extractFrame} from '../video-extraction/extract-frame';

// Both files have 4 colored quadrants: red | lime, blue | white.
// They were made from the same 64x32 H.264 stream:
// ffmpeg -display_hflip -i base.mp4 -c copy hflip.mp4
// ffmpeg -display_rotation 90 -display_hflip -i base.mp4 -c copy rotate-90-hflip.mp4

const COLORS = {
	red: [255, 0, 0],
	lime: [0, 255, 0],
	blue: [0, 0, 255],
	white: [255, 255, 255],
};

const extractParams = {
	logLevel: 'error' as const,
	loop: false,
	trimBefore: undefined,
	playbackRate: 1,
	fps: 30,
	maxCacheSize: getMaxVideoCacheSize('error'),
	credentials: undefined,
	mediaCache: globalMediaCache,
};

const renderFrame = async (src: string) => {
	const result = await extractFrameAndAudio({
		...extractParams,
		src,
		sampleRate: 48000,
		timeInSeconds: 0,
		durationInSeconds: 1 / 30,
		includeAudio: false,
		includeVideo: true,
		audioStreamIndex: null,
		trimAfter: undefined,
	});
	assert(result.type === 'success');
	assert(result.frame, 'Frame should be returned');
	return result.frame;
};

// The preview: mediabunny draws the sample with the rotation and the flip.
const drawPreviewFrame = async (src: string) => {
	const input = new Input({source: new UrlSource(src), formats: ALL_FORMATS});
	try {
		const track = await input.getPrimaryVideoTrack();
		assert(track, 'Video track should exist');
		const sample = await new VideoSampleSink(track).getSample(0);
		assert(sample, 'Sample should exist');
		try {
			const canvas = new OffscreenCanvas(
				sample.displayWidth,
				sample.displayHeight,
			);
			const ctx = canvas.getContext('2d');
			assert(ctx, 'Could not get 2d context');
			sample.draw(ctx, 0, 0);
			return {canvas, flip: sample.flip};
		} finally {
			sample.close();
		}
	} finally {
		input.dispose();
	}
};

const readPixels = (source: ImageBitmap | OffscreenCanvas) => {
	const canvas = new OffscreenCanvas(source.width, source.height);
	const ctx = canvas.getContext('2d');
	assert(ctx, 'Could not get 2d context');
	ctx.drawImage(source, 0, 0);
	return ctx.getImageData(0, 0, source.width, source.height);
};

// Read the center of each quadrant. Colors can blend near the edges.
const getQuadrantColors = (image: ImageData) => {
	const at = (x: number, y: number) => {
		const i = (Math.floor(y) * image.width + Math.floor(x)) * 4;
		return [image.data[i], image.data[i + 1], image.data[i + 2]];
	};

	const {width, height} = image;
	return [
		at(width / 4, height / 4),
		at((width * 3) / 4, height / 4),
		at(width / 4, (height * 3) / 4),
		at((width * 3) / 4, (height * 3) / 4),
	];
};

// YUV to RGB conversion shifts the colors, so compare by the closest color.
const nameColors = (pixels: number[][]) =>
	pixels.map((pixel) => {
		const distances = Object.entries(COLORS).map(
			([name, color]) =>
				[
					name,
					color.reduce((sum, channel, c) => sum + (channel - pixel[c]) ** 2, 0),
				] as const,
		);
		return distances.sort((a, b) => a[1] - b[1])[0][0];
	});

test('Rendered frame of a mirrored video is mirrored', async () => {
	keyframeManager.clearAll('error');
	let bitmap: ImageBitmap | null = null;
	try {
		bitmap = await renderFrame('/hflip.mp4');
		expect([bitmap.width, bitmap.height]).toEqual([64, 32]);
		expect(nameColors(getQuadrantColors(readPixels(bitmap)))).toEqual([
			'lime',
			'red',
			'white',
			'blue',
		]);
	} finally {
		bitmap?.close();
		keyframeManager.clearAll('error');
	}
});

test('Rendered frame of a rotated and mirrored video is anti-transposed', async () => {
	keyframeManager.clearAll('error');
	let bitmap: ImageBitmap | null = null;
	try {
		bitmap = await renderFrame('/rotate-90-hflip.mp4');
		// FFmpeg rotates counterclockwise, so mediabunny reads 270 degrees clockwise.
		// A 270 degree rotation and then a flip mirrors the frame across the anti-diagonal.
		expect([bitmap.width, bitmap.height]).toEqual([32, 64]);
		expect(nameColors(getQuadrantColors(readPixels(bitmap)))).toEqual([
			'white',
			'lime',
			'blue',
			'red',
		]);
	} finally {
		bitmap?.close();
		keyframeManager.clearAll('error');
	}
});

for (const src of ['/hflip.mp4', '/rotate-90-hflip.mp4']) {
	test(`Rendered frame matches the preview for ${src}`, async () => {
		keyframeManager.clearAll('error');
		let bitmap: ImageBitmap | null = null;
		try {
			const preview = await drawPreviewFrame(src);
			expect(preview.flip).toBe(true);
			bitmap = await renderFrame(src);
			expect([bitmap.width, bitmap.height]).toEqual([
				preview.canvas.width,
				preview.canvas.height,
			]);
			expect(nameColors(getQuadrantColors(readPixels(bitmap)))).toEqual(
				nameColors(getQuadrantColors(readPixels(preview.canvas))),
			);
		} finally {
			bitmap?.close();
			keyframeManager.clearAll('error');
		}
	});
}

test('extractFrame() reports flip for mirrored videos only', async () => {
	keyframeManager.clearAll('error');
	try {
		for (const [src, flip] of [
			['/hflip.mp4', true],
			['/video-start-offset.mp4', false],
		] as const) {
			const result = await extractFrame({
				...extractParams,
				src,
				timeInSeconds: 0,
				trimAfter: undefined,
			});
			try {
				assert(result.type === 'success');
				expect(result.frame).not.toBeNull();
				expect(result.flip).toBe(flip);
			} finally {
				if (result.type === 'success') {
					result.frame?.close();
				}
			}
		}
	} finally {
		keyframeManager.clearAll('error');
	}
});

test('extractFrame() reports no flip when there is no frame', async () => {
	keyframeManager.clearAll('error');
	try {
		// The requested time is after trimAfter, so no frame is extracted.
		const result = await extractFrame({
			...extractParams,
			src: '/hflip.mp4',
			timeInSeconds: 1,
			trimAfter: 1,
		});
		assert(result.type === 'success');
		expect(result.frame).toBeNull();
		expect(result.flip).toBe(false);
		expect(result.rotation).toBe(0);
	} finally {
		keyframeManager.clearAll('error');
	}
});
