import {
	getArrayBufferIterator,
	type BufferIterator,
} from '../../buffer-iterator';
import {convertAudioOrVideoSampleToWebCodecsTimestamps} from '../../convert-audio-or-video-sample';
import type {ParseResult} from '../../parse-result';
import type {ParserState} from '../../state/parser-state';
import {getBlockSize} from './get-block-size';
import {getChannelCount} from './get-channel-count';
import {getSampleRate} from './get-sample-rate';

// https://www.rfc-editor.org/rfc/rfc9639.html#section-9.1.1

function calculateCRC8(data: Uint8Array) {
	const polynomial = 0x07; // x^8 + x^2 + x^1 + x^0
	let crc = 0x00; // Initialize CRC to 0

	for (const byte of data) {
		crc ^= byte; // XOR byte into least significant byte of crc

		for (let i = 0; i < 8; i++) {
			// For each bit in the byte
			if ((crc & 0x80) !== 0) {
				// If the leftmost bit (MSB) is set
				crc = (crc << 1) ^ polynomial; // Shift left and XOR with polynomial
			} else {
				crc <<= 1; // Just shift left
			}

			crc &= 0xff; // Ensure CRC remains 8-bit
		}
	}

	return crc;
}

export const parseFrameHeader = ({
	iterator,
	state,
}: {
	iterator: BufferIterator;
	state: ParserState;
}) => {
	if (iterator.bytesRemaining() < 10) {
		return null;
	}

	const startOffset = iterator.counter.getOffset();
	iterator.discard(2); // sync code
	iterator.startReadingBits();
	const blockSizeBits = getBlockSize(iterator);
	const sampleRateBits = getSampleRate(iterator, state);
	getChannelCount(iterator); // channel count
	iterator.getBits(3); // bit depth
	iterator.getBits(1);
	const num = iterator.getFlacCodecNumber();
	const blockSize =
		blockSizeBits === 'uncommon-u16'
			? iterator.getBits(16) + 1
			: blockSizeBits === 'uncommon-u8'
				? iterator.getBits(8) + 1
				: blockSizeBits;
	const sampleRate =
		sampleRateBits === 'uncommon-u16'
			? iterator.getBits(16)
			: sampleRateBits === 'uncommon-u16-10'
				? iterator.getBits(16) * 10
				: sampleRateBits === 'uncommon-u8'
					? iterator.getBits(8)
					: sampleRateBits;
	iterator.stopReadingBits();
	const size = iterator.counter.getOffset() - startOffset;
	const crc = iterator.getUint8();
	iterator.counter.decrement(size + 1);

	const crcCalculated = calculateCRC8(iterator.getSlice(size));
	iterator.counter.decrement(size);
	if (crcCalculated !== crc) {
		return null;
	}

	return {num, blockSize, sampleRate};
};

const emitSample = async ({
	state,
	data,
	offset,
}: {
	state: ParserState;
	data: Uint8Array;
	offset: number;
}) => {
	const iterator = getArrayBufferIterator(data, null);
	const parsed = parseFrameHeader({iterator, state});
	if (!parsed) {
		throw new Error('Invalid CRC');
	}

	const {blockSize, num, sampleRate} = parsed;

	const duration = blockSize / sampleRate;
	const structure = state.getFlacStructure();
	const streamInfo = structure.boxes.find(
		(box) => box.type === 'flac-streaminfo',
	);
	if (!streamInfo) {
		throw new Error('Stream info not found');
	}

	if (streamInfo.minimumBlockSize !== streamInfo.maximumBlockSize) {
		throw new Error('Cannot determine timestamp');
	}

	const timestamp = (num * streamInfo.maximumBlockSize) / streamInfo.sampleRate;

	await state.callbacks.onAudioSample(
		0,
		convertAudioOrVideoSampleToWebCodecsTimestamps(
			{
				data,
				duration,
				cts: timestamp,
				dts: timestamp,
				timestamp,
				type: 'key',
				offset,
				timescale: 1_000_000,
				trackId: 0,
			},
			1,
		),
	);

	iterator.destroy();
};

export const parseFlacFrame = async ({
	state,
	iterator,
}: {
	state: ParserState;
	iterator: BufferIterator;
}): Promise<ParseResult> => {
	const blockingBit = state.flac.getBlockingBitStrategy();
	const offset = iterator.counter.getOffset();
	const {returnToCheckpoint} = iterator.startCheckpoint();
	iterator.startReadingBits();

	if (blockingBit === undefined) {
		const bits = iterator.getBits(15);
		if (bits !== 0b111111111111100) {
			throw new Error('Invalid sync code');
		}

		state.flac.setBlockingBitStrategy(iterator.getBits(1));
	} else if (blockingBit === 1) {
		const bits = iterator.getBits(16);
		if (bits !== 0b1111111111111001) {
			throw new Error('Blocking bit changed, it should not');
		}
	} else if (blockingBit === 0) {
		const bits = iterator.getBits(16);
		if (bits !== 0b1111111111111000) {
			throw new Error('Blocking bit changed, it should not');
		}
	}

	const setBlockingBit = state.flac.getBlockingBitStrategy();
	if (setBlockingBit === undefined) {
		throw new Error('Blocking bit should be set');
	}

	iterator.stopReadingBits();

	const structure = state.getFlacStructure();

	const minimumFrameSize =
		structure.boxes.find((b) => b.type === 'flac-streaminfo')
			?.minimumFrameSize ?? null;
	if (minimumFrameSize === null) {
		throw new Error('Expected flac-streaminfo');
	}

	if (minimumFrameSize !== 0) {
		iterator.getSlice(minimumFrameSize - 2);
	}

	while (true) {
		if (iterator.counter.getOffset() === state.contentLength) {
			const size = iterator.counter.getOffset() - offset;
			returnToCheckpoint();

			const slice = iterator.getSlice(size);
			await emitSample({state, data: slice, offset});
			break;
		}

		if (iterator.bytesRemaining() === 0) {
			returnToCheckpoint();
			break;
		}

		const nextByte = iterator.getUint8();
		if (nextByte === 0xff) {
			const nextBits = iterator.getUint8();
			const expected = setBlockingBit === 1 ? 0b1111_1001 : 0b1111_1000;
			if (nextBits !== expected) {
				iterator.counter.decrement(1);
				continue;
			}

			iterator.counter.decrement(2);
			const nextIsLegit = parseFrameHeader({iterator, state});
			if (!nextIsLegit) {
				iterator.discard(1);
				continue;
			}

			const size = iterator.counter.getOffset() - offset;
			returnToCheckpoint();
			const data = iterator.getSlice(size);
			await emitSample({state, data, offset});
			break;
		}
	}

	return null;
};
