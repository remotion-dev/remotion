import {expect, test} from 'vitest';
import '../symbol-dispose';
import {renderFramesOnWeb, renderStillOnWeb} from '../render-still-on-web';
import {queuedFrameCapture} from './fixtures/queued-frame-capture';

const expectFrame = (
	canvas: OffscreenCanvas,
	frame: number,
	background: [number, number, number],
) => {
	try {
		expect([canvas.width, canvas.height]).toEqual([64, 48]);
		const pixels = canvas.getContext('2d')!.getImageData(0, 0, 64, 48).data;
		expect(
			pixels.every((value, index) => {
				const channel = index % 4;
				if (channel === 3) return value === 255;
				const pixel = Math.floor(index / 4);
				const x = pixel % 64;
				const y = Math.floor(pixel / 64);
				const insideMarker =
					x >= 5 + frame && x < 22 + frame && y >= 7 && y < 26;
				return value === (insideMarker ? [242, 213, 48] : background)[channel];
			}),
		).toBe(true);
	} finally {
		canvas.width = 0;
		canvas.height = 0;
	}
};

const gate = () => {
	let release!: () => void;
	const promise = new Promise<void>((resolve) => {
		release = resolve;
	});

	return {promise, release};
};

const options = {
	licenseKey: 'free-license',
	allowHtmlInCanvas: false,
	inputProps: {},
} as const;

test.for([{abortQueued: false}, {abortQueued: true}])(
	'preserves FIFO capture pixels and sparse frame order with queued abort=$abortQueued',
	async ({abortQueued}) => {
		const frames = [3, 0, 2];
		const hold = gate();
		const started = gate();
		const events: string[] = [];
		const batch = renderFramesOnWeb({
			...options,
			frames,
			composition: queuedFrameCapture({
				variant: 'batch',
				hold: {frame: 3, promise: hold.promise, onStarted: started.release},
				onMount: () => events.push('batch mounted'),
				onUnmount: () => events.push('batch unmounted'),
			}),
		});

		await started.promise;
		const controller = new AbortController();
		let cancellation: unknown = null;
		const queued = renderStillOnWeb({
			...options,
			frame: 1,
			signal: controller.signal,
			composition: queuedFrameCapture({
				variant: 'queued',
				hold: null,
				onMount: () => events.push('queued mounted'),
				onUnmount: () => events.push('queued unmounted'),
			}),
		});

		const queuedResult = queued.catch((error: unknown) => {
			cancellation = error;
			return null;
		});

		const still = renderStillOnWeb({
			...options,
			frame: 4,
			composition: queuedFrameCapture({
				variant: 'still',
				hold: null,
				onMount: () => events.push('still mounted'),
				onUnmount: () => events.push('still unmounted'),
			}),
		});

		try {
			if (abortQueued) {
				controller.abort();
				for (let i = 0; i < 8; i++) await Promise.resolve();
				expect(cancellation).toBeInstanceOf(Error);
				expect((cancellation as Error).message).toBe(
					'renderStillOnWeb() was cancelled',
				);
			}

			expect(events).toEqual(['batch mounted']);
		} finally {
			hold.release();
			await Promise.allSettled([batch, queuedResult, still]);
		}

		const results = await batch;
		expect(results).toHaveLength(frames.length);
		for (const [index, result] of results.entries()) {
			const frame = [0, 2, 3][index];
			expectFrame(await result.canvas(), frame, [32 + frame * 17, 80, 144]);
		}

		const queuedImage = await queuedResult;
		if (abortQueued) expect(queuedImage).toBeNull();
		else {
			expect(queuedImage).not.toBeNull();
			expectFrame(await queuedImage!.canvas(), 1, [48, 160, 67]);
		}

		expectFrame(await (await still).canvas(), 4, [176, 92, 64]);
		expect(events).toEqual([
			'batch mounted',
			'batch unmounted',
			...(abortQueued ? [] : ['queued mounted', 'queued unmounted']),
			'still mounted',
			'still unmounted',
		]);
	},
);

test('aborting an active batch releases its turn without changing the next capture', async () => {
	const hold = gate();
	const started = gate();
	const controller = new AbortController();
	const events: string[] = [];
	const batch = renderFramesOnWeb({
		...options,
		frames: [3, 0, 2],
		signal: controller.signal,
		composition: queuedFrameCapture({
			variant: 'batch',
			hold: {frame: 3, promise: hold.promise, onStarted: started.release},
			onMount: null,
			onUnmount: () => events.push('batch unmounted'),
		}),
	});

	const failure = batch.catch((error: unknown) => error);
	await started.promise;
	const still = renderStillOnWeb({
		...options,
		frame: 4,
		composition: queuedFrameCapture({
			variant: 'still',
			hold: null,
			onMount: () => events.push('still mounted'),
			onUnmount: () => events.push('still unmounted'),
		}),
	});

	try {
		controller.abort();
		expect(await failure).toBeInstanceOf(Error);
		expect(((await failure) as Error).message).toBe(
			'renderFramesOnWeb() was cancelled',
		);
		expectFrame(await (await still).canvas(), 4, [176, 92, 64]);
		expect(events).toEqual([
			'batch unmounted',
			'still mounted',
			'still unmounted',
		]);
	} finally {
		hold.release();
		await Promise.allSettled([batch, still]);
	}
});
