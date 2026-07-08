import {expect, test} from 'vitest';
import {createVideoIterator} from '../video/video-preview-iterator';

const makeFrame = (timestamp: number, duration: number) => ({
	timestamp,
	duration,
	canvas: new OffscreenCanvas(1, 1),
});

const makeIterator = (
	frames: {timestamp: number; duration: number; canvas: OffscreenCanvas}[],
) => {
	let index = 0;
	return createVideoIterator(0, {
		makeIteratorOrUsePrewarmed: () => ({
			next: () => ({type: 'ready' as const, frame: frames[index++] ?? null}),
			closeIterator: () => Promise.resolve(),
		}),
		destroy: () => undefined,
		prewarmIteratorForLooping: () => undefined,
	});
};

test('keeps the previous frame when the next frame is still too far away', async () => {
	const iterator = await makeIterator([
		makeFrame(0, 0.01),
		makeFrame(0.033, 0.033),
	]);

	const result = await iterator.tryToSatisfySeek(0.02);
	expect(result.type).toBe('satisfied');
	if (result.type === 'satisfied') {
		expect(result.frame.timestamp).toBe(0);
	}

	iterator.destroy();
});

test('awaits a pending next frame instead of reporting not satisfied', async () => {
	const frames = [makeFrame(0, 0.01), makeFrame(0.033, 0.033)];
	let index = 0;
	const iterator = await createVideoIterator(0, {
		makeIteratorOrUsePrewarmed: () => ({
			next: () => {
				const frame = frames[index++] ?? null;
				if (index === 1) {
					return {type: 'ready' as const, frame};
				}

				return {
					type: 'pending' as const,
					wait: () => Promise.resolve(frame),
				};
			},
			closeIterator: () => Promise.resolve(),
		}),
		destroy: () => undefined,
		prewarmIteratorForLooping: () => undefined,
	});

	const result = await iterator.tryToSatisfySeek(0.04);
	expect(result.type).toBe('satisfied');
	if (result.type === 'satisfied') {
		expect(result.frame.timestamp).toBe(0.033);
	}

	iterator.destroy();
});

test('selects each frame when metadata FPS is slightly higher than sample timestamps', async () => {
	const fpsFromPacketStats = 30.00600120624245;
	const frames = Array.from({length: 20}, (_, index) => {
		return makeFrame(Math.round((index / 30) * 1000) / 1000, 1 / 30);
	});
	const iterator = await makeIterator(frames);
	const selectedTimestamps: number[] = [];

	for (let frame = 0; frame < frames.length; frame++) {
		const result = await iterator.tryToSatisfySeek(frame / fpsFromPacketStats);
		expect(result.type).toBe('satisfied');
		if (result.type !== 'satisfied') {
			throw new Error(result.reason);
		}

		selectedTimestamps.push(result.frame.timestamp);
	}

	expect(selectedTimestamps).toEqual(frames.map((frame) => frame.timestamp));

	iterator.destroy();
});
