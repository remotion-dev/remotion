import {
	VideoSample,
	type VideoSampleSink,
	type WrappedCanvas,
} from 'mediabunny';
import {expect, test} from 'vitest';
import {
	canvasesAheadOfTime,
	makeStableFramePool,
	releaseStableFrame,
} from '../canvas-ahead-of-time';
import {makePrewarmedVideoIteratorCache} from '../prewarm-iterator-for-looping';

const makeCanvas = () => {
	const canvas = new OffscreenCanvas(2, 2);
	const context = canvas.getContext('2d');
	if (!context) {
		throw new Error('Could not get canvas context');
	}

	return {canvas, context};
};

const fillCanvas = (
	context: OffscreenCanvasRenderingContext2D,
	color: string,
) => {
	context.fillStyle = color;
	context.fillRect(0, 0, 2, 2);
};

const getPixel = (canvas: OffscreenCanvas) => {
	const context = canvas.getContext('2d');
	if (!context) {
		throw new Error('Could not get canvas context');
	}

	return [...context.getImageData(0, 0, 1, 1).data];
};

const makeReusingSampleSink = (): VideoSampleSink => {
	const {canvas, context} = makeCanvas();
	const colors = ['rgb(255, 0, 0)', 'rgb(0, 255, 0)', 'rgb(0, 0, 255)'];

	return {
		async *samples() {
			for (let i = 0; i < colors.length; i++) {
				fillCanvas(context, colors[i]);
				await Promise.resolve();

				yield new VideoSample(canvas, {duration: 1, timestamp: i});
			}
		},
	} as unknown as VideoSampleSink;
};

const waitForFrame = (
	frame: ReturnType<ReturnType<typeof canvasesAheadOfTime>['next']>,
) => {
	if (frame.type === 'ready') {
		return Promise.resolve(frame.frame);
	}

	return frame.wait();
};

test('keeps already-returned canvases stable when samples are created from a reused scratch canvas', async () => {
	const pool = makeStableFramePool();
	const iterator = canvasesAheadOfTime(
		makeReusingSampleSink(),
		undefined,
		null,
		pool,
	);
	const frames: (WrappedCanvas | null)[] = [];

	try {
		const firstFrame = await waitForFrame(iterator.next());
		frames.push(firstFrame);
		expect(firstFrame).not.toBeNull();

		const secondFrame = await waitForFrame(iterator.next());
		frames.push(secondFrame);
		expect(secondFrame).not.toBeNull();

		const thirdFrame = await waitForFrame(iterator.next());
		frames.push(thirdFrame);
		expect(thirdFrame).not.toBeNull();

		expect(getPixel(firstFrame!.canvas as OffscreenCanvas)).toEqual([
			255, 0, 0, 255,
		]);
		expect(getPixel(secondFrame!.canvas as OffscreenCanvas)).toEqual([
			0, 255, 0, 255,
		]);
		expect(getPixel(thirdFrame!.canvas as OffscreenCanvas)).toEqual([
			0, 0, 255, 255,
		]);
	} finally {
		frames.forEach(releaseStableFrame);
		pool.dispose();
		await iterator.closeIterator();
	}
});

test('clears a canvas reused after a seek and frees it when its last frame is released', async () => {
	const canvas = new OffscreenCanvas(2, 1);
	const context = canvas.getContext('2d');
	if (!context) {
		throw new Error('Could not get canvas context');
	}

	const sink = {
		async *samples(startTimestamp: number) {
			context.clearRect(0, 0, 2, 1);
			context.fillStyle = 'red';
			context.fillRect(startTimestamp, 0, 1, 1);
			yield new VideoSample(canvas, {duration: 1, timestamp: startTimestamp});
		},
	} as unknown as VideoSampleSink;
	const cache = makePrewarmedVideoIteratorCache(sink, 1000);
	const firstIterator = cache.makeIteratorOrUsePrewarmed(0);
	cache.prewarmIteratorForLooping({timeToSeek: 1});
	const secondIterator = cache.makeIteratorOrUsePrewarmed(1);
	let first: WrappedCanvas | null = null;
	let second: WrappedCanvas | null = null;

	try {
		first = await waitForFrame(firstIterator.next());
		const reusedCanvas = first!.canvas as OffscreenCanvas;
		expect(getPixel(reusedCanvas)).toEqual([255, 0, 0, 255]);
		await firstIterator.closeIterator();
		releaseStableFrame(first);

		second = await waitForFrame(secondIterator.next());
		expect(second!.canvas).toBe(reusedCanvas);
		cache.destroy();
		expect(getPixel(reusedCanvas)).toEqual([0, 0, 0, 0]);
		releaseStableFrame(second);
		expect([reusedCanvas.width, reusedCanvas.height]).toEqual([0, 0]);
	} finally {
		releaseStableFrame(first);
		releaseStableFrame(second);
		cache.destroy();
		await Promise.all([
			firstIterator.closeIterator(),
			secondIterator.closeIterator(),
		]);
	}
});
