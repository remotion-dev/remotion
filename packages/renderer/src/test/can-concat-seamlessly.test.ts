import {expect, test} from 'bun:test';
import {canConcatAudioSeamlessly} from '../can-concat-seamlessly';

test('concatenates AAC seamlessly when every chunk is longer than 4 frames', () => {
	expect(canConcatAudioSeamlessly('aac', 5, 'seamless-if-possible')).toBe(true);
});

test('does not concatenate seamlessly when a chunk is 4 frames or shorter', () => {
	expect(canConcatAudioSeamlessly('aac', 4, 'seamless-if-possible')).toBe(
		false,
	);
});

test('does not concatenate seamlessly with a codec other than AAC', () => {
	expect(canConcatAudioSeamlessly('mp3', 20, 'seamless-if-possible')).toBe(
		false,
	);
});

test('does not concatenate seamlessly with "encode-at-merge", even when AAC chunks could be', () => {
	expect(canConcatAudioSeamlessly('aac', 20, 'encode-at-merge')).toBe(false);
});
