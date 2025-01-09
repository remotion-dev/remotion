import {MediaParserInternals} from '@remotion/media-parser';
import {expect, test} from 'bun:test';
import {makeMatroskaBytes} from '../create/matroska/matroska-utils';

const state = MediaParserInternals.makeParserState({
	hasAudioTrackHandlers: false,
	hasVideoTrackHandlers: false,
	signal: undefined,
	getIterator: () => null,
	fields: {},
	onAudioTrack: null,
	onVideoTrack: null,
	supportsContentRange: true,
});

test('Should make Matroska header that is same as input', async () => {
	const headerOutput = makeMatroskaBytes({
		type: 'Header',
		minVintWidth: 1,
		value: [
			{
				type: 'EBMLVersion',
				value: {value: 1, byteLength: 1},
				minVintWidth: 1,
			},
			{
				type: 'EBMLReadVersion',
				value: {value: 1, byteLength: 1},
				minVintWidth: 1,
			},
			{
				type: 'EBMLMaxIDLength',
				value: {value: 4, byteLength: 1},
				minVintWidth: 1,
			},
			{
				type: 'EBMLMaxSizeLength',
				value: {value: 8, byteLength: 1},
				minVintWidth: 1,
			},
			{
				type: 'DocType',
				value: 'webm',
				minVintWidth: 1,
			},
			{
				type: 'DocTypeVersion',
				value: {value: 4, byteLength: 1},
				minVintWidth: 1,
			},
			{
				type: 'DocTypeReadVersion',
				value: {value: 2, byteLength: 1},
				minVintWidth: 1,
			},
		],
	});

	const iterator = MediaParserInternals.getArrayBufferIterator(
		headerOutput.bytes,
		headerOutput.bytes.length,
	);
	const parsed = await MediaParserInternals.parseEbml(iterator, state);

	expect(parsed).toEqual({
		type: 'Header',
		minVintWidth: 1,
		value: [
			{
				type: 'EBMLVersion',
				value: {value: 1, byteLength: 1},
				minVintWidth: 1,
			},
			{
				type: 'EBMLReadVersion',
				value: {value: 1, byteLength: 1},
				minVintWidth: 1,
			},
			{
				type: 'EBMLMaxIDLength',
				value: {value: 4, byteLength: 1},
				minVintWidth: 1,
			},
			{
				type: 'EBMLMaxSizeLength',
				value: {value: 8, byteLength: 1},
				minVintWidth: 1,
			},
			{
				type: 'DocType',
				value: 'webm',
				minVintWidth: 1,
			},
			{
				type: 'DocTypeVersion',
				value: {value: 4, byteLength: 1},
				minVintWidth: 1,
			},
			{
				type: 'DocTypeReadVersion',
				value: {value: 2, byteLength: 1},
				minVintWidth: 1,
			},
		],
	});
});
