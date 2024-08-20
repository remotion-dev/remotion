import {expect, test} from 'bun:test';
import {makeMatroskaBytes} from '../boxes/webm/make-header';
import {parseEbml} from '../boxes/webm/parse-ebml';
import {
	matroskaElements,
	matroskaHeader,
	seek,
	seekHead,
	seekId,
	seekPosition,
} from '../boxes/webm/segments/all-segments';
import {getArrayBufferIterator} from '../buffer-iterator';
import type {ParserContext} from '../parser-context';
import {makeParserState} from '../parser-state';

const state = makeParserState({
	hasAudioCallbacks: false,
	hasVideoCallbacks: false,
	signal: undefined,
});

const options: ParserContext = {
	canSkipVideoData: true,
	onAudioTrack: null,
	onVideoTrack: null,
	parserState: state,
};

test('Should make Matroska header that is same as input', async () => {
	const headerOutput = makeMatroskaBytes(matroskaHeader, {
		EBMLVersion: 1,
		DocTypeReadVersion: 2,
		EBMLMaxIDLength: 4,
		EBMLMaxSizeLength: 8,
		DocType: 'webm',
		DocTypeVersion: 4,
		EBMLReadVersion: 1,
	});

	const iterator = getArrayBufferIterator(headerOutput, headerOutput.length);
	const parsed = await parseEbml(iterator, options);

	expect(parsed).toEqual({
		type: 'Header',
		value: [
			{
				type: 'EBMLVersion',
				value: 1,
			},
			{
				type: 'EBMLReadVersion',
				value: 1,
			},
			{
				type: 'EBMLMaxIDLength',
				value: 4,
			},
			{
				type: 'EBMLMaxSizeLength',
				value: 8,
			},
			{
				type: 'DocType',
				value: 'webm',
			},
			{
				type: 'DocTypeVersion',
				value: 4,
			},
			{
				type: 'DocTypeReadVersion',
				value: 2,
			},
		],
	});
});

test('Should be able to create SeekIdBox', async () => {
	const file = new Uint8Array(
		await Bun.file('vp8-segments/56-0x53ab').arrayBuffer(),
	);

	const custom = makeMatroskaBytes(seekId, '0x1549a966');
	expect(custom).toEqual(file);
});

test('Should be able to create Seek', async () => {
	const file = new Uint8Array(
		await Bun.file('vp8-segments/53-0x4dbb').arrayBuffer(),
	);

	const seekPositionBytes = makeMatroskaBytes(seekPosition, 0x40);

	const custom = makeMatroskaBytes(seek, {
		SeekID: '0x1549a966',
		SeekPosition: seekPositionBytes,
	});
	expect(custom).toEqual(file);
});

test('Should parse seekHead', async () => {
	const file = new Uint8Array(
		await Bun.file('vp8-segments/2165155-0x114d9b74').arrayBuffer(),
	);

	const seekPosBytes = makeMatroskaBytes(seekPosition, 3911);

	const custom = makeMatroskaBytes(seekHead, {
		Seek: {
			SeekID: matroskaElements.Cluster,
			SeekPosition: seekPosBytes,
		},
	});
	expect(custom).toEqual(file);

	const iterator = getArrayBufferIterator(file, file.length);
	const parsed = await parseEbml(iterator, options);

	expect(parsed).toEqual({
		type: 'SeekHead',
		value: [
			{
				type: 'Seek',
				value: [
					{
						type: 'SeekID',
						value: '0x1f43b675',
					},
					{
						type: 'SeekPosition',
						value: 3911,
					},
				],
			},
		],
	});
});
