import {expect, test} from 'bun:test';
import {hasEnoughMemoryForParallelEncoding} from '../prestitcher-memory-usage';

test('parallel encoding keeps a fixed 2GB memory reserve', () => {
	const estimatedUsage = 8_294_400_000;

	expect(
		hasEnoughMemoryForParallelEncoding({
			estimatedUsage,
			freeMemory: 11_000_000_000,
		}),
	).toBe(true);
	expect(
		hasEnoughMemoryForParallelEncoding({
			estimatedUsage,
			freeMemory: 10_000_000_000,
		}),
	).toBe(false);
});
