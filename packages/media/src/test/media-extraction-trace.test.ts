import {expect, test, vi} from 'vitest';
import {
	makeMediaExtractionTrace,
	traceMediaOperation,
	withMediaExtractionTimeout,
} from '../media-extraction-trace';

test('media extraction timeout contains active and completed trace steps', async () => {
	const trace = makeMediaExtractionTrace({
		src: 'blob:http://localhost/example',
		timeInSeconds: 0.13333333333333333,
	});

	await traceMediaOperation({
		trace,
		label: 'video:getSink',
		operation: () => undefined,
	});

	const stuckOperation = traceMediaOperation({
		trace,
		label: 'video:keyframeBank.getFrameFromTimestamp',
		operation: () => new Promise<never>(() => undefined),
	});

	await expect(
		withMediaExtractionTimeout({
			promise: stuckOperation,
			trace,
			src: 'blob:http://localhost/example',
			timeInSeconds: 0.13333333333333333,
			timeoutInMilliseconds: 1,
		}),
	).rejects.toThrow(
		/Active media extraction steps:\n- video:keyframeBank\.getFrameFromTimestamp running for \d+ms/,
	);

	expect(trace.getSummary()).toContain('- video:getSink completed in');
});

test('media extraction timeout calls its recovery hook', async () => {
	const onTimeout = vi.fn();

	await expect(
		withMediaExtractionTimeout({
			promise: new Promise<never>(() => undefined),
			trace: null,
			src: 'blob:http://localhost/example',
			timeInSeconds: 0,
			timeoutInMilliseconds: 1,
			onTimeout,
		}),
	).rejects.toThrow(
		'Timed out extracting media from blob:http://localhost/example at 0s after 1ms.',
	);

	expect(onTimeout).toHaveBeenCalledTimes(1);
});
