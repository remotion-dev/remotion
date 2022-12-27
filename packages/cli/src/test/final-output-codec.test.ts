import type {CodecOrUndefined} from '@remotion/renderer';
import {describe, expect, test} from 'vitest';
import {getFinalOutputCodec} from '../get-final-output-codec';

describe('Codec tests valid codec input', () => {
	const validCodecInput: CodecOrUndefined[] = [
		'h264',
		'h265',
		'vp8',
		'vp9',
		'mp3',
		'aac',
		'wav',
		'h264-mkv',
	];
	validCodecInput.forEach((entry) =>
		test(`codec ${entry}`, () =>
			expect(
				getFinalOutputCodec({
					cliFlag: entry,
					outName: 'out',
					configFile: null,
					downloadName: null,
				})
			).toEqual({
				codec: entry,
				reason: 'from --codec flag',
			}))
	);
});

describe('Codec tests undefined codec input with known extension', () => {
	const codecExtensionCombination: [string, string][] = [
		['vp8', 'webm'],
		['h265', 'hevc'],
		['mp3', 'mp3'],
		['wav', 'wav'],
		['aac', 'aac'],
		['aac', 'm4a'],
	];
	codecExtensionCombination.forEach((entry) =>
		test(`${entry[1]} should be recognized as ${entry[0]}`, () => {
			return expect(
				getFinalOutputCodec({
					cliFlag: undefined,
					configFile: null,
					downloadName: null,
					outName: 'hi.' + entry[1],
				})
			).toEqual({
				codec: entry[0],
				reason: 'derived from out name',
			});
		})
	);
});

test('Codec tests undefined codec input with unknown extension', () => {
	expect(
		getFinalOutputCodec({
			cliFlag: undefined,
			outName: 'hi.',
			configFile: null,
			downloadName: null,
		})
	).toEqual({codec: 'h264', reason: 'default'});
	expect(
		getFinalOutputCodec({
			cliFlag: undefined,
			outName: 'hi.abc',
			configFile: null,
			downloadName: null,
		})
	).toEqual({codec: 'h264', reason: 'default'});
});
