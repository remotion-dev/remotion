import {expect, test} from 'vitest';
import '../symbol-dispose';
import {renderFramesOnWeb, renderStillOnWeb} from '../render-still-on-web';
import {queuedFrameCapture} from './fixtures/queued-frame-capture';
import {captureNativeReference, compareNativePixels} from './native-reference';

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
		const references = [];
		for (const frame of [0, 2, 3]) {
			references.push(
				await captureNativeReference(
					queuedFrameCapture({variant: 'batch'}),
					frame,
					{omitBackground: false},
				),
			);
		}

		const queuedReference = await captureNativeReference(
			queuedFrameCapture({variant: 'queued'}),
			1,
			{omitBackground: false},
		);
		const stillReference = await captureNativeReference(
			queuedFrameCapture({variant: 'still'}),
			4,
			{omitBackground: false},
		);
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
			const actual = await result.blob({format: 'png'});
			expect(
				(await compareNativePixels(references[index], actual)).mismatchedPixels,
			).toBe(0);
		}

		const queuedImage = await queuedResult;
		if (abortQueued) expect(queuedImage).toBeNull();
		else {
			expect(queuedImage).not.toBeNull();
			expect(
				(
					await compareNativePixels(
						queuedReference,
						await queuedImage!.blob({format: 'png'}),
					)
				).mismatchedPixels,
			).toBe(0);
		}

		expect(
			(
				await compareNativePixels(
					stillReference,
					await (await still).blob({format: 'png'}),
				)
			).mismatchedPixels,
		).toBe(0);
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
	const reference = await captureNativeReference(
		queuedFrameCapture({variant: 'still'}),
		4,
		{omitBackground: false},
	);
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
		expect(
			(
				await compareNativePixels(
					reference,
					await (await still).blob({format: 'png'}),
				)
			).mismatchedPixels,
		).toBe(0);
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
