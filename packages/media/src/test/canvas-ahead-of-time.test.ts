import type {CanvasSink, WrappedCanvas} from 'mediabunny';
import {expect, test} from 'vitest';
import {canvasesAheadOfTime} from '../canvas-ahead-of-time';

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

const makeReusingCanvasSink = (): CanvasSink => {
	const {canvas, context} = makeCanvas();
	const colors = ['rgb(255, 0, 0)', 'rgb(0, 255, 0)', 'rgb(0, 0, 255)'];

	return {
		async *canvases() {
			for (let i = 0; i < colors.length; i++) {
				fillCanvas(context, colors[i]);
				await Promise.resolve();

				yield {
					canvas,
					duration: 1,
					timestamp: i,
				} satisfies WrappedCanvas;
			}
		},
	} as unknown as CanvasSink;
};

const waitForFrame = (
	frame: ReturnType<ReturnType<typeof canvasesAheadOfTime>['next']>,
) => {
	if (frame.type === 'ready') {
		return Promise.resolve(frame.frame);
	}

	return frame.wait();
};

test('keeps already-returned canvases stable when the CanvasSink reuses its canvas', async () => {
	const iterator = canvasesAheadOfTime(makeReusingCanvasSink());

	try {
		const firstFrame = await waitForFrame(iterator.next());
		expect(firstFrame).not.toBeNull();

		const secondFrame = await waitForFrame(iterator.next());
		expect(secondFrame).not.toBeNull();

		const thirdFrame = await waitForFrame(iterator.next());
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
		await iterator.closeIterator();
	}
});
