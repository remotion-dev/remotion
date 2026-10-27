import type {WrappedCanvas} from 'mediabunny';
import {expect, test} from 'vitest';
import {createVideoIterator} from '../video/video-preview-iterator';

const makeFrame = ({
	timestamp,
	duration,
}: {
	timestamp: number;
	duration: number;
}): WrappedCanvas => {
	return {
		canvas: {} as OffscreenCanvas,
		duration,
		timestamp,
	};
};

test('preview iterator uses next frame timestamp instead of reported duration', async () => {
	const frames = [
		makeFrame({timestamp: 0, duration: 0.1}),
		makeFrame({timestamp: 1, duration: 0.1}),
		makeFrame({timestamp: 2, duration: 0.1}),
	];

	const iterator = await createVideoIterator(0, {
		destroy: () => undefined,
		makeIteratorOrUsePrewarmed: () => {
			let index = 0;

			return {
				closeIterator: () => Promise.resolve(),
				next: () => {
					const frame = frames[index++] ?? null;
					return {
						type: 'ready' as const,
						frame,
					};
				},
			};
		},
		prewarmIteratorForLooping: () => undefined,
	});

	try {
		const result = await iterator.tryToSatisfySeek(1.5, {
			onWait: () => undefined,
			pendingFrameBehavior: 'wait',
			shouldContinue: () => true,
		});

		if (result.type !== 'satisfied') {
			throw new Error(`Expected seek to be satisfied, got ${result.reason}`);
		}

		expect(result.frame.timestamp).toBe(1);
	} finally {
		iterator.destroy();
	}
});

test('preview iterator does not trust reported duration without a next timestamp', async () => {
	const frames = [
		makeFrame({timestamp: 0, duration: 10}),
		makeFrame({timestamp: 1, duration: 10}),
	];
	let index = 0;
	let pendingWaits = 0;

	const iterator = await createVideoIterator(0, {
		destroy: () => undefined,
		makeIteratorOrUsePrewarmed: () => {
			return {
				closeIterator: () => Promise.resolve(),
				next: () => {
					const frame = frames[index++];
					if (frame) {
						return {
							type: 'ready' as const,
							frame,
						};
					}

					return {
						type: 'pending' as const,
						wait: () => {
							pendingWaits++;
							return Promise.resolve(makeFrame({timestamp: 2, duration: 10}));
						},
					};
				},
			};
		},
		prewarmIteratorForLooping: () => undefined,
	});

	try {
		const result = await iterator.tryToSatisfySeek(1.5, {
			onWait: () => undefined,
			pendingFrameBehavior: 'restart-iterator',
			shouldContinue: () => true,
		});

		expect(result.type).toBe('not-satisfied');
		expect(pendingWaits).toBe(0);
	} finally {
		iterator.destroy();
	}
});

test('preview iterator waits through high-FPS frames for a sequential timeline step', async () => {
	const sourceFps = 240;
	const timelineFps = 30;
	let frameIndex = 0;
	let pendingWaits = 0;

	const iterator = await createVideoIterator(0, {
		destroy: () => undefined,
		makeIteratorOrUsePrewarmed: () => {
			return {
				closeIterator: () => Promise.resolve(),
				next: () => {
					const frame = makeFrame({
						timestamp: frameIndex / sourceFps,
						duration: 1 / sourceFps,
					});
					frameIndex++;

					if (frameIndex === 1) {
						return {type: 'ready' as const, frame};
					}

					return {
						type: 'pending' as const,
						wait: () => {
							pendingWaits++;
							return Promise.resolve(frame);
						},
					};
				},
			};
		},
		prewarmIteratorForLooping: () => undefined,
	});

	try {
		const result = await iterator.tryToSatisfySeek(1 / timelineFps, {
			onWait: () => undefined,
			pendingFrameBehavior: 'wait',
			shouldContinue: () => true,
		});

		if (result.type !== 'satisfied') {
			throw new Error(`Expected seek to be satisfied, got ${result.reason}`);
		}

		expect(result.frame.timestamp).toBe(8 / sourceFps);
		expect(pendingWaits).toBe(9);
	} finally {
		iterator.destroy();
	}
});

test('preview iterator supports frames longer than one timeline step', async () => {
	let index = 0;
	let pendingWaits = 0;
	const frames = [
		makeFrame({timestamp: 0, duration: 0.085}),
		makeFrame({timestamp: 0.085, duration: 1 / 30}),
	];

	const iterator = await createVideoIterator(0, {
		destroy: () => undefined,
		makeIteratorOrUsePrewarmed: () => {
			return {
				closeIterator: () => Promise.resolve(),
				next: () => {
					const frame = frames[index++] ?? null;
					if (index === 1) {
						return {type: 'ready' as const, frame};
					}

					return {
						type: 'pending' as const,
						wait: () => {
							pendingWaits++;
							return Promise.resolve(frame);
						},
					};
				},
			};
		},
		prewarmIteratorForLooping: () => undefined,
	});

	try {
		const result = await iterator.tryToSatisfySeek(0.075, {
			onWait: () => undefined,
			pendingFrameBehavior: 'wait',
			shouldContinue: () => true,
		});

		if (result.type !== 'satisfied') {
			throw new Error(`Expected seek to be satisfied, got ${result.reason}`);
		}

		expect(result.frame.timestamp).toBe(0);
		expect(pendingWaits).toBe(1);
	} finally {
		iterator.destroy();
	}
});

test('preview iterator stops decoding when a seek is superseded', async () => {
	const sourceFps = 240;
	let frameIndex = 0;
	let pendingWaits = 0;
	let shouldContinue = true;

	const iterator = await createVideoIterator(0, {
		destroy: () => undefined,
		makeIteratorOrUsePrewarmed: () => {
			return {
				closeIterator: () => Promise.resolve(),
				next: () => {
					const frame = makeFrame({
						timestamp: frameIndex / sourceFps,
						duration: 1 / sourceFps,
					});
					frameIndex++;

					if (frameIndex === 1) {
						return {type: 'ready' as const, frame};
					}

					return {
						type: 'pending' as const,
						wait: () => {
							pendingWaits++;
							shouldContinue = false;
							return Promise.resolve(frame);
						},
					};
				},
			};
		},
		prewarmIteratorForLooping: () => undefined,
	});

	try {
		const result = await iterator.tryToSatisfySeek(1, {
			onWait: () => undefined,
			pendingFrameBehavior: 'wait',
			shouldContinue: () => shouldContinue,
		});

		expect(result).toEqual({
			type: 'not-satisfied',
			reason: 'seek was superseded',
		});
		expect(pendingWaits).toBe(1);
	} finally {
		iterator.destroy();
	}
});

test('preview iterator accepts a frame whose millisecond-quantized timestamp is within 1ms after the requested time', async () => {
	// WebM stores timestamps in whole milliseconds. Frame 7 of a 29.97fps file
	// (7 * 1001 / 30000 = 0.233567s) is stored at 0.234s, while the timeline
	// asks for 7 / 30 = 0.2333s. The render path tolerates this (see
	// keyframe-bank.ts), so the preview has to as well, otherwise it lags one
	// frame behind the render. https://github.com/remotion-dev/remotion/issues/12603
	const frames = [
		makeFrame({timestamp: 0.2, duration: 0.034}),
		makeFrame({timestamp: 0.234, duration: 0.033}),
		makeFrame({timestamp: 0.267, duration: 0.033}),
	];
	const iterator = await createVideoIterator(0, {
		destroy: () => undefined,
		makeIteratorOrUsePrewarmed: () => {
			let index = 0;
			return {
				closeIterator: () => Promise.resolve(),
				next: () => {
					const frame = frames[index++] ?? null;
					return {
						type: 'ready' as const,
						frame,
					};
				},
			};
		},
		prewarmIteratorForLooping: () => undefined,
	});
	try {
		const result = await iterator.tryToSatisfySeek(7 / 30, {
			onWait: () => undefined,
			pendingFrameBehavior: 'wait',
			shouldContinue: () => true,
		});
		if (result.type !== 'satisfied') {
			throw new Error(`Expected seek to be satisfied, got ${result.reason}`);
		}
		expect(result.frame.timestamp).toBe(0.234);
	} finally {
		iterator.destroy();
	}
});
