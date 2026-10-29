import {
	VideoSample,
	type VideoSampleSink,
	type WrappedCanvas,
} from 'mediabunny';
import {expect, test} from 'vitest';
import {canvasesAheadOfTime, releaseStableFrame} from '../canvas-ahead-of-time';

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
	const iterator = canvasesAheadOfTime(makeReusingSampleSink());
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
		await iterator.closeIterator();
	}
});

test('clears a recycled stable canvas before copying a transparent frame', async () => {
	const canvas = new OffscreenCanvas(2, 1);
	const context = canvas.getContext('2d');
	if (!context) {
		throw new Error('Could not get canvas context');
	}

	const sink = {
		async *samples() {
			for (let i = 0; i < 4; i++) {
				context.clearRect(0, 0, 2, 1);
				context.fillStyle = 'red';
				context.fillRect(i % 2, 0, 1, 1);
				await Promise.resolve();

				yield new VideoSample(canvas, {duration: 1, timestamp: i});
			}
		},
	} as unknown as VideoSampleSink;
	const iterator = canvasesAheadOfTime(sink);
	const frames: (WrappedCanvas | null)[] = [];

	try {
		const first = await waitForFrame(iterator.next());
		frames.push(first);
		expect(getPixel(first!.canvas as OffscreenCanvas)).toEqual([
			255, 0, 0, 255,
		]);
		frames.push(await waitForFrame(iterator.next()));
		frames.push(await waitForFrame(iterator.next()));
		releaseStableFrame(first);
		const fourth = await waitForFrame(iterator.next());
		frames.push(fourth);
		expect(fourth!.canvas).toBe(first!.canvas);

		expect(getPixel(fourth!.canvas as OffscreenCanvas)).toEqual([0, 0, 0, 0]);
	} finally {
		frames.forEach(releaseStableFrame);
		await iterator.closeIterator();
	}
});
