import type {Codec, CodecOrUndefined} from '@remotion/renderer';
import {BrowserSafeApis} from '@remotion/renderer/client';
import {describe, expect, test} from 'bun:test';

const {videoCodecOption} = BrowserSafeApis.options;

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
				videoCodecOption.getValue(
					{commandLine: {codec: entry}},
					{
						outName: 'out',
						configFile: null,
						downloadName: null,
						uiCodec: null,
						compositionCodec: null,
					},
				),
			).toEqual({
				value: entry!,
				source: 'from --codec flag',
			})),
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
				videoCodecOption.getValue(
					{
						commandLine: {},
					},
					{
						configFile: null,
						downloadName: null,
						outName: 'hi.' + entry[1],
						uiCodec: null,
						compositionCodec: null,
					},
				),
			).toEqual({
				value: entry[0] as Codec,
				source: 'derived from out name',
			});
		}),
	);
});

test('Codec tests undefined codec input with unknown extension', () => {
	expect(
		videoCodecOption.getValue(
			{
				commandLine: {},
			},
			{
				outName: 'hi.',
				configFile: null,
				downloadName: null,
				uiCodec: null,
				compositionCodec: null,
			},
		),
	).toEqual({value: 'h264', source: 'default'});
	expect(
		videoCodecOption.getValue(
			{
				commandLine: {},
			},
			{
				outName: 'hi.abc',
				configFile: null,
				downloadName: null,
				uiCodec: null,
				compositionCodec: null,
			},
		),
	).toEqual({value: 'h264', source: 'default'});
});
