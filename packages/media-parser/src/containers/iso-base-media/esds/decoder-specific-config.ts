import type {BufferIterator} from '../../../buffer-iterator';

type UnknownDecoderSpecificConfig = {
	type: 'unknown-decoder-specific-config';
};

type AudioSpecificConfig = {
	type: 'mp4a-specific-config';
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

	return {
		type: 'mp4a-specific-config',
		audioObjectType,
		samplingFrequencyIndex,
		channelConfiguration,
		asBytes: bytes,
	};
};
