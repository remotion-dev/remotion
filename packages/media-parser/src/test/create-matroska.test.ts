/* eslint-disable padding-line-between-statements */
/* eslint-disable max-depth */
import {expect, test} from 'bun:test';
import {combineUint8Arrays, makeMatroskaBytes} from '../boxes/webm/make-header';
import {parseEbml} from '../boxes/webm/parse-ebml';
import type {MatroskaSegment} from '../boxes/webm/segments';
import type {
	MainSegment,
	TrackEntry,
} from '../boxes/webm/segments/all-segments';
import {getArrayBufferIterator} from '../buffer-iterator';
import {nodeReader} from '../from-node';
import {parseMedia} from '../parse-media';
import type {AnySegment} from '../parse-result';
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
	nullifySamples: false,
};

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

	const iterator = getArrayBufferIterator(headerOutput, headerOutput.length);
	const parsed = await parseEbml(iterator, options);

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

test('Should be able to create SeekIdBox', async () => {
	const file = new Uint8Array(
		await Bun.file('vp8-segments/56-0x53ab').arrayBuffer(),
	);

	const custom = makeMatroskaBytes({
		type: 'SeekID',
		value: '0x1549a966',
		minVintWidth: 1,
	});
	expect(custom).toEqual(file);
});

test('Should be able to create Seek', async () => {
	const file = new Uint8Array(
		await Bun.file('vp8-segments/53-0x4dbb').arrayBuffer(),
	);
	const parsed = await parseEbml(getArrayBufferIterator(file, null), options);
	expect(parsed).toEqual({
		type: 'Seek',
		value: [
			{
				type: 'SeekID',
				value: '0x1549a966',
				minVintWidth: 1,
			},
			{
				type: 'SeekPosition',
				value: {value: 0x40, byteLength: 1},
				minVintWidth: 1,
			},
		],
		minVintWidth: 1,
	});

	const custom = makeMatroskaBytes(parsed);
	expect(custom).toEqual(file);
});

test('Should parse seekHead', async () => {
	const file = new Uint8Array(
		await Bun.file('vp8-segments/2165155-0x114d9b74').arrayBuffer(),
	);

	const seekPosition = makeMatroskaBytes({
		type: 'SeekPosition',
		value: {value: 3911, byteLength: 2},
		minVintWidth: 1,
	});

	const custom = makeMatroskaBytes({
		type: 'SeekHead',
		value: [
			{
				type: 'Seek',
				value: [
					{
						type: 'SeekID',
						value: '0x1f43b675',
						minVintWidth: 1,
					},
					seekPosition,
				],
				minVintWidth: 1,
			},
		],
		minVintWidth: 1,
	});
	expect(custom).toEqual(file);

	const iterator = getArrayBufferIterator(file, file.length);
	const parsed = await parseEbml(iterator, options);

	expect(parsed).toEqual({
		minVintWidth: 1,
		type: 'SeekHead',
		value: [
			{
				minVintWidth: 1,
				type: 'Seek',
				value: [
					{minVintWidth: 1, type: 'SeekID', value: '0x1f43b675'},
					{
						minVintWidth: 1,
						type: 'SeekPosition',
						value: {value: 3911, byteLength: 2},
					},
				],
			},
		],
	});
});

const parseWebm = async (str: string) => {
	const {boxes} = await parseMedia({
		src: str,
		fields: {
			boxes: true,
		},
		reader: nodeReader,
	});
	return boxes;
};

const stringifyWebm = (boxes: AnySegment[]) => {
	const buffers: Uint8Array[] = [];
	for (const box of boxes) {
		const bytes = makeMatroskaBytes(box as MatroskaSegment);
		buffers.push(bytes);
	}

	const combined = combineUint8Arrays(buffers);
	return combined;
};

test('Can we disassemble a Matroska file and assembled it again', async () => {
	process.env.KEEP_SAMPLES = 'true';

	const parsed = await parseWebm('input.webm');

	const segment = parsed.find((s) => s.type === 'Segment') as MainSegment;
	const tracks = segment.value.flatMap((s) =>
		s.type === 'Tracks' ? s.value.filter((a) => a.type === 'TrackEntry') : [],
	);
	for (const track of tracks as TrackEntry[]) {
		for (const child of track.value) {
			if (child.type === 'Video') {
				for (const attribute of child.value) {
					if (attribute.type === 'DisplayHeight') {
						attribute.value.value *= 2;
					}
				}
			}
		}
	}

	const bytes = await Bun.file('input.webm').arrayBuffer();
	expect(stringifyWebm(parsed).byteLength).toEqual(
		new Uint8Array(bytes).byteLength,
	);
});
