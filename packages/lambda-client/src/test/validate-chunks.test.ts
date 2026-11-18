import {expect, test} from 'bun:test';
import {validateChunks} from '../validate-chunks';

const validate = (
	chunks: unknown,
	overrides: Partial<Parameters<typeof validateChunks>[0]> = {},
) =>
	validateChunks({
		frameRange: [0, 374],
		everyNthFrame: 1,
		framesPerFunction: null,
		concurrency: null,
		...overrides,
		chunks,
	});

test('returns unequal chunks that cover the frame range unchanged', () => {
	const chunks: [number, number][] = [
		[0, 59],
		[60, 89],
		[90, 104],
		[105, 119],
		[120, 199],
		[200, 374],
	];
	expect(validate(chunks)).toEqual(chunks);
});

test('accepts a frame range that does not start at 0', () => {
	expect(
		validate(
			[
				[100, 149],
				[150, 374],
			],
			{frameRange: [100, 374]},
		),
	).toEqual([
		[100, 149],
		[150, 374],
	]);
	expect(() =>
		validate(
			[
				[0, 149],
				[150, 374],
			],
			{frameRange: [100, 374]},
		),
	).toThrow(
		"'chunks[0]' needs to start at the first frame of the frame range (100), but starts at 0",
	);
});

test('accepts the minimum chunk length and the maximum number of chunks', () => {
	expect(
		validate([
			[0, 4],
			[5, 374],
		]),
	).toHaveLength(2);
	const maximum = new Array(200).fill(true).map((_, i) => [i * 5, i * 5 + 4]);
	expect(validate(maximum, {frameRange: [0, 999]})).toHaveLength(200);
});

test('accepts a single chunk shorter than the minimum when the frame range is that short', () => {
	expect(validate([[0, 2]], {frameRange: [0, 2]})).toEqual([[0, 2]]);
});

test('rejects gaps, overlaps and unsorted chunks', () => {
	expect(() =>
		validate([
			[0, 99],
			[101, 374],
		]),
	).toThrow("'chunks[1]' needs to start at 100, right after 'chunks[0]'");
	expect(() =>
		validate([
			[0, 99],
			[99, 374],
		]),
	).toThrow("'chunks[1]' needs to start at 100, right after 'chunks[0]'");
	expect(() =>
		validate([
			[100, 374],
			[0, 99],
		]),
	).toThrow("'chunks[0]' needs to start at the first frame");
});

test('rejects chunks that do not end at the last frame of the frame range', () => {
	expect(() =>
		validate([
			[0, 99],
			[100, 373],
		]),
	).toThrow(
		"The last entry of 'chunks' needs to end at the last frame of the frame range (374), but ends at 373",
	);
	expect(() =>
		validate([
			[0, 99],
			[100, 400],
		]),
	).toThrow('but ends at 400');
});

test('rejects a chunk with fewer frames than MINIMUM_FRAMES_PER_FUNCTION, including the last one', () => {
	expect(() =>
		validate([
			[0, 3],
			[4, 374],
		]),
	).toThrow("'chunks[0]' needs to have at least 5 frames, but [0, 3] has 4");
	expect(() =>
		validate([
			[0, 370],
			[371, 374],
		]),
	).toThrow(
		"'chunks[1]' needs to have at least 5 frames, but [371, 374] has 4",
	);
});

test('rejects more chunks than MAX_FUNCTIONS_PER_RENDER', () => {
	const tooMany = new Array(201).fill(true).map((_, i) => [i * 5, i * 5 + 4]);
	expect(() => validate(tooMany, {frameRange: [0, 1004]})).toThrow(
		"'chunks' cannot have more than 200 entries, passed 201",
	);
});

test('rejects malformed chunks', () => {
	expect(() => validate([])).toThrow(
		"'chunks' needs to be a non-empty array of [startFrame, endFrame] pairs",
	);
	expect(() => validate('0-374')).toThrow(
		"'chunks' needs to be a non-empty array of [startFrame, endFrame] pairs",
	);
	expect(() => validate([[0, 374, 1]])).toThrow(
		"'chunks[0]' needs to be a pair of integers",
	);
	expect(() =>
		validate([
			[0, 10.5],
			[11, 374],
		]),
	).toThrow("'chunks[0]' needs to be a pair of integers");
	expect(() => validate([['0', 374]])).toThrow(
		"'chunks[0]' needs to be a pair of integers",
	);
	expect(() =>
		validate([
			[0, 200],
			[201, 150],
		]),
	).toThrow("'chunks[1]' needs to end at or after its start");
});

test('rejects chunks combined with framesPerLambda, concurrency or everyNthFrame', () => {
	expect(() => validate([[0, 374]], {framesPerFunction: 20})).toThrow(
		"Both 'chunks' and 'framesPerLambda' were set",
	);
	expect(() => validate([[0, 374]], {concurrency: 4})).toThrow(
		"Both 'chunks' and 'concurrency' were set",
	);
	expect(() => validate([[0, 374]], {everyNthFrame: 2})).toThrow(
		"'chunks' cannot be combined with 'everyNthFrame'",
	);
});
