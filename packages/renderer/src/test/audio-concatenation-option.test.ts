import {expect, test} from 'bun:test';
import {audioConcatenationOption} from '../options/audio-concatenation';

test('audio concatenation defaults to seamless-if-possible without a CLI flag', () => {
	expect(audioConcatenationOption.getValue({commandLine: {}})).toEqual({
		source: 'default',
		value: 'seamless-if-possible',
	});
});

test('audio concatenation takes the value of --audio-concatenation', () => {
	expect(
		audioConcatenationOption.getValue({
			commandLine: {'audio-concatenation': 'encode-at-merge'},
		}),
	).toEqual({source: 'cli', value: 'encode-at-merge'});
});

test('audio concatenation rejects an unknown --audio-concatenation value', () => {
	expect(() =>
		audioConcatenationOption.getValue({
			commandLine: {'audio-concatenation': 'reencode'},
		}),
	).toThrow(
		`'audioConcatenation' must be one of "seamless-if-possible", "encode-at-merge", but got "reencode"`,
	);
});
