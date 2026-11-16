import {expect, test} from 'bun:test';
import {validateImageSequencePattern} from '../validate-image-sequence-pattern';

test('accepts a pattern containing [frame]', () => {
	expect(() =>
		validateImageSequencePattern('element-[frame].[ext]'),
	).not.toThrow();
});

test('accepts null', () => {
	expect(() => validateImageSequencePattern(null)).not.toThrow();
});

test('accepts a pattern that nests the frames in a subfolder', () => {
	expect(() =>
		validateImageSequencePattern('frames/element-[frame].[ext]'),
	).not.toThrow();
});

test('rejects a pattern without [frame]', () => {
	expect(() => validateImageSequencePattern('element.[ext]')).toThrow(
		'imageSequencePattern must contain [frame]',
	);
});

test('rejects a pattern that traverses upwards', () => {
	expect(() => validateImageSequencePattern('../out-[frame].[ext]')).toThrow(
		'imageSequencePattern must contain [frame]',
	);
});

test('rejects a pattern that traverses upwards after a subfolder', () => {
	expect(() =>
		validateImageSequencePattern('frames/../../out-[frame].[ext]'),
	).toThrow('imageSequencePattern must contain [frame]');
});

test('rejects an absolute POSIX path', () => {
	expect(() => validateImageSequencePattern('/tmp/[frame].[ext]')).toThrow(
		'imageSequencePattern must contain [frame]',
	);
});

test('rejects an absolute Windows path', () => {
	expect(() => validateImageSequencePattern('C:\\temp\\[frame].[ext]')).toThrow(
		'imageSequencePattern must contain [frame]',
	);
});

test('rejects a pattern with control characters', () => {
	expect(() =>
		validateImageSequencePattern('element-[frame]\u0000.[ext]'),
	).toThrow('imageSequencePattern must contain [frame]');
});
