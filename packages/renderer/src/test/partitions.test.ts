import {expect, test} from 'bun:test';
import {renderPartitions} from '../render-partitions';

test('balanced partitions', () => {
	expect(
		renderPartitions({frames: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], concurrency: 3})
			.partitions,
	).toEqual([
		[1, 2, 3, 4],
		[5, 6, 7],
		[8, 9, 10],
	]);
});

test('should handle concurrency > partitions', () => {
	expect(
		renderPartitions({frames: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], concurrency: 12})
			.partitions,
	).toEqual([[1], [2], [3], [4], [5], [6], [7], [8], [9], [10], [], []]);
});

test('if done with your partition, split the biggest partition again', () => {
	const partitions = renderPartitions({
		frames: new Array(64).fill(true).map((_, i) => i),
		concurrency: 4,
	});

	expect(partitions.partitions).toEqual([
		[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
		[16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31],
		[32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47],
		[48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63],
	]);

	expect(partitions.getNextFrame(0)).toBe(0);
	expect(partitions.getNextFrame(0)).toBe(1);
	expect(partitions.getNextFrame(1)).toBe(16);
	expect(partitions.getNextFrame(2)).toBe(32);
	expect(partitions.getNextFrame(2)).toBe(33);
	expect(partitions.getNextFrame(0)).toBe(2);
	expect(partitions.getNextFrame(0)).toBe(3);
	expect(partitions.getNextFrame(0)).toBe(4);
	expect(partitions.getNextFrame(0)).toBe(5);
	expect(partitions.getNextFrame(0)).toBe(6);
	expect(partitions.getNextFrame(0)).toBe(7);
	expect(partitions.getNextFrame(0)).toBe(8);
	expect(partitions.getNextFrame(0)).toBe(9);
	expect(partitions.getNextFrame(0)).toBe(10);
	expect(partitions.getNextFrame(0)).toBe(11);
	expect(partitions.getNextFrame(0)).toBe(12);
	expect(partitions.getNextFrame(0)).toBe(13);
	expect(partitions.getNextFrame(0)).toBe(14);
	expect(partitions.getNextFrame(0)).toBe(15);
	expect(partitions.getNextFrame(0)).toBe(55);
	expect(partitions.getNextFrame(0)).toBe(56);
	expect(partitions.getNextFrame(1)).toBe(17);
	expect(() => partitions.getNextFrame(10)).toThrow();
});
