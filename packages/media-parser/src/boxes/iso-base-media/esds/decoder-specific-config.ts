import type {BufferIterator} from '../../../buffer-iterator';

type UnknownDecoderSpecificConfig = {
	type: 'unknown-decoder-specific-config';
};

type AudioSpecificConfig = {
	type: 'audio-specific-config';
	audioObjectType: number;
	samplingFrequencyIndex: number;
	channelConfiguration: number;
	asBytes: Uint8Array;
};

export type DecoderSpecificConfig =
	| UnknownDecoderSpecificConfig
	| AudioSpecificConfig;

export const parseDecoderSpecificConfig = (
	iterator: BufferIterator,
): DecoderSpecificConfig => {
	const layerTag = iterator.getUint8();
	const layerSize = iterator.getPaddedFourByteNumber();

	const start = iterator.counter.getOffset();

	if (layerTag !== 5) {
		iterator.discard(layerSize);
		return {
			type: 'unknown-decoder-specific-config',
		};
	}

	// https://csclub.uwaterloo.ca/~pbarfuss/ISO14496-3-2009.pdf
	// 1.6.2.1 AudioSpecificConfig

	const bytes = iterator.getSlice(layerSize);
	iterator.counter.decrement(layerSize);

	iterator.startReadingBits();
	const audioObjectType = iterator.getBits(5);
	const samplingFrequencyIndex = iterator.getBits(4);
	if (samplingFrequencyIndex === 0xf) {
		iterator.getBits(24);
	}

	const channelConfiguration = iterator.getBits(4);
	iterator.stopReadingBits();
	const read = iterator.counter.getOffset() - start;
	if (read < layerSize) {
		iterator.discard(layerSize - read);
	}

	// Working around Chrome bug
	// https://issues.chromium.org/issues/360083330#comment5
	const patchedAsBytes =
		bytes.byteLength === 2 && bytes[0] === 17 && bytes[1] === 136
			? new Uint8Array([17, 144])
			: bytes;

	return {
		type: 'audio-specific-config',
		audioObjectType,
		samplingFrequencyIndex,
		channelConfiguration,
		asBytes: patchedAsBytes,
	};
};
