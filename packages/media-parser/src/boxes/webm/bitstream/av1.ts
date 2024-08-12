import type {BufferIterator} from '../../../buffer-iterator';
import {combineUint8Arrays} from '../../../combine-uint8array';
import type {ParserContext} from '../../../parser-context';
import type {VideoSample} from '../../iso-base-media/mdat/mdat';
import {parseAv1Frame} from './av1/bitstream-frame';
import {
	parseAv1BitstreamHeaderSegment,
	type Av1BitstreamHeaderSegment,
} from './av1/header-segment';

type Av1BitstreamUimplementedSegment = {
	type: 'av1-bitstream-unimplemented';
};

export type Av1BitstreamSegment =
	| Av1BitstreamHeaderSegment
	| Av1BitstreamUimplementedSegment;

export const av1Bitstream = ({
	stream,
	length,
	onVideoSample,
	trackNumber,
	context,
	timecode,
}: {
	stream: BufferIterator;
	length: number;
	onVideoSample: (trackId: number, sample: VideoSample) => void;
	trackNumber: number;
	context: ParserContext;
	timecode: number;
}): {
	discarded: boolean;
	segment: Av1BitstreamSegment;
} => {
	const address = stream.counter.getOffset();

	stream.startReadingBits();

	// log this to understand:
	// (firstByte.toString(2).padStart(8, '0'));

	// get bit 0
	const obuForbiddenBit = stream.getBits(1);
	if (obuForbiddenBit) {
		throw new Error('obuForbiddenBit is not 0');
	}

	// get bits 1-3
	const obuType = stream.getBits(4);

	// get bit 4
	const obuExtensionFlag = stream.getBits(1);
	// get bit 5
	const obuHasSizeField = stream.getBits(1);
	// reserved bit
	stream.getBits(1);

	let size: number | null = null;

	if (obuExtensionFlag) {
		// extension
		stream.getBits(6);
	}

	if (obuHasSizeField) {
		// size
		size = stream.leb128();
	}

	/*
	console.log(
		address.toString(16),
		firstByte.toString(2).padStart(8, '0'),
		obuForbiddenBit,
		obuType,
		obuExtensionFlag,
		obuHasSizeField,
		reservedBit,
		size,
	);
	*/

	const bytesReadSoFar = stream.counter.getOffset() - address;

	const segment: Av1BitstreamSegment =
		obuType === 1
			? parseAv1BitstreamHeaderSegment(stream)
			: {
					type: 'av1-bitstream-unimplemented',
				};
	if (segment.type === 'av1-bitstream-header') {
		if (!size) {
			throw new Error('Expected size');
		}

		const toSample = bytesReadSoFar + size;
		stream.counter.decrement(stream.counter.getOffset() - address);
		const header = stream.getSlice(toSample);
		context.parserState.setAv1BitstreamHeaderSegment(segment, header);
	}

	if (obuType === 6) {
		const head = context.parserState.getAv1BitstreamHeaderSegment();
		if (!head) {
			throw new Error('Expected header segment');
		}

		const header = parseAv1Frame({
			stream,
			headerSegment: head.segment,
		});

		const bytesAdvanced = stream.counter.getOffset() - address;
		stream.counter.decrement(bytesAdvanced);
		if (size === null) {
			throw new Error('Expected size in OBU');
		}

		const clusterTimestamp = context.parserState.getClusterTimestamp();
		if (clusterTimestamp === null) {
			throw new Error('Expected cluster timestamp');
		}

		const toSlice = size + bytesReadSoFar;

		const frame = stream.getSlice(toSlice);
		let extraBytes: Uint8Array | null = null;
		if (!context.parserState.getIsFirstAv1FrameRead()) {
			context.parserState.setIsFirstAv1FrameRead();
			extraBytes =
				context.parserState.getAv1BitstreamHeaderSegment()?.header ?? null;
			if (!extraBytes) {
				throw new Error('Expected extra bytes');
			}
		}

		onVideoSample(trackNumber, {
			bytes: combineUint8Arrays(extraBytes, frame),
			timestamp: timecode + clusterTimestamp,
			duration: undefined,
			trackId: trackNumber,
			cts: null,
			dts: null,
			type: header.header.frameType === 'key' ? 'key' : 'delta',
		});
		stream.stopReadingBits();
		return {
			discarded: true,
			segment,
		};
	}

	stream.stopReadingBits();

	if (size === null) {
		return {
			discarded: false,
			segment,
		};
	}

	const end = stream.counter.getOffset();
	const remaining =
		(size === null ? length : size + bytesReadSoFar) - (end - address);

	if (remaining > 0) {
		stream.discard(remaining);
	}

	const remainingNow = length - (stream.counter.getOffset() - address);
	if (remainingNow > 0 && remainingNow <= 2) {
		throw new Error('remainingNow > 0 && remainingNow <= 2');
	}

	return {
		discarded: Boolean(size),
		segment,
	};
};
