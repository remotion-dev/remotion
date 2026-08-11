import type {Application, Frame, ParsedGif} from '../gifuct/types';
import {conditional, loop} from './parser';
import type {Stream} from './uint8-parser';
import {
	peekByte,
	peekBytes,
	readArray,
	readBits,
	readByte,
	readBytes,
	readString,
	readUnsigned,
} from './uint8-parser';

// a set of 0x00 terminated subblocks
const subBlocksSchema = {
	blocks: (stream: Stream) => {
		const terminator = 0x00;
		const chunks = [];
		const streamSize = stream.data.length;
		let total = 0;
		for (
			let size = readByte()(stream);
			size !== terminator;
			size = readByte()(stream)
		) {
			// size becomes undefined for some case when file is corrupted and  terminator is not proper
			// null check to avoid recursion
			if (!size) break;
			// catch corrupted files with no terminator
			if (stream.pos + size >= streamSize) {
				const availableSize = streamSize - stream.pos;
				chunks.push(readBytes(availableSize)(stream));
				total += availableSize;
				break;
			}

			chunks.push(readBytes(size)(stream));
			total += size;
		}

		const result = new Uint8Array(total);
		let offset = 0;
		for (let i = 0; i < chunks.length; i++) {
			result.set(chunks[i], offset);
			offset += chunks[i].length;
		}

		return result;
	},
};

// global control extension
const gceSchema = conditional(
	{
		gce: [
			{codes: readBytes(2)},
			{byteSize: readByte()},
			{
				extras: readBits({
					future: {index: 0, length: 3},
					disposal: {index: 3, length: 3},
					userInput: {index: 6},
					transparentColorGiven: {index: 7},
				}),
			},
			{delay: readUnsigned(true)},
			{transparentColorIndex: readByte()},
			{terminator: readByte()},
		],
	},
	(stream: Stream) => {
		const codes = peekBytes(2)(stream);
		return codes[0] === 0x21 && codes[1] === 0xf9;
	},
);

// image pipeline block
const imageSchema = conditional(
	{
		image: [
			{code: readByte()},
			{
				descriptor: [
					{left: readUnsigned(true)},
					{top: readUnsigned(true)},
					{width: readUnsigned(true)},
					{height: readUnsigned(true)},
					{
						lct: readBits({
							exists: {index: 0},
							interlaced: {index: 1},
							sort: {index: 2},
							future: {index: 3, length: 2},
							size: {index: 5, length: 3},
						}),
					},
				],
			},
			conditional(
				{
					lct: readArray<Frame['image']>(
						3,
						(
							_stream: Stream,
							_result: Frame['image'],
							parent: Frame['image'],
						) => {
							return 2 ** (parent.descriptor.lct.size + 1);
						},
					),
				},
				(_stream: Stream, _result: unknown, parent: Frame['image']) => {
					return parent.descriptor.lct.exists;
				},
			),
			{data: [{minCodeSize: readByte()}, subBlocksSchema]},
		],
	},
	(stream: Stream) => {
		return peekByte()(stream) === 0x2c;
	},
);

// plain text block
const textSchema = conditional(
	{
		text: [
			{codes: readBytes(2)},
			{blockSize: readByte()},
			{
				preData: (
					stream: Stream,
					_result: unknown,
					parent: {text: {blockSize: number}},
				) => readBytes(parent.text.blockSize)(stream),
			},
			subBlocksSchema,
		],
	},
	(stream: Stream) => {
		const codes = peekBytes(2)(stream);
		return codes[0] === 0x21 && codes[1] === 0x01;
	},
);

// application block
const applicationSchema = conditional(
	{
		application: [
			{codes: readBytes(2)},
			{blockSize: readByte()},
			{
				id: (
					stream: Stream,
					_result: unknown,
					parent: Application['application'],
				) => readString(parent.blockSize)(stream),
			},
			subBlocksSchema,
		],
	},
	(stream: Stream) => {
		const codes = peekBytes(2)(stream);
		return codes[0] === 0x21 && codes[1] === 0xff;
	},
);

// comment block
const commentSchema = conditional(
	{
		comment: [{codes: readBytes(2)}, subBlocksSchema],
	},
	(stream: Stream) => {
		const codes = peekBytes(2)(stream);
		return codes[0] === 0x21 && codes[1] === 0xfe;
	},
);

export const GIF = [
	{header: [{signature: readString(3)}, {version: readString(3)}]},
	{
		lsd: [
			{width: readUnsigned(true)},
			{height: readUnsigned(true)},
			{
				gct: readBits({
					exists: {index: 0},
					resolution: {index: 1, length: 3},
					sort: {index: 4},
					size: {index: 5, length: 3},
				}),
			},
			{backgroundColorIndex: readByte()},
			{pixelAspectRatio: readByte()},
		],
	},
	conditional(
		{
			gct: readArray(
				3,
				(_stream, result: ParsedGif) => 2 ** (result.lsd.gct.size + 1),
			),
		},
		(_stream: Stream, result: ParsedGif) => result.lsd.gct.exists,
	),
	// content frames
	{
		frames: loop(
			[gceSchema, applicationSchema, commentSchema, imageSchema, textSchema],
			(stream: Stream) => {
				const nextCode = peekByte()(stream);
				// rather than check for a terminator, we should check for the existence
				// of an ext or image block to avoid infinite loops
				// var terminator = 0x3B;
				// return nextCode !== terminator;
				return nextCode === 0x21 || nextCode === 0x2c;
			},
		),
	},
];
